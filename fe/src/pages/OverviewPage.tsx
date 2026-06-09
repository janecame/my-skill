import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
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
import { MasteryLevel, SubSkillState } from '../types';

const STORAGE_KEY = 'skill-tracker:sub-skill-states';
const MASTERY_VALUE: Record<MasteryLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

const CARD_STYLE = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: 2,
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

function loadStates(): Record<string, SubSkillState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Box sx={{ flex: 1, px: 1.5, py: 1.5, ...CARD_STYLE, textAlign: 'center', minWidth: 80 }}>
      <Typography
        sx={{
          fontSize: '1.8rem',
          fontWeight: 500,
          color: color ?? '#1a73e8',
          fontFamily: '"Google Sans", "Roboto", sans-serif',
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', color: '#80868b', mt: 0.25 }}>
        {label}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: '0.6rem', color: '#9aa0a6', mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

function SectionHeader({ label, color = '#1a73e8' }: { label: string; color?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
      <Box sx={{ width: 3, height: 16, bgcolor: color, borderRadius: 1 }} />
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: '#5f6368',
          fontFamily: '"Google Sans", "Roboto", sans-serif',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

function Panel({ children, mb = 3 }: { children: React.ReactNode; mb?: number }) {
  return (
    <Box sx={{ ...CARD_STYLE, p: 2, mb }}>
      {children}
    </Box>
  );
}

export default function OverviewPage() {
  const { data: skills, isLoading: loadingSkills } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });
  const { data: projects, isLoading: loadingProjects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: lessons, isLoading: loadingLessons } = useQuery({ queryKey: ['lessons'], queryFn: fetchLessons });
  const { data: goals, isLoading: loadingGoals } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });

  if (loadingSkills || loadingProjects || loadingLessons || loadingGoals) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#1a73e8' }} />
      </Box>
    );
  }

  const states = loadStates();

  const allSubSkills = (skills ?? []).flatMap((s) =>
    s.sub_skills.map((ss) => ({ ...ss, state: states[ss.id] as SubSkillState | undefined }))
  );
  const totalSubSkills = allSubSkills.length;
  const acquiredSubSkills = allSubSkills.filter((ss) => ss.state?.acquired).length;
  const expertSubSkills = allSubSkills.filter((ss) => ss.state?.mastery === 'Expert').length;

  const avgMastery =
    totalSubSkills > 0
      ? Math.round(
          allSubSkills.reduce((sum, ss) => {
            const m = ss.state?.mastery;
            return sum + (m ? MASTERY_VALUE[m] : 0);
          }, 0) / totalSubSkills
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
    const acquired = goalSubSkills.filter((ss) => states[ss.id]?.acquired).length;
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

  const recentLessons = [...(lessons ?? [])]
    .sort((a, b) => new Date(b.date_learned).getTime() - new Date(a.date_learned).getTime())
    .slice(0, 5);

  const importanceColor = (imp: number) => {
    if (imp >= 5) return '#1a73e8';
    if (imp >= 4) return '#f9ab00';
    if (imp >= 3) return '#0288d1';
    return '#9aa0a6';
  };

  return (
    <Box>
      {/* Page header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Box sx={{ width: 3, height: 28, bgcolor: '#1a73e8', borderRadius: 1 }} />
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
            Overview
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.25 }}>
            Progress summary
          </Typography>
        </Box>
      </Stack>

      {/* Top stats */}
      <Stack direction="row" spacing={1.5} mb={3} flexWrap="wrap" gap={1.5}>
        <StatCard label="Sub-skills acquired" value={`${acquiredSubSkills}/${totalSubSkills}`} color="#1e8e3e" />
        <StatCard label="Expert level" value={expertSubSkills} color="#1a73e8" />
        <StatCard label="Avg mastery" value={`${avgMastery}%`} color="#0288d1" />
        <StatCard label="Projects done" value={`${completedProjects}/${projects?.length ?? 0}`} color="#1e8e3e" />
        <StatCard label="Avg project" value={`${avgProjectProgress}%`} color="#1a73e8" />
        <StatCard label="Lessons" value={lessons?.length ?? 0} sub={`${criticalLessons} critical`} color="#5f6368" />
      </Stack>

      {/* Goal radar + lesson trend */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        {radarData.length >= 3 && (
          <Panel mb={0}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader label="Goal Progress Radar" color="#1a73e8" />
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <PolarGrid stroke="rgba(0,0,0,0.08)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'Roboto' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#9aa0a6', fontSize: 8 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Progress"
                    dataKey="value"
                    stroke="#1a73e8"
                    fill="#1a73e8"
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Acquired']} />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Panel>
        )}

        {lessonTrend.length > 0 && (
          <Panel mb={0}>
            <Box sx={{ flex: 1 }}>
              <SectionHeader label="Lessons Over Time" color="#0288d1" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={lessonTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lessonGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0288d1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0288d1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#80868b', fontSize: 9, fontFamily: 'Roboto' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9aa0a6', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Lessons"
                    stroke="#0288d1"
                    fill="url(#lessonGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Panel>
        )}
      </Stack>

      {/* Skills progress by goal */}
      {(goals ?? []).length > 0 && (
        <Panel mb={3}>
          <SectionHeader label="Skills by Goal" color="#1a73e8" />
          <Stack spacing={1.5}>
            {(goals ?? []).map((goal) => {
              const goalSkills = (skills ?? []).filter((s) => s.goal_ids.includes(goal.id));
              const goalSubs = goalSkills.flatMap((s) => s.sub_skills);
              const acquired = goalSubs.filter((ss) => states[ss.id]?.acquired).length;
              const pct = goalSubs.length > 0 ? Math.round((acquired / goalSubs.length) * 100) : 0;
              return (
                <Box key={goal.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: '0.9rem' }}>{goal.icon}</Typography>
                      <Typography
                        sx={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: '#202124',
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                        }}
                      >
                        {goal.name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography sx={{ fontSize: '0.7rem', color: '#5f6368' }}>
                        {goalSkills.length} skills · {acquired}/{goalSubs.length} acquired
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: pct === 100 ? '#1e8e3e' : '#1a73e8',
                          fontFamily: '"Google Sans", "Roboto", sans-serif',
                          minWidth: 36,
                          textAlign: 'right',
                        }}
                      >
                        {pct}%
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box sx={{ height: 4, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${pct}%`,
                        background: pct === 100
                          ? 'linear-gradient(90deg, #1e8e3e, #34a853)'
                          : 'linear-gradient(90deg, #1976d2, #42a5f5)',
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }}
                    />
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
          <SectionHeader label="Projects Snapshot" color="#0288d1" />
          <Stack spacing={1}>
            {(projects ?? [])
              .sort((a, b) => b.status - a.status)
              .map((p) => {
                const color =
                  p.status === 100
                    ? '#1e8e3e'
                    : p.status >= 50
                    ? '#1a73e8'
                    : p.status >= 25
                    ? '#0288d1'
                    : '#9aa0a6';
                return (
                  <Stack key={p.id} direction="row" alignItems="center" spacing={1.5}>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: '#5f6368',
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        minWidth: 28,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      {p.status}%
                    </Typography>
                    <Box sx={{ flex: 1, height: 5, bgcolor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${p.status}%`,
                          bgcolor: color,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: '#5f6368',
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                        minWidth: 120,
                        flexShrink: 0,
                      }}
                    >
                      {p.name}
                    </Typography>
                  </Stack>
                );
              })}
          </Stack>
        </Panel>
      )}

      {/* Recent lessons */}
      {recentLessons.length > 0 && (
        <Panel mb={0}>
          <SectionHeader label="Recent Lessons" color="#f9ab00" />
          <Stack spacing={1}>
            {recentLessons.map((l) => (
              <Stack key={l.id} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 3,
                    alignSelf: 'stretch',
                    bgcolor: importanceColor(l.importance),
                    borderRadius: 1,
                    flexShrink: 0,
                    minHeight: 24,
                  }}
                />
                <Box flex={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#202124',
                        fontFamily: '"Google Sans", "Roboto", sans-serif',
                      }}
                    >
                      {l.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#9aa0a6', flexShrink: 0, ml: 1 }}>
                      {new Date(l.date_learned).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: '#5f6368',
                      lineHeight: 1.5,
                      mt: 0.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {l.content}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Panel>
      )}
    </Box>
  );
}
