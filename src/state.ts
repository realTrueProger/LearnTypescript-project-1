import {Listener} from "./types";
import {Project} from "./project";
import {ProjectStatus} from "./types";
import {UserInput} from "./Interfaces";

// Application state singleton class
export class AppState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: AppState;

    private constructor() {
    }

    public addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        } else {
            this.instance = new AppState();
            return this.instance;
        }
    }

    public addProject({title, description, people}: UserInput) {
        const projectToAdd = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.ACTIVE);

        this.projects.push(projectToAdd);

        this.runListeners();
    }

    get projectList() {
        return [...this.projects];
    }

    private runListeners() {
        for (const listener of this.listeners) {
            listener([...this.projectList]);
        }
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const movableProject = this.projects.find(prj => prj.id === projectId);
        if (movableProject) {
            movableProject.status = newStatus;
            this.runListeners();
        }
    }
}

export const state = AppState.getInstance();
