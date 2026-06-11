import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { fetchProjects, createProject, updateProject, fetchTechStackOptions, fetchLessons } from '../api';
import { Project, Lesson } from '../types';

const TASK_IMPORTANCE_COLOR = ['', '#9aa0a6', '#80868b', '#0288d1', '#f9ab00', '#d93025'];
const TASK_IMPORTANCE_LABEL = ['', 'Trivial', 'Minor', 'Notable', 'Important', 'Critical'];
import { syncProjectTaskReminders } from '../utils/reminders';

function statusLabel(status: number) {
  if (status === 100) return { label: 'Complete', color: '#1e8e3e' };
  if (status >= 75) return { label: 'Final Push', color: '#f9ab00' };
  if (status >= 50) return { label: 'In Progress', color: '#1a73e8' };
  if (status >= 25) return { label: 'Early Dev', color: '#0288d1' };
  return { label: 'Planning', color: '#80868b' };
}

function ProjectCard({ project, onEdit, linkedTasks }: { project: Project; onEdit: (p: Project) => void; linkedTasks: Lesson[] }) {
  const theme = useTheme();
  const status = statusLabel(project.status);

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' },
      position: 'relative',
    }}>
      <Box sx={{ height: 3, background: project.status === 100 ? 'linear-gradient(90deg, #1e8e3e, #34a853)' : `linear-gradient(90deg, ${status.color}88, ${status.color})` }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1} mr={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Box sx={{ px: 1, py: 0.25, border: `1px solid ${status.color}44`, bgcolor: status.color + '12', borderRadius: 1 }}>
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: status.color, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  {status.label}
                </Typography>
              </Box>
              {project.github_url && (
                <Box component="a" href={project.github_url} target="_blank" rel="noopener noreferrer"
                  sx={{ fontSize: '0.7rem', color: 'text.secondary', textDecoration: 'none', fontFamily: '"Google Sans", "Roboto", sans-serif', '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}>
                  GitHub
                </Box>
              )}
              {project.url && (
                <Box component="a" href={project.url} target="_blank" rel="noopener noreferrer"
                  sx={{ fontSize: '0.7rem', color: 'primary.main', textDecoration: 'none', fontFamily: '"Google Sans", "Roboto", sans-serif', '&:hover': { color: 'primary.dark', textDecoration: 'underline' } }}>
                  ↗ Live
                </Box>
              )}
            </Stack>
            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1.3 }}>
              {project.name}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
              {project.description}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1, color: project.status === 100 ? 'success.main' : 'primary.main', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {project.status}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>percent</Typography>
          </Box>
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ height: 6, bgcolor: theme.palette.divider, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ height: '100%', width: `${project.status}%`, background: project.status === 100 ? 'linear-gradient(90deg, #1e8e3e, #34a853)' : `linear-gradient(90deg, ${status.color}cc, ${status.color})`, borderRadius: 3, transition: 'width 0.5s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={0.25}>
            {[0, 25, 50, 75, 100].map((tick) => (
              <Typography key={tick} sx={{ fontSize: '0.55rem', color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>{tick}</Typography>
            ))}
          </Stack>
        </Box>

        {linkedTasks.filter(t => !t.done).length > 0 && project.status < 100 && (
          <Box sx={{ mb: 1.5, p: 1.25, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: 'text.secondary', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tasks
            </Typography>
            <Stack spacing={0.5}>
              {[...linkedTasks]
                .filter(t => !t.done)
                .sort((a, b) => b.importance - a.importance)
                .map((task, i) => (
                  <Stack key={i} direction="row" alignItems="flex-start" spacing={0.75}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: TASK_IMPORTANCE_COLOR[task.importance], mt: '5px', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.primary', lineHeight: 1.5, flex: 1 }}>{task.title}</Typography>
                    <Box sx={{ px: 0.75, py: 0.1, border: `1px solid ${TASK_IMPORTANCE_COLOR[task.importance]}44`, bgcolor: TASK_IMPORTANCE_COLOR[task.importance] + '12', borderRadius: 0.75, flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '0.55rem', fontWeight: 500, color: TASK_IMPORTANCE_COLOR[task.importance] }}>{TASK_IMPORTANCE_LABEL[task.importance]}</Typography>
                    </Box>
                  </Stack>
                ))}
            </Stack>
          </Box>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {project.tech_stack.map((tech) => (
              <Chip key={tech} label={tech} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 22 }} />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} flexShrink={0} ml={1}>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
              {new Date(project.start_date).toLocaleDateString()}
              {project.end_date ? ` — ${new Date(project.end_date).toLocaleDateString()}` : ' — ongoing'}
            </Typography>
            <Button size="small" onClick={() => onEdit(project)}
              sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.65rem', textTransform: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(26,115,232,0.06)' } }}>
              Edit
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

const EMPTY_FORM = {
  name: '',
  description: '',
  status: 0,
  tech_stack: [] as string[],
  start_date: new Date().toISOString().split('T')[0],
  url: '',
  github_url: '',
  remaining_tasks: [] as string[],
};

function TechStackPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const { data: techOptions = [] } = useQuery({ queryKey: ['tech-stack-options'], queryFn: fetchTechStackOptions });
  return (
    <ToggleButtonGroup
      value={value}
      onChange={(_, v) => onChange(v)}
      sx={{ flexWrap: 'wrap', gap: 0.75, '& .MuiToggleButtonGroup-grouped': { border: '1px solid rgba(0,0,0,0.18) !important', borderRadius: '20px !important', m: 0 } }}
    >
      {techOptions.map((opt) => (
        <ToggleButton key={opt.id} value={opt.name} size="small"
          sx={{ px: 1.5, py: 0.4, fontSize: '0.72rem', textTransform: 'none', fontFamily: '"Google Sans", "Roboto", sans-serif', color: 'text.secondary', '&.Mui-selected': { bgcolor: '#e8f0fe', color: '#1a73e8', borderColor: '#1a73e8 !important' }, '&.Mui-selected:hover': { bgcolor: '#d2e3fc' } }}>
          {opt.name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}


function AddProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      syncProjectTaskReminders(project.id, project.name, project.remaining_tasks);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setForm(EMPTY_FORM);
      setError('');
      onClose();
    },
    onError: () => setError('Failed to save. Try again.'),
  });

  function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    mutation.mutate({ name: form.name.trim(), description: form.description.trim(), status: form.status, tech_stack: form.tech_stack, start_date: form.start_date || new Date().toISOString().split('T')[0], url: form.url.trim() || null, github_url: form.github_url.trim() || null, remaining_tasks: form.remaining_tasks });
  }

  function handleClose() { setForm(EMPTY_FORM); setError(''); onClose(); }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>Add Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          <TextField label="Project Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} size="small" fullWidth autoFocus required error={!!error && !form.name.trim()} />
          <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} size="small" fullWidth multiline minRows={2} />
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Progress</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'primary.main' }}>{form.status}%</Typography>
            </Stack>
            <Slider value={form.status} onChange={(_, v) => setForm((f) => ({ ...f, status: v as number }))} min={0} max={100} step={5} marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]} sx={{ color: '#1a73e8', '& .MuiSlider-markLabel': { fontSize: '0.65rem', color: 'text.disabled' } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>Tech Stack</Typography>
            <TechStackPicker value={form.tech_stack} onChange={(v) => setForm((f) => ({ ...f, tech_stack: v }))} />
          </Box>
          <TextField label="Start Date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} />
          <TextField label="GitHub URL (optional)" value={form.github_url} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} size="small" fullWidth placeholder="https://github.com/..." />
          <TextField label="Live URL (optional)" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} size="small" fullWidth placeholder="https://..." />
          {error && <Typography sx={{ fontSize: '0.75rem', color: 'error.main' }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="small" disabled={mutation.isPending} sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}>
          {mutation.isPending ? 'Saving…' : 'Add Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setForm({ name: project.name, description: project.description, status: project.status, tech_stack: project.tech_stack, start_date: project.start_date, url: project.url ?? '', github_url: project.github_url ?? '', remaining_tasks: project.remaining_tasks ?? [] });
      setError('');
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateProject>[1]) => updateProject(project!.id, data),
    onSuccess: (updated) => {
      syncProjectTaskReminders(updated.id, updated.name, updated.remaining_tasks);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setError('');
      onClose();
    },
    onError: () => setError('Failed to save. Try again.'),
  });

  function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    mutation.mutate({ name: form.name.trim(), description: form.description.trim(), status: form.status, tech_stack: form.tech_stack, start_date: form.start_date || new Date().toISOString().split('T')[0], url: form.url.trim() || null, github_url: form.github_url.trim() || null, remaining_tasks: form.remaining_tasks });
  }

  function handleClose() { setError(''); onClose(); }

  return (
    <Dialog open={!!project} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>Edit Project</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} pt={1}>
          <TextField label="Project Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} size="small" fullWidth autoFocus required error={!!error && !form.name.trim()} />
          <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} size="small" fullWidth multiline minRows={2} />
          <Box>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Progress</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'primary.main' }}>{form.status}%</Typography>
            </Stack>
            <Slider value={form.status} onChange={(_, v) => setForm((f) => ({ ...f, status: v as number }))} min={0} max={100} step={5} marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]} sx={{ color: '#1a73e8', '& .MuiSlider-markLabel': { fontSize: '0.65rem', color: 'text.disabled' } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>Tech Stack</Typography>
            <TechStackPicker value={form.tech_stack} onChange={(v) => setForm((f) => ({ ...f, tech_stack: v }))} />
          </Box>
          <TextField label="Start Date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} />
          <TextField label="GitHub URL (optional)" value={form.github_url} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} size="small" fullWidth placeholder="https://github.com/..." />
          <TextField label="Live URL (optional)" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} size="small" fullWidth placeholder="https://..." />
          {error && <Typography sx={{ fontSize: '0.75rem', color: 'error.main' }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="small" disabled={mutation.isPending} sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}>
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const theme = useTheme();
  const { data: projects, isLoading, isError } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: lessons } = useQuery({ queryKey: ['lessons'], queryFn: fetchLessons });
  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const tooltipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}><CircularProgress color="primary" /></Box>;
  }
  if (isError) {
    return <Typography sx={{ color: 'error.main', fontSize: '0.875rem' }}>Failed to load projects</Typography>;
  }

  const chartData = (projects ?? []).map((p) => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, progress: p.status, color: statusLabel(p.status).color }));
  const completedCount = (projects ?? []).filter((p) => p.status === 100).length;
  const activeCount = (projects ?? []).filter((p) => p.status > 0 && p.status < 100).length;
  const avgProgress = projects?.length ? Math.round(projects.reduce((a, p) => a + p.status, 0) / projects.length) : 0;

  const cardStyle = {
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1,
    boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 3, height: 28, bgcolor: 'info.main', borderRadius: 1 }} />
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
              Projects
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>Project log & status</Typography>
          </Box>
        </Stack>
        <Button variant="outlined" size="small" onClick={() => setAddOpen(true)}
          sx={{ textTransform: 'none', borderColor: 'info.main', color: 'info.main', fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(2,136,209,0.06)' } }}>
          + Add Project
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} mb={3}>
        {[
          { label: 'Total', value: projects?.length ?? 0, color: theme.palette.text.primary },
          { label: 'Completed', value: completedCount, color: theme.palette.success.main },
          { label: 'Active', value: activeCount, color: theme.palette.primary.main },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: theme.palette.info.main },
        ].map((s) => (
          <Box key={s.label} sx={{ flex: 1, px: 1.5, py: 1.25, ...cardStyle, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 500, color: s.color, fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.25 }}>{s.label}</Typography>
          </Box>
        ))}
      </Stack>

      {chartData.length > 0 && (
        <Box sx={{ ...cardStyle, p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Box sx={{ width: 3, height: 16, bgcolor: 'info.main', borderRadius: 1 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              Progress Overview
            </Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontFamily: 'Roboto' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: theme.palette.text.disabled, fontSize: 9, fontFamily: 'Roboto' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Progress']} />
              <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      <Stack spacing={1.5}>
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={setEditProject}
            linkedTasks={(lessons ?? []).filter(l => l.item_type === 'task' && l.projects_tagged.includes(project.id))}
          />
        ))}
        {projects?.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
              No projects yet — click "+ Add Project" to get started
            </Typography>
          </Box>
        )}
      </Stack>

      <AddProjectDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditProjectDialog project={editProject} onClose={() => setEditProject(null)} />
    </Box>
  );
}
