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
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchLessons, createLesson, toggleLessonDone, deleteLesson, fetchProjects } from '../api';
import { Lesson, LearnReminder, LessonItemType, Project } from '../types';

const IMPORTANCE_COLOR = ['', '#9aa0a6', '#80868b', '#0288d1', '#f9ab00', '#d93025'];
const IMPORTANCE_LABEL = ['', 'Trivial', 'Minor', 'Notable', 'Important', 'Critical'];
const LEARN_REMINDERS_KEY = 'skill-tracker:learn-reminders';
const LESSONS_ORDER_KEY = 'skill-tracker:lessons-order';
const REMINDERS_ORDER_KEY = 'skill-tracker:reminders-order';

type AllItemType = LessonItemType | 'reminder';

const ITEM_TYPE_CONFIG: Record<AllItemType, { label: string; color: string; bg: string; border: string }> = {
  task:     { label: 'Task',     color: '#f9ab00', bg: 'rgba(249,171,0,0.1)',   border: 'rgba(249,171,0,0.35)'  },
  learn:    { label: 'Learn',    color: '#1a73e8', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.3)'  },
  skill:    { label: 'Skill',    color: '#1e8e3e', bg: 'rgba(30,142,62,0.08)',  border: 'rgba(30,142,62,0.3)'   },
  reminder: { label: 'Reminder', color: '#1e8e3e', bg: 'rgba(30,142,62,0.08)', border: 'rgba(30,142,62,0.3)'   },
};

