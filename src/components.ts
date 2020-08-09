namespace App {
    // Component base class
    export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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

    export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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

    export class ProjectInputForm extends Component<HTMLDivElement, HTMLFormElement> {
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
}