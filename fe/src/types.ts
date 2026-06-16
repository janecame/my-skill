export interface TechStackOption {
  id: string;
  name: string;
}

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
  mastery: MasteryLevel | null;
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

export interface SubSkillState {
  acquired: boolean;
  mastery: MasteryLevel | null;
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
  github_url: string | null;
  remaining_tasks: string[];
}

export type LessonItemType = 'task' | 'learn' | 'skill';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  skills_tagged: string[];
  projects_tagged: string[];
  date_learned: string;
  importance: number;
  done: boolean;
  starred: boolean;
  item_type: LessonItemType;
}

export interface LearnReminder {
  id: string;
  subSkillName: string;
  skillName: string;
  goalName: string;
  startDate: string;
  addedAt: string;
  done: boolean;
}
