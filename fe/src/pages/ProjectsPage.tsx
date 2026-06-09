import { useState } from 'react';
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
  Stack,
  TextField,
  Typography,
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
import { fetchProjects, createProject } from '../api';
import { Project } from '../types';

const CARD_STYLE = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 1,
  boxShadow: '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
};

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 8,
  fontSize: '0.75rem',
  color: '#202124',
  boxShadow: '0 2px 6px rgba(60,64,67,0.2)',
};

function statusLabel(status: number) {
  if (status === 100) return { label: 'Complete', color: '#1e8e3e' };
  if (status >= 75) return { label: 'Final Push', color: '#f9ab00' };
  if (status >= 50) return { label: 'In Progress', color: '#1a73e8' };
  if (status >= 25) return { label: 'Early Dev', color: '#0288d1' };
  return { label: 'Planning', color: '#80868b' };
}

function ProjectCard({ project }: { project: Project }) {
  const status = statusLabel(project.status);

  return (
    <Box
      sx={{
        ...CARD_STYLE,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        },
        position: 'relative',
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          height: 3,
          background: project.status === 100
            ? 'linear-gradient(90deg, #1e8e3e, #34a853)'
            : `linear-gradient(90deg, ${status.color}88, ${status.color})`,
        }}
      />

      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box flex={1} mr={2}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  border: `1px solid ${status.color}44`,
                  bgcolor: status.color + '12',
                  borderRadius: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    color: status.color,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  }}
                >
                  {status.label}
                </Typography>
              </Box>
              {project.url && (
                <Box
                  component="a"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    fontSize: '0.7rem',
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                    '&:hover': { color: '#1557b0', textDecoration: 'underline' },
                  }}
                >
                  ↗ Link
                </Box>
              )}
            </Stack>

            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 500,
                color: '#202124',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                lineHeight: 1.3,
              }}
            >
              {project.name}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#5f6368', mt: 0.5, lineHeight: 1.5 }}>
              {project.description}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 500,
                lineHeight: 1,
                color: project.status === 100 ? '#1e8e3e' : '#1a73e8',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {project.status}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#9aa0a6', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              percent
            </Typography>
          </Box>
        </Stack>

        {/* Progress bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ height: 6, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
            <Box
              sx={{
                height: '100%',
                width: `${project.status}%`,
                background: project.status === 100
                  ? 'linear-gradient(90deg, #1e8e3e, #34a853)'
                  : `linear-gradient(90deg, ${status.color}cc, ${status.color})`,
                borderRadius: 3,
                transition: 'width 0.5s ease',
              }}
            />
          </Box>
          <Stack direction="row" justifyContent="space-between" mt={0.25}>
            {[0, 25, 50, 75, 100].map((tick) => (
              <Typography key={tick} sx={{ fontSize: '0.55rem', color: '#9aa0a6', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                {tick}
              </Typography>
            ))}
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
            {project.tech_stack.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 22 }}
              />
            ))}
          </Stack>
          <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
            <Typography sx={{ fontSize: '0.65rem', color: '#9aa0a6' }}>
              {new Date(project.start_date).toLocaleDateString()}
              {project.end_date ? ` — ${new Date(project.end_date).toLocaleDateString()}` : ' — ongoing'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

const EMPTY_FORM = {
  name: '',
  description: '',
  status: '0',
  tech_stack: '',
  start_date: new Date().toISOString().split('T')[0],
  url: '',
};

function AddProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setForm(EMPTY_FORM);
      setError('');
      onClose();
    },
    onError: () => setError('Failed to save. Try again.'),
  });

  function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    const statusNum = Math.min(100, Math.max(0, Number(form.status) || 0));
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim(),
      status: statusNum,
      tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
      start_date: form.start_date || new Date().toISOString().split('T')[0],
      url: form.url.trim() || null,
    });
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
        Add Project
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            label="Project Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            size="small"
            fullWidth
            autoFocus
            required
            error={!!error && !form.name.trim()}
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            size="small"
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Progress (0–100)"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            label="Tech Stack (comma separated)"
            value={form.tech_stack}
            onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
            size="small"
            fullWidth
            placeholder="React, TypeScript, Node.js"
          />
          <TextField
            label="Start Date"
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
            size="small"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="URL (optional)"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            size="small"
            fullWidth
            placeholder="https://..."
          />
          {error && (
            <Typography sx={{ fontSize: '0.75rem', color: '#d93025' }}>{error}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small" sx={{ color: '#5f6368', textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={mutation.isPending}
          sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}
        >
          {mutation.isPending ? 'Saving…' : 'Add Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#1a73e8' }} />
      </Box>
    );
  }
  if (isError) {
    return (
      <Typography sx={{ color: '#d93025', fontSize: '0.875rem' }}>
        Failed to load projects
      </Typography>
    );
  }

  const chartData = (projects ?? []).map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    progress: p.status,
    color: statusLabel(p.status).color,
  }));

  const completedCount = (projects ?? []).filter((p) => p.status === 100).length;
  const activeCount = (projects ?? []).filter((p) => p.status > 0 && p.status < 100).length;
  const avgProgress = projects?.length
    ? Math.round(projects.reduce((a, p) => a + p.status, 0) / projects.length)
    : 0;

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 3, height: 28, bgcolor: '#0288d1', borderRadius: 1 }} />
          <Box>
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 500,
                color: '#202124',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                lineHeight: 1,
              }}
            >
              Projects
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.25 }}>
              Project log & status
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setAddOpen(true)}
          sx={{
            textTransform: 'none',
            borderColor: '#0288d1',
            color: '#0288d1',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontSize: '0.8rem',
            '&:hover': { bgcolor: 'rgba(2,136,209,0.06)' },
          }}
        >
          + Add Project
        </Button>
      </Stack>

      {/* Summary stats */}
      <Stack direction="row" spacing={1.5} mb={3}>
        {[
          { label: 'Total', value: projects?.length ?? 0, color: '#202124' },
          { label: 'Completed', value: completedCount, color: '#1e8e3e' },
          { label: 'Active', value: activeCount, color: '#1a73e8' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: '#0288d1' },
        ].map((s) => (
          <Box
            key={s.label}
            sx={{ flex: 1, px: 1.5, py: 1.25, ...CARD_STYLE, textAlign: 'center' }}
          >
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 500, color: s.color, fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography sx={{ fontSize: '0.65rem', color: '#80868b', mt: 0.25 }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Bar chart overview */}
      {chartData.length > 0 && (
        <Box sx={{ ...CARD_STYLE, p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Box sx={{ width: 3, height: 16, bgcolor: '#0288d1', borderRadius: 1 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              Progress Overview
            </Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#80868b', fontSize: 10, fontFamily: 'Roboto' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#9aa0a6', fontSize: 9, fontFamily: 'Roboto' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v}%`, 'Progress']}
              />
              <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Project cards */}
      <Stack spacing={1.5}>
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projects?.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Typography sx={{ color: '#9aa0a6', fontSize: '0.875rem' }}>
              No projects yet — click "+ Add Project" to get started
            </Typography>
          </Box>
        )}
      </Stack>

      <AddProjectDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
