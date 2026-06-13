import axios from 'axios';
import { Goal, Skill, Project, Lesson, TechStackOption } from './types';

const api = axios.create({
  baseURL: '/api',
});

const get = <T>(path: string) => api.get<T>(path).then((r) => r.data);
const post = <T>(path: string, body: unknown) => api.post<T>(path, body).then((r) => r.data);
const put = <T>(path: string, body: unknown) => api.put<T>(path, body).then((r) => r.data);
const patch = <T>(path: string) => api.patch<T>(path).then((r) => r.data);
const del = (path: string) => api.delete(path).then((r) => r.data);

export const fetchSkills = () => get<Skill[]>('/skills');
export const fetchProjects = () => get<Project[]>('/projects');
export const fetchLessons = () => get<Lesson[]>('/lessons');
export const fetchGoals = () => get<Goal[]>('/goals');

export const createLesson = (data: Pick<Lesson, 'title' | 'content' | 'importance' | 'item_type'> & { projects_tagged?: string[] }) =>
  post<Lesson>('/lessons', data);

export const toggleLessonDone = (id: string) =>
  patch<Lesson>(`/lessons/${id}/done`);

export const deleteLesson = (id: string) => del(`/lessons/${id}`);

export const createProject = (data: Pick<Project, 'name' | 'description' | 'status' | 'tech_stack' | 'start_date' | 'url' | 'github_url' | 'remaining_tasks'>) =>
  post<Project>('/projects', data);

export const updateProject = (id: string, data: Pick<Project, 'name' | 'description' | 'status' | 'tech_stack' | 'start_date' | 'url' | 'github_url' | 'remaining_tasks'>) =>
  put<Project>(`/projects/${id}`, data);

export const fetchTechStackOptions = () => get<TechStackOption[]>('/tech-stack-options');

export const createTechStackOption = (name: string) =>
  post<TechStackOption>('/tech-stack-options', { name });

export const updateTechStackOption = (id: string, name: string) =>
  put<TechStackOption>(`/tech-stack-options/${id}`, { name });

export const deleteTechStackOption = (id: string) => del(`/tech-stack-options/${id}`);

export const updateSubSkillState = (id: string, acquired: boolean, mastery: string | null) =>
  api.patch(`/skills/sub-skills/${id}`, { acquired, mastery }).then((r) => r.data);