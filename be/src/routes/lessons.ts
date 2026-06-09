import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

function shapeLesson(l: any) {
  return {
    id: l.id,
    title: l.title,
    content: l.content,
    date_learned: l.date_learned,
    importance: l.importance,
    done: l.done,
    skills_tagged: (l.lesson_skills ?? []).map((ls: any) => ls.skill_id),
    projects_tagged: (l.lesson_projects ?? []).map((lp: any) => lp.project_id),
  };
}

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*, lesson_skills(skill_id), lesson_projects(project_id)');

  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(shapeLesson));
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*, lesson_skills(skill_id), lesson_projects(project_id)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Lesson not found' });
  res.json(shapeLesson(data));
});

router.post('/', async (req, res) => {
  const { title, content, skills_tagged, projects_tagged, importance, date_learned } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      title,
      content: content ?? '',
      date_learned: date_learned ?? new Date().toISOString().split('T')[0],
      importance: importance ?? 3,
      done: false,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  if (Array.isArray(skills_tagged) && skills_tagged.length > 0) {
    await supabase.from('lesson_skills').insert(
      skills_tagged.map((skill_id: string) => ({ lesson_id: lesson.id, skill_id }))
    );
  }

  if (Array.isArray(projects_tagged) && projects_tagged.length > 0) {
    await supabase.from('lesson_projects').insert(
      projects_tagged.map((project_id: string) => ({ lesson_id: lesson.id, project_id }))
    );
  }

  res.status(201).json({
    ...lesson,
    skills_tagged: skills_tagged ?? [],
    projects_tagged: projects_tagged ?? [],
  });
});

router.patch('/:id/done', async (req, res) => {
  const { data: current, error: fetchError } = await supabase
    .from('lessons')
    .select('done')
    .eq('id', req.params.id)
    .single();

  if (fetchError) return res.status(404).json({ message: 'Lesson not found' });

  const { data, error } = await supabase
    .from('lessons')
    .update({ done: !current.done })
    .eq('id', req.params.id)
    .select('*, lesson_skills(skill_id), lesson_projects(project_id)')
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeLesson(data));
});

export default router;
