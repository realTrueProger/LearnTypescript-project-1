import {Project} from "./project";

export enum ProjectStatus { ACTIVE, FINISHED}

export type Listener = (items: Project[]) => void;