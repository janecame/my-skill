import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('tech_stack_options')
    .select('id, name')
    .order('name');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.post('/', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  const { data, error } = await supabase
    .from('tech_stack_options')
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  const { data, error } = await supabase
    .from('tech_stack_options')
    .update({ name: name.trim() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const { error } = await supabase
    .from('tech_stack_options')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  res.status(204).send();
});

export default router;
