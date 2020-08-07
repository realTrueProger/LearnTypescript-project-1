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

interface Project {
    title: string;
    description: string;
    people: number;
    id?: string;
}

class AppState {
    private listeners: Function[] = [];
    private projects: Project[] = [];
    private static instance: AppState;

    private constructor() {}

    public addListener(listenerFn: Function) {
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

    public addProject(project: Project) {
        const projectToAdd = {
            ...project,
            id: Math.random().toString(),
        };
        this.projects.push(projectToAdd);

        for(const listener of this.listeners) {
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
    listType: 'active' | 'finished';
    projectList: Project[] = [];

    constructor(listType: 'active' | 'finished') {
        this.listType = listType;
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.appRootElement = document.getElementById('app')! as HTMLDivElement;
        this.sectionElement = this.getSectionFromTemplate();
        this.sectionElement.id = `${this.listType}-projects`;

        state.addListener((projectList: Project[]) => {
            this.projectList = projectList;
            this.fillProjectList();
        });

        this.renderHtml();
        this.fillHeader();
    }

    private fillProjectList() {
        const ul = this.sectionElement.querySelector('ul')! as HTMLUListElement;
        for(const project of this.projectList) {
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            ul.appendChild(listItem);
        }
    }

    private fillHeader() {
        const header = this.sectionElement.querySelector('h2')!;
        header.textContent = `${this.listType} projects`.toUpperCase();
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
        const userInput: Project = this.collectUserInput();
        this.clearInput();

        state.addProject(userInput);
        console.log(state.projectList);
    }

    private collectUserInput(): Project {
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
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');