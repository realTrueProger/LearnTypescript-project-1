import { Project } from "./project.js";
import { ProjectStatus } from "./types.js";
// Application state singleton class
export class AppState {
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
export const state = AppState.getInstance();
//# sourceMappingURL=state.js.map