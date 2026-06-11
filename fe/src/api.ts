import { Goal, Skill, Project, Lesson, TechStackOption } from './types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function patch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const fetchSkills = () => get<Skill[]>('/skills');
export const fetchProjects = () => get<Project[]>('/projects');
export const fetchLessons = () => get<Lesson[]>('/lessons');
export const fetchGoals = () => get<Goal[]>('/goals');

export const createLesson = (data: Pick<Lesson, 'title' | 'content' | 'importance' | 'item_type'> & { projects_tagged?: string[] }) =>
  post<Lesson>('/lessons', data);

export const toggleLessonDone = (id: string) =>
  patch<Lesson>(`/lessons/${id}/done`);

export const deleteLesson = (id: string) =>
  fetch(`/api/lessons/${id}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  });

export const createProject = (data: Pick<Project, 'name' | 'description' | 'status' | 'tech_stack' | 'start_date' | 'url' | 'github_url' | 'remaining_tasks'>) =>
  post<Project>('/projects', data);

export const updateProject = (id: string, data: Pick<Project, 'name' | 'description' | 'status' | 'tech_stack' | 'start_date' | 'url' | 'github_url' | 'remaining_tasks'>) =>
  put<Project>(`/projects/${id}`, data);

export const fetchTechStackOptions = () => get<TechStackOption[]>('/tech-stack-options');

export const createTechStackOption = (name: string) =>
  post<TechStackOption>('/tech-stack-options', { name });

export const updateTechStackOption = (id: string, name: string) =>
  put<TechStackOption>(`/tech-stack-options/${id}`, { name });

export const deleteTechStackOption = (id: string) =>
  fetch(`/api/tech-stack-options/${id}`, { method: 'DELETE' }).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  });
