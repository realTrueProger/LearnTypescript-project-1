"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    // Application state singleton class
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["ACTIVE"] = 0] = "ACTIVE";
        ProjectStatus[ProjectStatus["FINISHED"] = 1] = "FINISHED";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
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
    App.AppState = AppState;
    App.state = AppState.getInstance();
})(App || (App = {}));
var App;
(function (App) {
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
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
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
    App.Component = Component;
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
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
    class ProjectList extends Component {
        constructor(listType) {
            super('project-list', 'app', 'beforeend');
            this.projectList = [];
            this.listType = listType;
            this.setSectionId();
            App.state.addListener((projectList) => {
                this.projectList = projectList.filter(project => project.status === this.listType);
                this.fillProjectList();
            });
            this.fillHeader();
            this.templateRoot.addEventListener('dragover', this.dragOverHandler);
            this.templateRoot.addEventListener('drop', this.dropHandler);
            this.templateRoot.addEventListener('dragleave', this.dragLeaveHandler);
        }
        setSectionId() {
            this.templateRoot.id = this.listType === App.ProjectStatus.ACTIVE ? 'active-projects' : 'finished-projects';
            this.templateRoot.querySelector('ul').id = this.listType === App.ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
        }
        dragOverHandler(e) {
            e.preventDefault();
            const ul = this.templateRoot.querySelector('ul');
            ul.classList.add('droppable');
        }
        dropHandler(e) {
            const projectId = e.dataTransfer.getData('text/plain');
            App.state.moveProject(projectId, this.listType === App.ProjectStatus.FINISHED ? App.ProjectStatus.FINISHED : App.ProjectStatus.ACTIVE);
        }
        dragLeaveHandler(e) {
            const ul = this.templateRoot.querySelector('ul');
            ul.classList.remove('droppable');
        }
        fillProjectList() {
            const ul = this.templateRoot.querySelector('ul');
            ul.innerHTML = '';
            for (const project of this.projectList) {
                const root = project.status === App.ProjectStatus.ACTIVE ? 'active-list' : 'finished-list';
                new ProjectItem(project, root);
            }
        }
        fillHeader() {
            const header = this.templateRoot.querySelector('h2');
            const headerText = this.listType === App.ProjectStatus.ACTIVE ? 'active projects' : 'finished projects';
            header.textContent = headerText.toUpperCase();
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
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
            App.state.addProject(userInput);
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
        App.Autobind
    ], ProjectInputForm.prototype, "submitHandler", null);
    App.ProjectInputForm = ProjectInputForm;
})(App || (App = {}));
/// <reference path="dragAndDropInterfaces.ts"/>
/// <reference path="state.ts"/>
/// <reference path="autoBindDecorator.ts"/>
/// <reference path="components.ts"/>
var App;
(function (App) {
    new App.ProjectInputForm();
    new App.ProjectList(App.ProjectStatus.ACTIVE);
    new App.ProjectList(App.ProjectStatus.FINISHED);
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map