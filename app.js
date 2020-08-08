"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// Autobind Decorator
function Autobind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjustedDescriptor;
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
    ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
// Application state singleton class
class AppState {
    constructor() {
        this.listeners = [];
        this.projects = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new AppState();
            return this.instance;
        }
    }
    addProject({ title, description, people }) {
        const projectToAdd = new Project(Math.random().toString(), title, description, people, ProjectStatus.ACTIVE);
        this.projects.push(projectToAdd);
        this.runListeners();
    }
    get projectList() {
        return [...this.projects];
    }
    runListeners() {
        for (const listener of this.listeners) {
            listener([...this.projectList]);
        }
    }
    moveProject(projectId, newStatus) {
        const movableProject = this.projects.find(prj => prj.id === projectId);
        if (movableProject) {
            movableProject.status = newStatus;
            this.runListeners();
        }
    }
}
const state = AppState.getInstance();
// Component base class
class Component {
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
class ProjectItem extends Component {
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
class ProjectList extends Component {
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
class ProjectInputForm extends Component {
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
const projectInput = new ProjectInputForm();
const activeProjectList = new ProjectList(ProjectStatus.ACTIVE);
const finishedProjectList = new ProjectList(ProjectStatus.FINISHED);
//# sourceMappingURL=app.js.map