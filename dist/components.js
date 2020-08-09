var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autobind } from './autoBindDecorator.js';
import { state } from "./state.js";
import { ProjectStatus } from "./types.js";
// Component base class
export class Component {
    constructor(templateId, rootId, renderPosition) {
        this.templateElement = document.getElementById(templateId);
        this.appRootElement = document.getElementById(rootId);
        this.templateRoot = this.getTemplateRoot();
        this.renderPosition = renderPosition;
        this.renderHtml();
    }
    getTemplateRoot() {
        const templateContent = document.importNode(this.templateElement.content, true);
        return templateContent.firstElementChild;
    }
    renderHtml() {
        this.appRootElement.insertAdjacentElement(this.renderPosition, this.templateRoot);
    }
}
export class ProjectItem extends Component {
    constructor(project, rootId) {
        super('single-project', rootId, 'beforeend');
        this.id = project.id;
        this.templateRoot.innerHTML = `Title: ${project.title}
         Description: ${project.description} People: ${project.people}`;
        this.templateRoot.addEventListener('dragstart', this.dragStartHandler);
        this.templateRoot.addEventListener('dragend', this.dragEndHandler);
    }
    dragStartHandler(e) {
        e.dataTransfer.setData('text/plain', this.id);
        e.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(e) {
    }
}
__decorate([
    Autobind
], ProjectItem.prototype, "dragStartHandler", null);
__decorate([
    Autobind
], ProjectItem.prototype, "dragEndHandler", null);
export class ProjectList extends Component {
    constructor(listType) {
        super('project-list', 'app', 'beforeend');
        this.projectList = [];
        this.listType = listType;
        this.setSectionId();
        state.addListener((projectList) => {
            this.projectList = projectList.filter(project => project.status === this.listType);
            this.fillProjectList();
        });
        this.fillHeader();
        this.templateRoot.addEventListener('dragover', this.dragOverHandler);
        this.templateRoot.addEventListener('drop', this.dropHandler);
        this.templateRoot.addEventListener('dragleave', this.dragLeaveHandler);
    }
    setSectionId() {
        this.templateRoot.id = this.listType === ProjectStatus.ACTIVE ? 'active-projects' : 'finished-projects';
        this.templateRoot.querySelector('ul').id = this.listType === ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
    }
    dragOverHandler(e) {
        e.preventDefault();
        const ul = this.templateRoot.querySelector('ul');
        ul.classList.add('droppable');
    }
    dropHandler(e) {
        const projectId = e.dataTransfer.getData('text/plain');
        state.moveProject(projectId, this.listType === ProjectStatus.FINISHED ? ProjectStatus.FINISHED : ProjectStatus.ACTIVE);
    }
    dragLeaveHandler(e) {
        const ul = this.templateRoot.querySelector('ul');
        ul.classList.remove('droppable');
    }
    fillProjectList() {
        const ul = this.templateRoot.querySelector('ul');
        ul.innerHTML = '';
        for (const project of this.projectList) {
            const root = project.status === ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
            new ProjectItem(project, root);
        }
    }
    fillHeader() {
        const header = this.templateRoot.querySelector('h2');
        const headerText = this.listType === ProjectStatus.ACTIVE ? 'active projects' : 'finished projects';
        header.textContent = headerText.toUpperCase();
    }
}
__decorate([
    Autobind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    Autobind
], ProjectList.prototype, "dragLeaveHandler", null);
export class ProjectInputForm extends Component {
    constructor() {
        super('project-input', 'app', 'afterbegin');
        this.titleInputElement = this.templateRoot.querySelector('#title');
        this.descriptionInputElement = this.templateRoot.querySelector('#description');
        this.peopleInputElement = this.templateRoot.querySelector('#people');
        this.templateRoot.addEventListener('submit', this.submitHandler);
    }
    submitHandler(e) {
        e.preventDefault();
        const userInput = this.collectUserInput();
        this.clearInput();
        state.addProject(userInput);
    }
    collectUserInput() {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = +this.peopleInputElement.value;
        return { title, description, people };
    }
    clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
}
__decorate([
    Autobind
], ProjectInputForm.prototype, "submitHandler", null);
//# sourceMappingURL=components.js.map