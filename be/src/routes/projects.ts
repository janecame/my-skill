import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

function shapeProject(p: any) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    tech_stack: p.tech_stack ?? [],
    skills_used: (p.project_skills ?? []).map((ps: any) => ps.skill_id),
    start_date: p.start_date,
    end_date: p.end_date,
    url: p.url,
  };
}

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_skills(skill_id)');

  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(shapeProject));
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_skills(skill_id)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Project not found' });
  res.json(shapeProject(data));
});

router.post('/', async (req, res) => {
  const { name, description, status, tech_stack, skills_used, start_date, end_date, url } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });

  const techStackArray = Array.isArray(tech_stack)
    ? tech_stack
    : tech_stack ? String(tech_stack).split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name,
      description: description ?? '',
      status: Number(status ?? 0),
      tech_stack: techStackArray,
      start_date: start_date ?? new Date().toISOString().split('T')[0],
      end_date: end_date ?? null,
      url: url ?? null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  if (Array.isArray(skills_used) && skills_used.length > 0) {
    await supabase.from('project_skills').insert(
      skills_used.map((skill_id: string) => ({ project_id: project.id, skill_id }))
    );
  }

  res.status(201).json({ ...project, skills_used: skills_used ?? [], tech_stack: techStackArray });
});

export default router;
