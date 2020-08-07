"use strict";
class ProjectInputForm {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.appRootElement = document.getElementById('app');
        this.renderHtml();
    }
    renderHtml() {
        const templateContent = document.importNode(this.templateElement.content, true);
        const templateHtmlElement = templateContent.firstElementChild;
        this.appRootElement.insertAdjacentElement('afterbegin', templateHtmlElement);
    }
}
const projectInput = new ProjectInputForm();
//# sourceMappingURL=app.js.map