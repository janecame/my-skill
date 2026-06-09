import { Goal, Skill, Project, Lesson } from './types';

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

export const fetchSkills = () => get<Skill[]>('/skills');
export const fetchProjects = () => get<Project[]>('/projects');
export const fetchLessons = () => get<Lesson[]>('/lessons');
export const fetchGoals = () => get<Goal[]>('/goals');

export const createLesson = (data: Pick<Lesson, 'title' | 'content' | 'importance'>) =>
  post<Lesson>('/lessons', data);

export const toggleLessonDone = (id: string) =>
  patch<Lesson>(`/lessons/${id}/done`);

export const createProject = (data: Pick<Project, 'name' | 'description' | 'status' | 'tech_stack' | 'start_date' | 'url'>) =>
  post<Project>('/projects', data);
