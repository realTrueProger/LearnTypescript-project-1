// Autobind Decorator
function Autobind(target: any, methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };

    return adjustedDescriptor;
}

enum ProjectStatus { ACTIVE, FINISHED}

interface Draggable {
    dragStartHandler(e: DragEvent): void;

    dragEndHandler(e: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(e: DragEvent): void;

    dropHandler(e: DragEvent): void;

    dragLeaveHandler(e: DragEvent): void;
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {
    }
}

interface UserInput {
    title: string,
    description: string,
    people: number,
}

type Listener = (items: Project[]) => void;

// Application state singleton class
class AppState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: AppState;

    private constructor() {
    }

    public addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new AppState();
            return this.instance;
        }
    }

    public addProject({title, description, people}: UserInput) {
        const projectToAdd = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.ACTIVE);

        this.projects.push(projectToAdd);

        this.runListeners();
    }

    get projectList() {
        return [...this.projects];
    }

    private runListeners() {
        for (const listener of this.listeners) {
            listener([...this.projectList]);
        }
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const movableProject = this.projects.find(prj => prj.id === projectId);
        if (movableProject) {
            movableProject.status = newStatus;
            this.runListeners();
        }
    }
}

const state = AppState.getInstance();

// Component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    protected templateElement: HTMLTemplateElement;
    protected appRootElement: T;
    protected templateRoot: U;
    protected renderPosition: InsertPosition;

    protected constructor(templateId: string, rootId: string, renderPosition: InsertPosition) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.appRootElement = document.getElementById(rootId)! as T;
        this.templateRoot = this.getTemplateRoot()! as U;
        this.renderPosition = renderPosition;
        this.renderHtml();
    }

    private getTemplateRoot() {
        const templateContent = document.importNode(this.templateElement.content, true);
        return templateContent.firstElementChild;
    }

    protected renderHtml() {
        this.appRootElement.insertAdjacentElement(this.renderPosition, this.templateRoot);
    }
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    id: string;

    constructor(project: Project, rootId: string) {
        super('single-project', rootId, 'beforeend');
        this.id = project.id;
        this.templateRoot.innerHTML = `Title: ${project.title}
         Description: ${project.description} People: ${project.people}`;

        this.templateRoot.addEventListener('dragstart', this.dragStartHandler);
        this.templateRoot.addEventListener('dragend', this.dragEndHandler);
    }

    @Autobind
    dragStartHandler(e: DragEvent): void {
        e.dataTransfer!.setData('text/plain', this.id);
        e.dataTransfer!.effectAllowed = 'move';
    }

    @Autobind
    dragEndHandler(e: DragEvent): void {
    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    listType: ProjectStatus;
    projectList: Project[] = [];

    constructor(listType: ProjectStatus) {
        super('project-list', 'app', 'beforeend');
        this.listType = listType;
        this.setSectionId();

        state.addListener((projectList: Project[]) => {
            this.projectList = projectList.filter(project => project.status === this.listType);
            this.fillProjectList();
        });

        this.fillHeader();
        this.templateRoot.addEventListener('dragover', this.dragOverHandler);
        this.templateRoot.addEventListener('drop', this.dropHandler);
        this.templateRoot.addEventListener('dragleave', this.dragLeaveHandler);
    }

    private setSectionId() {
        this.templateRoot.id = this.listType === ProjectStatus.ACTIVE ? 'active-projects' : 'finished-projects';
        this.templateRoot.querySelector('ul')!.id = this.listType === ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
    }

    @Autobind
    dragOverHandler(e: DragEvent): void {
        e.preventDefault();
        const ul = this.templateRoot.querySelector('ul')!;
        ul.classList.add('droppable');
    }

    @Autobind
    dropHandler(e: DragEvent): void {
        const projectId = e.dataTransfer!.getData('text/plain');
        state.moveProject(projectId, this.listType === ProjectStatus.FINISHED ? ProjectStatus.FINISHED : ProjectStatus.ACTIVE);
    }

    @Autobind
    dragLeaveHandler(e: DragEvent): void {
        const ul = this.templateRoot.querySelector('ul')!;
        ul.classList.remove('droppable');
    }

    private fillProjectList() {
        const ul = this.templateRoot.querySelector('ul')! as HTMLUListElement;
        ul.innerHTML = '';
        for (const project of this.projectList) {
            const root = project.status === ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
            new ProjectItem(project, root);
        }
    }

    private fillHeader() {
        const header = this.templateRoot.querySelector('h2')!;
        const headerText = this.listType === ProjectStatus.ACTIVE ? 'active projects' : 'finished projects';
        header.textContent = headerText.toUpperCase();
    }
}

class ProjectInputForm extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', 'afterbegin');

        this.titleInputElement = this.templateRoot.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.templateRoot.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.templateRoot.querySelector('#people')! as HTMLInputElement;

        this.templateRoot.addEventListener('submit', this.submitHandler);
    }

    @Autobind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.collectUserInput();
        this.clearInput();

        state.addProject(userInput);
    }

    private collectUserInput(): UserInput {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = +this.peopleInputElement.value;

        return {title, description, people};
    }

    private clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
}

const projectInput = new ProjectInputForm();
const activeProjectList = new ProjectList(ProjectStatus.ACTIVE);
const finishedProjectList = new ProjectList(ProjectStatus.FINISHED);