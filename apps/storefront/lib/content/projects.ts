import type { ProjectContent } from "./types";
export const projects: ProjectContent[] = [];
export function getProject(slug:string){ return projects.find((item)=>item.slug===slug); }
