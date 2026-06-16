import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchSkills, fetchProjects, fetchLessons, fetchGoals } from '../api';
import { Lesson, LearnReminder, LessonItemType, MasteryLevel } from '../types';
import { loadLearnReminders } from '../utils/reminders';

type AllItemType = LessonItemType | 'reminder';

const ITEM_TYPE_ORDER: Record<AllItemType, number> = { task: 0, reminder: 1, learn: 2, skill: 3 };
const ITEM_TYPE_CONFIG: Record<AllItemType, { label: string; color: string; bg: string; border: string }> = {
  task: { label: 'Task', color: '#f9ab00', bg: 'rgba(249,171,0,0.1)', border: 'rgba(249,171,0,0.35)' },
  learn: { label: 'Learn', color: '#1a73e8', bg: 'rgba(26,115,232,0.08)', border: 'rgba(26,115,232,0.3)' },
  skill: { label: 'Skill', color: '#1e8e3e', bg: 'rgba(30,142,62,0.08)', border: 'rgba(30,142,62,0.3)' },
  reminder: { label: 'Reminder', color: '#1e8e3e', bg: 'rgba(30,142,62,0.08)', border: 'rgba(30,142,62,0.3)' },
};

type QueueItem =
  | { kind: 'lesson'; data: Lesson }
  | { kind: 'reminder'; data: LearnReminder };

function getTypeOrder(item: QueueItem): number {
  if (item.kind === 'reminder') return ITEM_TYPE_ORDER.reminder;
  return ITEM_TYPE_ORDER[item.data.item_type ?? 'task'];
}

function getSortKey(item: QueueItem): number {
  if (item.kind === 'reminder') {
    return item.data.startDate ? new Date(item.data.startDate).getTime() : Infinity;
  }
  return -(item.data.importance ?? 0);
}

function sortQueue(items: QueueItem[]): QueueItem[] {
  return [...items].sort((a, b) => {
    const typeA = getTypeOrder(a);
    const typeB = getTypeOrder(b);
    if (typeA !== typeB) return typeA - typeB;
    return getSortKey(a) - getSortKey(b);
  });
}

function TypeBadge({ type }: { type: AllItemType }) {
  const cfg = ITEM_TYPE_CONFIG[type];
  return (
    <Box sx={{ px: 0.75, py: 0.1, border: `1px solid ${cfg.border}`, bgcolor: cfg.bg, borderRadius: 0.75, flexShrink: 0 }}>
      <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: cfg.color, fontFamily: '"Google Sans", "Roboto", sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {cfg.label}
      </Typography>
    </Box>
  );
}

const MASTERY_VALUE: Record<MasteryLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};


function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  const theme = useTheme();
  return (
    <Box sx={{
      flex: 1, px: 1.5, py: 1.5, textAlign: 'center', minWidth: 80,
      bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 1px 2px rgba(0,0,0,0.5)'
        : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
    }}>
      <Typography sx={{ fontSize: '1.8rem', fontWeight: 500, color: color ?? 'primary.main', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', mt: 0.25 }}>{label}</Typography>
      {sub && <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mt: 0.25 }}>{sub}</Typography>}
    </Box>
  );
}

function SectionHeader({ label, color = 'primary.main' }: { label: string; color?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
      <Box sx={{ width: 3, height: 16, bgcolor: color, borderRadius: 1 }} />
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
        {label}
      </Typography>
    </Stack>
  );
}

function Panel({ children, mb = 3, flex }: { children: React.ReactNode; mb?: number; flex?: number | string }) {
  const theme = useTheme();
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      boxShadow: theme.palette.mode === 'dark'
        ? '0 1px 2px rgba(0,0,0,0.5)'
        : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
      p: 2,
      mb,
      ...(flex !== undefined && { flex }),
    }}>
      {children}
    </Box>
  );
}

