export interface Goal {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type MasteryLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SubSkill {
  id: string;
  name: string;
  description: string;
  acquired: boolean;
  mastery: string | null;
  sub_skills?: SubSkill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  started_date: string;
  notes: string;
  goal_ids: string[];
  sub_skills: SubSkill[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: number;
  tech_stack: string[];
  skills_used: string[];
  start_date: string;
  end_date: string | null;
  url: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  skills_tagged: string[];
  projects_tagged: string[];
  date_learned: string;
  importance: number;
  done: boolean;
}
