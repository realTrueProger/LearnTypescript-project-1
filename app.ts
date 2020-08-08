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

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {
    }
}

interface UserInput  {
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

    public addProject({title, description, people}: UserInput ) {
        const projectToAdd = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.ACTIVE);

        this.projects.push(projectToAdd);

        for (const listener of this.listeners) {
            listener([...this.projectList]);
        }
    }

    get projectList() {
        return [...this.projects];
    }
}

const state = AppState.getInstance();


class ProjectList {
    templateElement: HTMLTemplateElement;
    appRootElement: HTMLDivElement;
    sectionElement: HTMLElement;
    listType: ProjectStatus;
    projectList: Project[] = [];

    constructor(listType: ProjectStatus) {
        this.listType = listType;
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.appRootElement = document.getElementById('app')! as HTMLDivElement;
        this.sectionElement = this.getSectionFromTemplate();
        this.setSectionId();

        state.addListener((projectList: Project[]) => {
            this.projectList = projectList.filter(project => project.status === this.listType);
            this.fillProjectList();
        });

        this.renderHtml();
        this.fillHeader();
    }

    private setSectionId() {
        this.sectionElement.id = this.listType === ProjectStatus.ACTIVE ? 'active-projects' : 'finished-projects';
    }

    private fillProjectList() {
        const ul = this.sectionElement.querySelector('ul')! as HTMLUListElement;
        ul.innerHTML = '';
        for (const project of this.projectList) {
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            ul.appendChild(listItem);
        }
    }

    private fillHeader() {
        const header = this.sectionElement.querySelector('h2')!;
        const headerText = this.listType === ProjectStatus.ACTIVE ? 'active projects' : 'finished projects';
        header.textContent = headerText.toUpperCase();
    }

    private getSectionFromTemplate() {
        const templateContent = document.importNode(this.templateElement.content, true);
        return templateContent.firstElementChild as HTMLElement;
    }

    private renderHtml() {
        this.appRootElement.insertAdjacentElement('beforeend', this.sectionElement);
    }
}

class ProjectInputForm {
    templateElement: HTMLTemplateElement;
    appRootElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.appRootElement = document.getElementById('app')! as HTMLDivElement;
        this.formElement = this.getFormFromTemplate();

        this.titleInputElement = this.formElement.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector('#people')! as HTMLInputElement;

        this.formElement.addEventListener('submit', this.submitHandler);

        this.renderHtml();
    }

    @Autobind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.collectUserInput();
        this.clearInput();

        state.addProject(userInput);
        console.log(state.projectList);
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

    private getFormFromTemplate() {
        const templateContent = document.importNode(this.templateElement.content, true);
        return templateContent.firstElementChild as HTMLFormElement;
    }

    private renderHtml() {
        this.appRootElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

const projectInput = new ProjectInputForm();
const activeProjectList = new ProjectList(ProjectStatus.ACTIVE);
const finishedProjectList = new ProjectList(ProjectStatus.FINISHED);