export default function OverviewPage() {
  const theme = useTheme();
  const { data: skills, isLoading: loadingSkills } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });
  const { data: projects, isLoading: loadingProjects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: lessons, isLoading: loadingLessons } = useQuery({ queryKey: ['lessons'], queryFn: fetchLessons });
  const { data: goals, isLoading: loadingGoals } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });

  const tooltipStyle = {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  };

  if (loadingSkills || loadingProjects || loadingLessons || loadingGoals) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const allSubSkills = (skills ?? []).flatMap((s) => s.sub_skills);
  const totalSubSkills = allSubSkills.length;
  const acquiredSubSkills = allSubSkills.filter((ss) => ss.acquired).length;
  const expertSubSkills = allSubSkills.filter((ss) => ss.mastery === 'Expert').length;

  const avgMastery =
    totalSubSkills > 0
      ? Math.round(
        allSubSkills.reduce((sum, ss) => sum + (ss.mastery ? MASTERY_VALUE[ss.mastery] : 0), 0) / totalSubSkills
      )
      : 0;

  const completedProjects = (projects ?? []).filter((p) => p.status === 100).length;
  const avgProjectProgress =
    projects?.length
      ? Math.round(projects.reduce((a, p) => a + p.status, 0) / projects.length)
      : 0;

  const criticalLessons = (lessons ?? []).filter((l) => l.importance >= 4).length;

  const radarData = (goals ?? []).map((goal) => {
    const goalSkills = (skills ?? []).filter((s) => s.goal_ids.includes(goal.id));
    const goalSubSkills = goalSkills.flatMap((s) => s.sub_skills);
    const acquired = goalSubSkills.filter((ss) => ss.acquired).length;
    const pct = goalSubSkills.length > 0 ? Math.round((acquired / goalSubSkills.length) * 100) : 0;
    return { subject: goal.name.length > 14 ? goal.name.slice(0, 14) + '…' : goal.name, value: pct };
  });

  const lessonsByMonth: Record<string, { month: string; count: number; avgImportance: number }> = {};
  (lessons ?? []).forEach((l) => {
    const d = new Date(l.date_learned);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!lessonsByMonth[key]) lessonsByMonth[key] = { month: key, count: 0, avgImportance: 0 };
    lessonsByMonth[key].count += 1;
    lessonsByMonth[key].avgImportance += l.importance;
  });
  const lessonTrend = Object.values(lessonsByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({ ...m, avgImportance: parseFloat((m.avgImportance / m.count).toFixed(1)) }));

  const pendingLessons: QueueItem[] = (lessons ?? [])
    .filter((l) => !l.done)
    .map((l) => ({ kind: 'lesson', data: l }));

  const pendingReminders: QueueItem[] = loadLearnReminders()
    .filter((r) => !r.done)
    .map((r) => ({ kind: 'reminder', data: r }));

  const priorityQueue = sortQueue([...pendingLessons, ...pendingReminders]);

  const importanceColor = (imp: number) => {
    if (imp >= 5) return theme.palette.primary.main;
    if (imp >= 4) return theme.palette.warning.main;
    if (imp >= 3) return theme.palette.info.main;
    return theme.palette.text.disabled;
  };

  const axisTickColor = theme.palette.text.secondary;
  const gridColor = theme.palette.divider;

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Box sx={{ width: 3, height: 28, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Box flex={1}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
            Overview
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
            Progress summary
          </Typography>
        </Box>
      </Stack>

      {/* Top stats */}
      <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap" gap={1.5}>
        <StatCard label="Sub-skills acquired" value={`${acquiredSubSkills}/${totalSubSkills}`} color={theme.palette.success.main} />
        <StatCard label="Expert level" value={expertSubSkills} color={theme.palette.primary.main} />
        <StatCard label="Avg mastery" value={`${avgMastery}%`} color={theme.palette.info.main} />
        <StatCard label="Projects done" value={`${completedProjects}/${projects?.length ?? 0}`} color={theme.palette.success.main} />
        <StatCard label="Avg project" value={`${avgProjectProgress}%`} color={theme.palette.primary.main} />
        <StatCard label="Tasks & Learning" value={(lessons?.length ?? 0) + loadLearnReminders().length} sub={`${criticalLessons} critical`} color={theme.palette.text.secondary} />
      </Stack>

      {/* Goal radar + Skills to Learn (two columns) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3} alignItems="stretch">
        {radarData.length >= 3 && (
          <Panel mb={0} flex={1}>
            <Box>
              <SectionHeader label="Goal Progress Radar" color={theme.palette.primary.main} />
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: axisTickColor, fontSize: 10, fontFamily: 'Roboto' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: axisTickColor, fontSize: 8 }} axisLine={false} />
                  <Radar name="Progress" dataKey="value" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.12} strokeWidth={1.5} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Acquired']} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Panel>
        )}

        {priorityQueue.length > 0 && (
          <Panel mb={0} flex={1}>
            <SectionHeader label="Priority Queue" color={theme.palette.warning.main} />
            <Stack spacing={0.75}>
              {priorityQueue.map((item) => {
                if (item.kind === 'lesson') {
                  const l = item.data;
                  const impColor = importanceColor(l.importance);
                  return (
                    <Stack key={l.id} direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: impColor, borderRadius: 1, flexShrink: 0, minHeight: 20 }} />
                      <TypeBadge type={l.item_type ?? 'task'} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title}
                      </Typography>
                    </Stack>
                  );
                }
                const r = item.data;
                const isOverdue = r.startDate && new Date(r.startDate) < new Date();
                const accentColor = isOverdue ? theme.palette.error.main : '#1e8e3e';
                return (
                  <Stack key={r.id} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 3, alignSelf: 'stretch', bgcolor: accentColor, borderRadius: 1, flexShrink: 0, minHeight: 20 }} />
                    <TypeBadge type="reminder" />
                    <Box flex={1} minWidth={0}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.subSkillName}
                      </Typography>
                      {r.startDate && (
                        <Typography sx={{ fontSize: '0.62rem', color: accentColor, fontWeight: 500 }}>
                          {isOverdue ? 'Overdue · ' : 'Start: '}
                          {new Date(r.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          </Panel>
        )}
      </Stack>

      {/* Skills progress by goal */}
      {(goals ?? []).length > 0 && (
        <Panel mb={3}>
          <SectionHeader label="Skills by Goal" color={theme.palette.primary.main} />
          <Stack spacing={1.5}>
            {(goals ?? []).map((goal) => {
              const goalSkills = (skills ?? []).filter((s) => s.goal_ids.includes(goal.id));
              const goalSubs = goalSkills.flatMap((s) => s.sub_skills);
              const acquired = goalSubs.filter((ss) => ss.acquired).length;
              const pct = goalSubs.length > 0 ? Math.round((acquired / goalSubs.length) * 100) : 0;
              return (
                <Box key={goal.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: '0.9rem' }}>{goal.icon}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                        {goal.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                        {goalSkills.length} skills · {acquired}/{goalSubs.length} acquired
                      </Typography>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: pct === 100 ? 'success.main' : 'primary.main', fontFamily: '"Google Sans", "Roboto", sans-serif', minWidth: 36, textAlign: 'right' }}>
                        {pct}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box sx={{ height: 4, bgcolor: theme.palette.divider, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #1e8e3e, #34a853)' : 'linear-gradient(90deg, #1976d2, #42a5f5)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Panel>
      )}

      {/* Projects snapshot */}
      {(projects ?? []).length > 0 && (
        <Panel mb={3}>
          <SectionHeader label="Projects Snapshot" color={theme.palette.info.main} />
          <Stack spacing={1}>
            {(projects ?? [])
              .sort((a, b) => b.status - a.status)
              .map((p) => {
                const color =
                  p.status === 100 ? theme.palette.success.main
                    : p.status >= 50 ? theme.palette.primary.main
                      : p.status >= 25 ? theme.palette.info.main
                        : theme.palette.text.disabled;
                return (
                  <Stack key={p.id} direction="row" alignItems="center" spacing={1.5}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif', minWidth: 28, textAlign: 'right', flexShrink: 0 }}>
                      {p.status}%
                    </Typography>
                    <Box sx={{ flex: 1, height: 5, bgcolor: theme.palette.divider, borderRadius: 2, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${p.status}%`, bgcolor: color, borderRadius: 2 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif', minWidth: 120, flexShrink: 0 }}>
                      {p.name}
                    </Typography>
                  </Stack>
                );
              })}
          </Stack>
        </Panel>
      )}

    </Box>
  );
}
