import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('goals').select('*');
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Goal not found' });
  res.json(data);
});

export default router;
