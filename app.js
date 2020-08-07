"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
class ProjectInputForm {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.appRootElement = document.getElementById('app');
        this.formElement = this.getFormFromTemplate();
        this.titleInputElement = this.formElement.querySelector('#title');
        this.descriptionInputElement = this.formElement.querySelector('#description');
        this.peopleInputElement = this.formElement.querySelector('#people');
        this.formElement.addEventListener('submit', this.submitHandler);
        this.renderHtml();
    }
    submitHandler(e) {
        e.preventDefault();
        const userInput = this.collectUserInput();
        this.clearInput();
        console.log(userInput);
    }
    collectUserInput() {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;
        return [title, description, +people];
    }
    clearInput() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }
    getFormFromTemplate() {
        const templateContent = document.importNode(this.templateElement.content, true);
        return templateContent.firstElementChild;
    }
    renderHtml() {
        this.appRootElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}
__decorate([
    Autobind
], ProjectInputForm.prototype, "submitHandler", null);
const projectInput = new ProjectInputForm();
//# sourceMappingURL=app.js.map