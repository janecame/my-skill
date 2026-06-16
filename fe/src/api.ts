import axios from 'axios';
import { Goal, Skill, Project, Lesson, TechStackOption, LessonItemType } from './types';
import { getStoredToken } from './auth/AuthContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the admin token (if logged in) to every request.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected (expired/invalid), clear it and reload so the UI
// drops back to read-only mode.
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skill-tracker-admin-token');
    }
    return Promise.reject(error);
  }
);

const get = <T>(path: string) => api.get<T>(path).then((r) => r.data);
const post = <T>(path: string, body: unknown) => api.post<T>(path, body).then((r) => r.data);
const put = <T>(path: string, body: unknown) => api.put<T>(path, body).then((r) => r.data);
const patch = <T>(path: string) => api.patch<T>(path).then((r) => r.data);
const del = (path: string) => api.delete(path).then((r) => r.data);

export const fetchSkills = () => get<Skill[]>('/skills');
export const fetchProjects = () => get<Project[]>('/projects');
export const fetchLessons = () => get<Lesson[]>('/lessons');
export const fetchGoals = () => get<Goal[]>('/goals');

export const createLesson = (data: Pick<Lesson, 'title' | 'content' | 'importance' | 'item_type' | 'starred'> & { projects_tagged?: string[] }) =>
  post<Lesson>('/lessons', data);

export const updateLesson = (id: string, data: { title: string; content: string; importance: number; item_type: LessonItemType; starred: boolean; projects_tagged?: string[] }) =>
  put<Lesson>(`/lessons/${id}`, data);

export const toggleLessonStarred = (id: string) =>
  patch<Lesson>(`/lessons/${id}/star`);

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
  api.patch(`/skills/sub-skills/${id}`, { acquired, mastery }).then((r) => r.data);"" 
