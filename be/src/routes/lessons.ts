import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

function shapeLesson(l: any) {
  return {
    id: l.id,
    title: l.title,
    content: l.content,
    date_learned: l.date_learned,
    importance: l.importance,
    done: l.done,
    starred: l.starred ?? false,
    item_type: l.item_type ?? 'task',
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

router.post('/', requireAdmin, async (req, res) => {
  const { title, content, skills_tagged, projects_tagged, importance, date_learned, item_type } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const { starred } = req.body;
  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      title,
      content: content ?? '',
      date_learned: date_learned ?? new Date().toISOString().split('T')[0],
      importance: importance ?? 3,
      done: false,
      starred: starred ?? false,
      item_type: item_type ?? 'task',
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

router.put('/:id', requireAdmin, async (req, res) => {
  const { title, content, importance, item_type, starred, projects_tagged } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });

  const { error: updateError } = await supabase
    .from('lessons')
    .update({ title, content: content ?? '', importance: importance ?? 3, item_type: item_type ?? 'task', starred: starred ?? false })
    .eq('id', req.params.id);

  if (updateError) return res.status(500).json({ message: updateError.message });

  if (Array.isArray(projects_tagged)) {
    await supabase.from('lesson_projects').delete().eq('lesson_id', req.params.id);
    if (projects_tagged.length > 0) {
      await supabase.from('lesson_projects').insert(
        projects_tagged.map((project_id: string) => ({ lesson_id: req.params.id, project_id }))
      );
    }
  }

  const { data, error } = await supabase
    .from('lessons')
    .select('*, lesson_skills(skill_id), lesson_projects(project_id)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeLesson(data));
});

router.patch('/:id/star', requireAdmin, async (req, res) => {
  const { data: current, error: fetchError } = await supabase
    .from('lessons')
    .select('starred')
    .eq('id', req.params.id)
    .single();

  if (fetchError) return res.status(404).json({ message: 'Lesson not found' });

  const { data, error } = await supabase
    .from('lessons')
    .update({ starred: !current.starred })
    .eq('id', req.params.id)
    .select('*, lesson_skills(skill_id), lesson_projects(project_id)')
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.json(shapeLesson(data));
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase.from('lessons').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.status(204).send();
});

router.patch('/:id/done', requireAdmin, async (req, res) => {
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
