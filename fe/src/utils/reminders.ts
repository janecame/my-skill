import { LearnReminder } from '../types';

export const LEARN_REMINDERS_KEY = 'skill-tracker:learn-reminders';

export function loadLearnReminders(): LearnReminder[] {
  try {
    return JSON.parse(localStorage.getItem(LEARN_REMINDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function appendReminder(reminder: LearnReminder) {
  try {
    const existing = loadLearnReminders();
    localStorage.setItem(LEARN_REMINDERS_KEY, JSON.stringify([...existing, reminder]));
  } catch {
    localStorage.setItem(LEARN_REMINDERS_KEY, JSON.stringify([reminder]));
  }
}

export function saveReminders(reminders: LearnReminder[]) {
  localStorage.setItem(LEARN_REMINDERS_KEY, JSON.stringify(reminders));
}

export function syncProjectTaskReminders(projectId: string, projectName: string, tasks: string[]) {
  const existing = loadLearnReminders();
  const otherReminders = existing.filter((r) => r.skillName !== `project:${projectId}`);
  const undoneProjectReminders = existing.filter(
    (r) => r.skillName === `project:${projectId}` && r.done
  );

  const newReminders: LearnReminder[] = tasks.map((task) => ({
    id: `project-${projectId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    subSkillName: task,
    skillName: `project:${projectId}`,
    goalName: projectName,
    startDate: '',
    addedAt: new Date().toISOString(),
    done: false,
  }));

  localStorage.setItem(
    LEARN_REMINDERS_KEY,
    JSON.stringify([...otherReminders, ...undoneProjectReminders, ...newReminders])
  );
}
