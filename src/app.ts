/// <reference path="dragAndDropInterfaces.ts"/>
/// <reference path="state.ts"/>
/// <reference path="autoBindDecorator.ts"/>
/// <reference path="components.ts"/>

namespace App {
    new ProjectInputForm();
    new ProjectList(ProjectStatus.ACTIVE);
    new ProjectList(ProjectStatus.FINISHED);
}


