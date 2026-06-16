import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

function buildSubSkillTree(all: any[], parentId: string | null = null): any[] {
  return all
    .filter(s => s.parent_sub_skill_id === parentId)
    .map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      acquired: s.acquired ?? false,
      mastery: s.mastery ?? null,
      sub_skills: buildSubSkillTree(all, s.id),
    }));
}

function shapeSkill(s: any) {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    proficiency: s.proficiency,
    started_date: s.started_date,
    notes: s.notes,
    goal_ids: (s.skill_goals ?? []).map((sg: any) => sg.goal_id),
    sub_skills: buildSubSkillTree(s.sub_skills ?? []),
  };
}

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('skills')
    .select('*, skill_goals(goal_id), sub_skills(*)');

  if (error) return res.status(500).json({ message: error.message });
  res.json(data.map(shapeSkill));
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('skills')
    .select('*, skill_goals(goal_id), sub_skills(*)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Skill not found' });
  res.json(shapeSkill(data));
});

router.patch('/sub-skills/:id', requireAdmin, async (req, res) => {
  const { acquired, mastery } = req.body;
  const { error } = await supabase
    .from('sub_skills')
    .update({ acquired, mastery: mastery ?? null })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ message: error.message });
  res.json({ ok: true });
});

export default router;
