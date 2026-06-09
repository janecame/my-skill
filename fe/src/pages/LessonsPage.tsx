import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchLessons, createLesson, toggleLessonDone } from '../api';
import { Lesson } from '../types';

const IMPORTANCE_COLOR = ['', '#9aa0a6', '#80868b', '#0288d1', '#f9ab00', '#1a73e8'];
const IMPORTANCE_LABEL = ['', 'Trivial', 'Minor', 'Notable', 'Important', 'Critical'];

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

function ImportanceDots({ value }: { value: number }) {
  return (
    <Stack direction="row" spacing={0.4} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: i <= value ? IMPORTANCE_COLOR[value] : 'rgba(0,0,0,0.1)',
          }}
        />
      ))}
    </Stack>
  );
}

function LessonCard({ lesson, index, onToggleDone }: { lesson: Lesson; index: number; onToggleDone: (id: string) => void }) {
  const importanceColor = lesson.done ? '#9aa0a6' : (IMPORTANCE_COLOR[lesson.importance] || '#9aa0a6');
  const importanceLabel = IMPORTANCE_LABEL[lesson.importance] || 'Unknown';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        ...CARD_STYLE,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        opacity: lesson.done ? 0.6 : 1,
        '&:hover': {
          boxShadow: '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        },
      }}
    >
      {/* Left accent stripe */}
      <Box sx={{ width: 3, flexShrink: 0, bgcolor: importanceColor }} />

      <Box sx={{ flex: 1, px: 2, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Stack direction="row" alignItems="center" spacing={1.5} flex={1} mr={2}>
            <Checkbox
              checked={lesson.done}
              onChange={() => onToggleDone(lesson.id)}
              size="small"
              sx={{
                p: 0,
                color: '#9aa0a6',
                '&.Mui-checked': { color: '#1e8e3e' },
              }}
            />
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 500,
                color: '#9aa0a6',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
                flexShrink: 0,
              }}
            >
              #{String(index + 1).padStart(3, '0')}
            </Typography>

            <Box flex={1}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: lesson.done ? '#9aa0a6' : '#202124',
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                  lineHeight: 1.3,
                  textDecoration: lesson.done ? 'line-through' : 'none',
                }}
              >
                {lesson.title}
              </Typography>
            </Box>
          </Stack>

          <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
            <ImportanceDots value={lesson.importance} />
            <Box
              sx={{
                px: 1,
                py: 0.2,
                border: `1px solid ${importanceColor}44`,
                bgcolor: importanceColor + '12',
                borderRadius: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  color: importanceColor,
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                {importanceLabel}
              </Typography>
            </Box>
          </Stack>
        </Stack>

        {lesson.content && (
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#5f6368',
              lineHeight: 1.6,
              mb: 1.5,
              borderLeft: `2px solid rgba(0,0,0,0.08)`,
              pl: 1.5,
            }}
          >
            {lesson.content}
          </Typography>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {lesson.skills_tagged?.map((tag) => (
              <Box
                key={tag}
                sx={{
                  px: 1,
                  py: 0.2,
                  border: '1px solid rgba(26,115,232,0.25)',
                  bgcolor: 'rgba(26,115,232,0.06)',
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontSize: '0.6rem', color: '#1a73e8', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  {tag}
                </Typography>
              </Box>
            ))}
            {lesson.projects_tagged?.map((tag) => (
              <Box
                key={tag}
                sx={{
                  px: 1,
                  py: 0.2,
                  border: '1px solid rgba(2,136,209,0.25)',
                  bgcolor: 'rgba(2,136,209,0.06)',
                  borderRadius: 1,
                }}
              >
                <Typography sx={{ fontSize: '0.6rem', color: '#0288d1', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  {tag}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: '#9aa0a6',
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              flexShrink: 0,
              ml: 1,
            }}
          >
            {new Date(lesson.date_learned).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

const EMPTY_FORM = { title: '', content: '', importance: 3 };

function AddLessonDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      setForm(EMPTY_FORM);
      setError('');
      onClose();
    },
    onError: () => setError('Failed to save. Try again.'),
  });

  function handleSubmit() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    mutation.mutate({ title: form.title.trim(), content: form.content.trim(), importance: form.importance });
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
        Add Research / Learning Item
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            size="small"
            fullWidth
            autoFocus
            required
            error={!!error && !form.title.trim()}
          />
          <TextField
            label="Notes (optional)"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            size="small"
            fullWidth
            multiline
            minRows={2}
            placeholder="What you want to learn or find out..."
          />
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mb: 0.5 }}>Priority</Typography>
            <Select
              value={form.importance}
              onChange={(e) => setForm((f) => ({ ...f, importance: Number(e.target.value) }))}
              size="small"
              fullWidth
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <MenuItem key={i} value={i}>
                  {IMPORTANCE_LABEL[i]}
                </MenuItem>
              ))}
            </Select>
          </Box>
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
          {mutation.isPending ? 'Saving…' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LessonsPage() {
  const queryClient = useQueryClient();
  const { data: lessons, isLoading, isError } = useQuery({
    queryKey: ['lessons'],
    queryFn: fetchLessons,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleLessonDone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
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
        Failed to load items
      </Typography>
    );
  }

  const criticalCount = (lessons ?? []).filter((l) => l.importance >= 4).length;
  const doneCount = (lessons ?? []).filter((l) => l.done).length;
  const totalCount = lessons?.length ?? 0;

  const chartData = (lessons ?? [])
    .slice()
    .sort((a, b) => new Date(a.date_learned).getTime() - new Date(b.date_learned).getTime())
    .map((l, i) => ({
      index: i + 1,
      importance: l.importance,
      date: new Date(l.date_learned).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 3, height: 28, bgcolor: '#f9ab00', borderRadius: 1 }} />
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
              Research Queue
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.25 }}>
              Quick lookups & things to learn
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setAddOpen(true)}
          sx={{
            textTransform: 'none',
            borderColor: '#1a73e8',
            color: '#1a73e8',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
            fontSize: '0.8rem',
            '&:hover': { bgcolor: 'rgba(26,115,232,0.06)' },
          }}
        >
          + Add Item
        </Button>
      </Stack>

      {/* Summary stats */}
      <Stack direction="row" spacing={1.5} mb={3}>
        {[
          { label: 'Total', value: totalCount, color: '#202124' },
          { label: 'Done', value: doneCount, color: '#1e8e3e' },
          { label: 'Remaining', value: totalCount - doneCount, color: '#f9ab00' },
          { label: 'Critical', value: criticalCount, color: '#1a73e8' },
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

        {/* Importance legend */}
        <Box sx={{ flex: 3, px: 2, py: 1, ...CARD_STYLE }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#80868b', mb: 0.75 }}>
            Priority Legend
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: IMPORTANCE_COLOR[i] }} />
                <Typography sx={{ fontSize: '0.65rem', color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  {IMPORTANCE_LABEL[i]}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      {/* Area chart: importance timeline */}
      {chartData.length > 1 && (
        <Box sx={{ ...CARD_STYLE, p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
            <Box sx={{ width: 3, height: 16, bgcolor: '#f9ab00', borderRadius: 1 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              Priority Timeline
            </Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="importanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#9aa0a6', fontSize: 9, fontFamily: 'Roboto' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#9aa0a6', fontSize: 9, fontFamily: 'Roboto' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [IMPORTANCE_LABEL[Number(v)] || String(v), 'Priority']}
              />
              <Area
                type="monotone"
                dataKey="importance"
                stroke="#1a73e8"
                strokeWidth={2}
                fill="url(#importanceGrad)"
                dot={{ fill: '#1a73e8', r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Lesson cards */}
      <Stack spacing={1.5}>
        {lessons?.map((lesson, i) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            index={i}
            onToggleDone={(id) => toggleMutation.mutate(id)}
          />
        ))}
        {lessons?.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Typography sx={{ color: '#9aa0a6', fontSize: '0.875rem' }}>
              Nothing added yet — click "+ Add Item" to get started
            </Typography>
          </Box>
        )}
      </Stack>

      <AddLessonDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
