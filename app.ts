// autobind Decorator
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

class ProjectList {
    templateElement: HTMLTemplateElement;
    appRootElement: HTMLDivElement;
    sectionElement: HTMLElement;
    listType: 'active' | 'finished';

    constructor(listType: 'active' | 'finished') {
        this.listType = listType;
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
        this.appRootElement = document.getElementById('app')! as HTMLDivElement;
        this.sectionElement = this.getSectionFromTemplate();
        this.sectionElement.id = `${this.listType}-projects`;

        this.renderHtml();
        this.fillWithContent();
    }

    private fillWithContent() {
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
        const userInput = this.collectUserInput();
        this.clearInput();
        console.log(userInput);
    }

    private collectUserInput(): [string, string, number] {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;

        return [title, description, +people];
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