import {ProjectInputForm, ProjectList} from './components'
import {ProjectStatus} from "./types";

new ProjectInputForm();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);


