import {Project} from "./project.js";

export enum ProjectStatus { ACTIVE, FINISHED}

export type Listener = (items: Project[]) => void;