function loadReminders(): LearnReminder[] {
  try {
    return JSON.parse(localStorage.getItem(LEARN_REMINDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReminders(reminders: LearnReminder[]) {
  localStorage.setItem(LEARN_REMINDERS_KEY, JSON.stringify(reminders));
}

function loadOrder(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveOrder(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

function applyOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  if (order.length === 0) return items;
  const map = new Map(items.map((item) => [item.id, item]));
  const ordered = order.flatMap((id) => (map.has(id) ? [map.get(id)!] : []));
  const newItems = items.filter((item) => !order.includes(item.id));
  return [...ordered, ...newItems];
}

function TypeBadge({ type }: { type: AllItemType }) {
  const cfg = ITEM_TYPE_CONFIG[type];
  return (
    <Box sx={{ px: 0.75, py: 0.15, border: `1px solid ${cfg.border}`, bgcolor: cfg.bg, borderRadius: 0.75, flexShrink: 0 }}>
      <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: cfg.color, fontFamily: '"Google Sans", "Roboto", sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

function ImportanceDots({ value }: { value: number }) {
  return (
    <Stack direction="row" spacing={0.4} alignItems="center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: i <= value ? IMPORTANCE_COLOR[value] : 'action.disabled' }} />
      ))}
    </Stack>
  );
}

function LessonCard({ lesson, index, onToggleDone, onDelete }: { lesson: Lesson; index: number; onToggleDone: (id: string) => void; onDelete: (id: string) => void }) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const importanceColor = lesson.done ? theme.palette.text.disabled : (IMPORTANCE_COLOR[lesson.importance] || theme.palette.text.disabled);
  const importanceLabel = IMPORTANCE_LABEL[lesson.importance] || 'Unknown';

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: 'flex',
        gap: 0,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        boxShadow: isDragging
          ? (theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(60,64,67,0.3)')
          : (theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'),
        overflow: 'hidden',
        opacity: isDragging ? 0.85 : lesson.done ? 0.6 : 1,
        zIndex: isDragging ? 999 : 'auto',
        transition: 'box-shadow 0.2s, opacity 0.2s',
        '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' },
      }}
    >
      <Box sx={{ width: 3, flexShrink: 0, bgcolor: importanceColor }} />
      <Box
        {...attributes}
        {...listeners}
        sx={{ display: 'flex', alignItems: 'center', px: 0.75, cursor: isDragging ? 'grabbing' : 'grab', color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'text.secondary' } }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ flex: 1, px: 1.5, py: 0.75 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1} flex={1} mr={1}>
            <Checkbox
              checked={lesson.done}
              onChange={() => onToggleDone(lesson.id)}
              size="small"
              sx={{ p: 0, color: 'text.disabled', '&.Mui-checked': { color: 'success.main' } }}
            />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif', flexShrink: 0 }}>
              #{String(index + 1).padStart(3, '0')}
            </Typography>
            <TypeBadge type={lesson.item_type ?? 'task'} />
            <Box flex={1} sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: lesson.done ? 'text.disabled' : 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1.3, textDecoration: lesson.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lesson.title}
              </Typography>
              {lesson.content && (
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lesson.content}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
            <ImportanceDots value={lesson.importance} />
            <Box sx={{ px: 0.75, py: 0.1, border: `1px solid ${importanceColor}44`, bgcolor: importanceColor + '12', borderRadius: 0.75 }}>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 500, color: importanceColor, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                {importanceLabel}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => onDelete(lesson.id)} sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif', minWidth: 60, textAlign: 'right' }}>
              {new Date(lesson.date_learned).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function ReminderCard({ reminder, index, onToggle, onDelete }: { reminder: LearnReminder; index: number; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const theme = useTheme();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: reminder.id });
  const isOverdue = reminder.startDate && !reminder.done && new Date(reminder.startDate) < new Date();
  const accentColor = reminder.done ? theme.palette.text.disabled : isOverdue ? theme.palette.error.main : '#1e8e3e';

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      sx={{
        display: 'flex',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        boxShadow: isDragging
          ? (theme.palette.mode === 'dark' ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(60,64,67,0.3)')
          : (theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'),
        overflow: 'hidden',
        opacity: isDragging ? 0.85 : reminder.done ? 0.6 : 1,
        zIndex: isDragging ? 999 : 'auto',
        transition: 'box-shadow 0.2s, opacity 0.2s',
        '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' },
      }}
    >
      <Box sx={{ width: 3, flexShrink: 0, bgcolor: accentColor }} />
      <Box
        {...attributes}
        {...listeners}
        sx={{ display: 'flex', alignItems: 'center', px: 0.75, cursor: isDragging ? 'grabbing' : 'grab', color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'text.secondary' } }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </Box>
      <Box sx={{ flex: 1, px: 1.5, py: 0.75 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1} flex={1} mr={1}>
            <IconButton size="small" onClick={() => onToggle(reminder.id)} sx={{ p: 0.25, color: reminder.done ? 'success.main' : 'text.disabled', '&:hover': { color: 'success.main' } }}>
              {reminder.done ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif', flexShrink: 0 }}>
              #{String(index + 1).padStart(3, '0')}
            </Typography>
            <TypeBadge type="reminder" />
            <Box flex={1}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: reminder.done ? 'text.disabled' : 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1.3, textDecoration: reminder.done ? 'line-through' : 'none' }}>
                {reminder.subSkillName}
              </Typography>
              {(reminder.skillName || reminder.goalName) && (
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.2 }}>
                  {[reminder.skillName, reminder.goalName].filter(Boolean).join(' · ')}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {reminder.startDate && (
                <Typography sx={{ fontSize: '0.65rem', fontWeight: 500, color: accentColor, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  {isOverdue ? 'Overdue · ' : 'Start: '}
                  {new Date(reminder.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Typography>
              )}
              <IconButton size="small" onClick={() => onDelete(reminder.id)} sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

const EMPTY_LESSON_FORM = { title: '', content: '', importance: 3, item_type: 'task' as LessonItemType };
const EMPTY_REMINDER_FORM = { subSkillName: '', skillName: '', goalName: '', startDate: '' };

function AddItemDialog({ open, onClose, onReminderAdded }: { open: boolean; onClose: () => void; onReminderAdded: () => void }) {
  const queryClient = useQueryClient();
  const [activeType, setActiveType] = useState<AllItemType>('task');
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON_FORM);
  const [reminderForm, setReminderForm] = useState(EMPTY_REMINDER_FORM);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [error, setError] = useState('');

  const { data: projects } = useQuery<Project[]>({ queryKey: ['projects'], queryFn: fetchProjects });

  const mutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); handleClose(); },
    onError: () => setError('Failed to save. Try again.'),
  });

  function handleClose() {
    setActiveType('task');
    setLessonForm(EMPTY_LESSON_FORM);
    setReminderForm(EMPTY_REMINDER_FORM);
    setSelectedProjectId('');
    setError('');
    onClose();
  }

  function handleSubmit() {
    if (activeType === 'reminder') {
      if (!reminderForm.subSkillName.trim()) { setError('Sub-skill name is required'); return; }
      const reminder: LearnReminder = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        subSkillName: reminderForm.subSkillName.trim(),
        skillName: reminderForm.skillName.trim(),
        goalName: reminderForm.goalName.trim(),
        startDate: reminderForm.startDate,
        addedAt: new Date().toISOString(),
        done: false,
      };
      saveReminders([...loadReminders(), reminder]);
      onReminderAdded();
      handleClose();
    } else {
      if (!lessonForm.title.trim()) { setError('Title is required'); return; }
      const projects_tagged = activeType === 'task' && selectedProjectId ? [selectedProjectId] : undefined;
      mutation.mutate({ title: lessonForm.title.trim(), content: lessonForm.content.trim(), importance: lessonForm.importance, item_type: activeType as LessonItemType, projects_tagged });
    }
  }

  const cfg = ITEM_TYPE_CONFIG[activeType];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
        Add Item
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.75 }}>Type</Typography>
            <Stack direction="row" spacing={1}>
              {(['task', 'learn', 'skill', 'reminder'] as AllItemType[]).map((t) => {
                const c = ITEM_TYPE_CONFIG[t];
                const active = activeType === t;
                return (
                  <Box key={t} onClick={() => { setActiveType(t); setError(''); }}
                    sx={{ px: 1.5, py: 0.6, border: `1px solid ${active ? c.color : 'rgba(0,0,0,0.15)'}`, bgcolor: active ? c.bg : 'transparent', borderRadius: 1, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: active ? 600 : 400, color: active ? c.color : 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                      {c.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {activeType === 'reminder' ? (
            <>
              <TextField label="Sub-skill to learn" value={reminderForm.subSkillName} onChange={(e) => setReminderForm((f) => ({ ...f, subSkillName: e.target.value }))} size="small" fullWidth autoFocus required error={!!error && !reminderForm.subSkillName.trim()} placeholder="e.g. React Query basics" />
              <TextField label="Skill (optional)" value={reminderForm.skillName} onChange={(e) => setReminderForm((f) => ({ ...f, skillName: e.target.value }))} size="small" fullWidth placeholder="e.g. Frontend" />
              <TextField label="Goal (optional)" value={reminderForm.goalName} onChange={(e) => setReminderForm((f) => ({ ...f, goalName: e.target.value }))} size="small" fullWidth placeholder="e.g. Web Development" />
              <TextField label="Plan to start (optional)" type="date" value={reminderForm.startDate} onChange={(e) => setReminderForm((f) => ({ ...f, startDate: e.target.value }))} size="small" fullWidth InputLabelProps={{ shrink: true }} />
            </>
          ) : (
            <>
              <TextField label="Title" value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} size="small" fullWidth autoFocus required error={!!error && !lessonForm.title.trim()} />
              <TextField label="Notes (optional)" value={lessonForm.content} onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))} size="small" fullWidth multiline minRows={2} placeholder="Details..." />
              <Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>Priority</Typography>
                <Select value={lessonForm.importance} onChange={(e) => setLessonForm((f) => ({ ...f, importance: Number(e.target.value) }))} size="small" fullWidth>
                  {[1, 2, 3, 4, 5].map((i) => <MenuItem key={i} value={i}>{IMPORTANCE_LABEL[i]}</MenuItem>)}
                </Select>
              </Box>
              {activeType === 'task' && (
                <Box>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>Project (optional)</Typography>
                  <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} size="small" fullWidth displayEmpty>
                    <MenuItem value=""><em style={{ fontStyle: 'normal', color: 'inherit' }}>— No project —</em></MenuItem>
                    {(projects ?? []).map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </>
          )}

          {error && <Typography sx={{ fontSize: '0.75rem', color: 'error.main' }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="small" disabled={mutation.isPending}
          sx={{ textTransform: 'none', bgcolor: cfg.color, '&:hover': { filter: 'brightness(0.88)', bgcolor: cfg.color } }}>
          {mutation.isPending ? 'Saving…' : `Add ${cfg.label}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LessonsPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: lessons, isLoading, isError } = useQuery({ queryKey: ['lessons'], queryFn: fetchLessons });
  const [reminders, setReminders] = useState<LearnReminder[]>(() => loadReminders());
  const [addOpen, setAddOpen] = useState(false);
  const [lessonsOrder, setLessonsOrder] = useState<string[]>(() => loadOrder(LESSONS_ORDER_KEY));
  const [remindersOrder, setRemindersOrder] = useState<string[]>(() => loadOrder(REMINDERS_ORDER_KEY));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const toggleMutation = useMutation({
    mutationFn: toggleLessonDone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lessons'] }),
  });

  function handleToggleReminder(id: string) {
    const updated = reminders.map((r) => r.id === id ? { ...r, done: !r.done } : r);
    setReminders(updated);
    saveReminders(updated);
  }

  function handleDeleteReminder(id: string) {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  }

  function handleLessonDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentList = applyOrder(lessonList, lessonsOrder);
    const oldIndex = currentList.findIndex((l) => l.id === active.id);
    const newIndex = currentList.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(currentList, oldIndex, newIndex);
    const newOrder = reordered.map((l) => l.id);
    setLessonsOrder(newOrder);
    saveOrder(LESSONS_ORDER_KEY, newOrder);
  }

  function handleReminderDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentList = applyOrder(reminders, remindersOrder);
    const oldIndex = currentList.findIndex((r) => r.id === active.id);
    const newIndex = currentList.findIndex((r) => r.id === over.id);
    const reordered = arrayMove(currentList, oldIndex, newIndex);
    const newOrder = reordered.map((r) => r.id);
    setRemindersOrder(newOrder);
    saveOrder(REMINDERS_ORDER_KEY, newOrder);
    setReminders(reordered);
    saveReminders(reordered);
  }

  const cardStyle = {
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1,
    boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}><CircularProgress color="primary" /></Box>;
  }
  if (isError) {
    return <Typography sx={{ color: 'error.main', fontSize: '0.875rem' }}>Failed to load items</Typography>;
  }

  const lessonList = lessons ?? [];
  const sortedLessons = applyOrder(lessonList, lessonsOrder);
  const sortedReminders = applyOrder(reminders, remindersOrder);
  const totalCount = lessonList.length + reminders.length;
  const doneCount = lessonList.filter((l) => l.done).length + reminders.filter((r) => r.done).length;
  const criticalCount = lessonList.filter((l) => l.importance >= 4).length;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ width: 3, height: 28, bgcolor: 'warning.main', borderRadius: 1 }} />
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
              Tasks & Learning
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>Tasks, learning items, and skill reminders</Typography>
          </Box>
        </Stack>
        <Button variant="outlined" size="small" onClick={() => setAddOpen(true)}
          sx={{ textTransform: 'none', borderColor: 'primary.main', color: 'primary.main', fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(26,115,232,0.06)' } }}>
          + Add Item
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} mb={1.5}>
        {[
          { label: 'Total', value: totalCount, color: theme.palette.text.primary },
          { label: 'Done', value: doneCount, color: theme.palette.success.main },
          { label: 'Remaining', value: totalCount - doneCount, color: theme.palette.warning.main },
          { label: 'Critical', value: criticalCount, color: theme.palette.primary.main },
        ].map((s) => (
          <Box key={s.label} sx={{ flex: 1, px: 1, py: 0.75, ...cardStyle, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 500, color: s.color, fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mt: 0.2 }}>{s.label}</Typography>
          </Box>
        ))}

        <Box sx={{ flex: 3, px: 1.5, py: 0.75, ...cardStyle }}>
          <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mb: 0.75 }}>Priority Legend</Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {[1, 2, 3, 4, 5].map((i) => (
              <Stack key={i} direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: IMPORTANCE_COLOR[i] }} />
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>{IMPORTANCE_LABEL[i]}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      <Stack spacing={0.5}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
          <SortableContext items={sortedLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            {sortedLessons.map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} index={i} onToggleDone={(id) => toggleMutation.mutate(id)} onDelete={(id) => deleteMutation.mutate(id)} />
            ))}
          </SortableContext>
        </DndContext>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReminderDragEnd}>
          <SortableContext items={sortedReminders.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            {sortedReminders.map((reminder, i) => (
              <ReminderCard key={reminder.id} reminder={reminder} index={sortedLessons.length + i} onToggle={handleToggleReminder} onDelete={handleDeleteReminder} />
            ))}
          </SortableContext>
        </DndContext>

        {totalCount === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
              Nothing added yet — click "+ Add Item" to get started
            </Typography>
          </Box>
        )}
      </Stack>

      <AddItemDialog open={addOpen} onClose={() => setAddOpen(false)} onReminderAdded={() => setReminders(loadReminders())} />
    </Box>
  );
}
