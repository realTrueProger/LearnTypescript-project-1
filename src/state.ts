namespace App {
    // Application state singleton class
    export enum ProjectStatus { ACTIVE, FINISHED}

    export interface UserInput {
        title: string,
        description: string,
        people: number,
    }

    export class Project {
        constructor(
            public id: string,
            public title: string,
            public description: string,
            public people: number,
            public status: ProjectStatus) {
        }
    }

    type Listener = (items: Project[]) => void;

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
}