class ProjectInputForm {
    templateElement: HTMLTemplateElement;
    appRootElement: HTMLDivElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.appRootElement = document.getElementById('app')! as HTMLDivElement;

        this.renderHtml();
    }

    private renderHtml() {
        const templateContent = document.importNode(this.templateElement.content, true);
        const templateHtmlElement = templateContent.firstElementChild as HTMLFormElement;
        this.appRootElement.insertAdjacentElement('afterbegin', templateHtmlElement);
    }
}


const projectInput = new ProjectInputForm();