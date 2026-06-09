import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
  ButtonBase,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts';
import { fetchSkills, fetchGoals } from '../api';
import { Goal, MasteryLevel, Skill, SubSkill, SubSkillState } from '../types';

const MASTERY_LEVELS: MasteryLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const MASTERY_COLOR: Record<MasteryLevel, string> = {
  Beginner: '#4285f4',
  Intermediate: '#34a853',
  Advanced: '#fbbc04',
  Expert: '#ea4335',
};

const MASTERY_VALUE: Record<MasteryLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

const STORAGE_KEY = 'skill-tracker:sub-skill-states';

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

function loadStates(): Record<string, SubSkillState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStates(states: Record<string, SubSkillState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function RadialProgress({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const data = [{ name: 'progress', value, fill: '#1a73e8' }];
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'rgba(0,0,0,0.06)' }}
            dataKey="value"
            cornerRadius={2}
            fill="#1a73e8"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: size < 70 ? '0.7rem' : '0.9rem', fontWeight: 500, color: '#1a73e8', lineHeight: 1, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          {value}%
        </Typography>
        {label && (
          <Typography sx={{ fontSize: '0.5rem', color: '#9aa0a6' }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function NestedSubSkillRow({
  subSkill,
  state,
  onChange,
}: {
  subSkill: SubSkill;
  state: SubSkillState;
  onChange: (next: SubSkillState) => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ py: 0.4, px: 1 }}
    >
      <Checkbox
        checked={state.acquired}
        onChange={(e) => onChange({ ...state, acquired: e.target.checked })}
        size="small"
        sx={{ p: 0, color: state.acquired ? '#1a73e8' : '#9aa0a6' }}
      />
      <Box>
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: state.acquired ? 500 : 400,
            color: state.acquired ? '#202124' : '#9aa0a6',
            fontFamily: '"Google Sans", "Roboto", sans-serif',
          }}
        >
          {subSkill.name}
        </Typography>
        {subSkill.description && (
          <Typography sx={{ fontSize: '0.63rem', color: '#b0b8c1' }}>
            {subSkill.description}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function SubSkillRow({
  subSkill,
  states,
  onStateChange,
}: {
  subSkill: SubSkill;
  states: Record<string, SubSkillState>;
  onStateChange: (id: string, next: SubSkillState) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const nested = subSkill.sub_skills ?? [];
  const acquiredCount = nested.filter((s) => states[s.id]?.acquired).length;
  const total = nested.length;
  const progress = total > 0 ? Math.round((acquiredCount / total) * 100) : 0;

  const topState = states[subSkill.id] ?? { acquired: false, mastery: null };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: topState.acquired ? 'rgba(26,115,232,0.25)' : 'rgba(0,0,0,0.08)',
        bgcolor: topState.acquired ? 'rgba(26,115,232,0.03)' : 'transparent',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Main row */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          py: 0.75,
          px: 1.5,
          '&:hover': { bgcolor: 'rgba(26,115,232,0.04)' },
        }}
      >
        <Checkbox
          checked={topState.acquired}
          onChange={(e) => onStateChange(subSkill.id, { ...topState, acquired: e.target.checked })}
          size="small"
          sx={{ p: 0 }}
        />

        {/* Progress % */}
        {nested.length > 0 && (
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: progress === 100 ? '#1e8e3e' : '#1a73e8',
              minWidth: 32,
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            }}
          >
            {progress}%
          </Typography>
        )}

        <Box flex={1} minWidth={0}>
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: topState.acquired ? 500 : 400,
              color: topState.acquired ? '#202124' : '#5f6368',
              fontFamily: '"Google Sans", "Roboto", sans-serif',
            }}
          >
            {subSkill.name}
          </Typography>
          {subSkill.description && (
            <Typography sx={{ fontSize: '0.65rem', color: '#9aa0a6' }}>
              {subSkill.description}
            </Typography>
          )}
        </Box>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={topState.mastery ?? ''}
            displayEmpty
            disabled={!topState.acquired}
            onChange={(e) => onStateChange(subSkill.id, { ...topState, mastery: (e.target.value as MasteryLevel) || null })}
            renderValue={(val) =>
              val ? (
                <Chip
                  label={val}
                  size="small"
                  sx={{
                    bgcolor: MASTERY_COLOR[val as MasteryLevel] + '18',
                    color: MASTERY_COLOR[val as MasteryLevel],
                    border: `1px solid ${MASTERY_COLOR[val as MasteryLevel]}40`,
                    fontWeight: 500,
                    height: 20,
                    fontSize: '0.65rem',
                  }}
                />
              ) : (
                <Typography sx={{ fontSize: '0.65rem', color: '#9aa0a6', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                  Set level
                </Typography>
              )
            }
            sx={{ fontSize: '0.7rem', '& .MuiSelect-select': { py: 0.5, px: 1 } }}
          >
            <MenuItem value="">
              <Typography sx={{ fontSize: '0.7rem', color: '#5f6368' }}>— None —</Typography>
            </MenuItem>
            {MASTERY_LEVELS.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                <Chip
                  label={lvl}
                  size="small"
                  sx={{
                    bgcolor: MASTERY_COLOR[lvl] + '18',
                    color: MASTERY_COLOR[lvl],
                    border: `1px solid ${MASTERY_COLOR[lvl]}40`,
                    fontWeight: 500,
                    height: 20,
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                  }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {nested.length > 0 && (
          <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ p: 0.25 }}>
            {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        )}
      </Stack>

      {/* Nested sub-skills */}
      {nested.length > 0 && (
        <Collapse in={expanded}>
          <Box sx={{ px: 2, pb: 0.75, pt: 0.25, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(0,0,0,0.01)' }}>
            {nested.map((child) => (
              <NestedSubSkillRow
                key={child.id}
                subSkill={child}
                state={states[child.id] ?? { acquired: false, mastery: null }}
                onChange={(next) => onStateChange(child.id, next)}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function SkillRadarChart({
  skill,
  states,
}: {
  skill: Skill;
  states: Record<string, SubSkillState>;
}) {
  const data = skill.sub_skills.map((sub) => {
    const nested = sub.sub_skills ?? [];
    let value: number;
    if (nested.length > 0) {
      const acquired = nested.filter((s) => states[s.id]?.acquired).length;
      value = Math.round((acquired / nested.length) * 100);
    } else {
      value = states[sub.id]?.acquired ? 100 : 0;
    }
    const label = sub.name.length > 12 ? sub.name.slice(0, 12) + '…' : sub.name;
    return { subject: label, value };
  });

  if (data.length < 3) return null;

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Box sx={{ width: 3, height: 14, bgcolor: '#1a73e8', borderRadius: 1 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 500, color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          Sub-skill Coverage
        </Typography>
      </Stack>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(0,0,0,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'Roboto' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Progress"
            dataKey="value"
            stroke="#1a73e8"
            fill="#1a73e8"
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Progress']} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function SkillCard({
  skill,
  states,
  onStateChange,
}: {
  skill: Skill;
  states: Record<string, SubSkillState>;
  onStateChange: (subSkillId: string, next: SubSkillState) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const acquired = skill.sub_skills.filter((s) => states[s.id]?.acquired).length;
  const total = skill.sub_skills.length;
  const progress = total > 0 ? Math.round((acquired / total) * 100) : 0;

  const avgMastery = (() => {
    const masteries = skill.sub_skills
      .filter((s) => states[s.id]?.mastery)
      .map((s) => MASTERY_VALUE[states[s.id].mastery!]);
    return masteries.length > 0 ? Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length) : 0;
  })();

  return (
    <Box
      sx={{
        ...CARD_STYLE,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ px: 2, py: 1.5, borderBottom: expanded ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
      >
        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#202124',
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {skill.name}
            </Typography>
            <Chip
              label={skill.category}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontSize: '0.7rem', color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {acquired}/{total} acquired
            </Typography>
            {avgMastery > 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: '#1a73e8', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                Avg mastery {avgMastery}%
              </Typography>
            )}
          </Stack>

          <Box sx={{ mt: 0.75, height: 3, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100
                  ? 'linear-gradient(90deg, #1e8e3e, #34a853)'
                  : 'linear-gradient(90deg, #1a73e8, #42a5f5)',
                borderRadius: 2,
                transition: 'width 0.4s ease',
              }}
            />
          </Box>
        </Box>

        <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ flexShrink: 0 }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <SkillRadarChart skill={skill} states={states} />
        <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
            {skill.sub_skills.map((sub) => (
              <SubSkillRow
                key={sub.id}
                subSkill={sub}
                states={states}
                onStateChange={onStateChange}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

function GoalRadarChart({
  skills,
  states,
}: {
  skills: Skill[];
  states: Record<string, SubSkillState>;
}) {
  const data = skills.map((skill) => {
    const leafSubs = skill.sub_skills.flatMap((s) => s.sub_skills && s.sub_skills.length > 0 ? s.sub_skills : [s]);
    const acquired = leafSubs.filter((s) => states[s.id]?.acquired).length;
    const total = leafSubs.length;
    const progress = total > 0 ? Math.round((acquired / total) * 100) : 0;
    return { subject: skill.name.length > 10 ? skill.name.slice(0, 10) + '…' : skill.name, value: progress };
  });

  if (data.length < 3) return null;

  return (
    <Box sx={{ ...CARD_STYLE, p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Box sx={{ width: 3, height: 16, bgcolor: '#1a73e8', borderRadius: 1 }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#5f6368', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          Skill Distribution
        </Typography>
      </Stack>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(0,0,0,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#5f6368', fontSize: 10, fontFamily: 'Roboto' }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Progress"
            dataKey="value"
            stroke="#1a73e8"
            fill="#1a73e8"
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Progress']} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function GoalView({
  goal,
  skills,
  states,
  onStateChange,
}: {
  goal: Goal;
  skills: Skill[];
  states: Record<string, SubSkillState>;
  onStateChange: (subSkillId: string, next: SubSkillState) => void;
}) {
  const goalSkills = skills.filter((s) => s.goal_ids.includes(goal.id));
  const allSubs = goalSkills.flatMap((s) => s.sub_skills);
  const allLeafSubs = allSubs.flatMap((s) => s.sub_skills && s.sub_skills.length > 0 ? s.sub_skills : [s]);
  const acquiredCount = allLeafSubs.filter((s) => states[s.id]?.acquired).length;
  const totalCount = allLeafSubs.length;
  const overallProgress = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;

  const expertCount = allSubs.filter((s) => states[s.id]?.mastery === 'Expert').length;
  const advancedCount = allSubs.filter((s) => states[s.id]?.mastery === 'Advanced').length;

  return (
    <Box>
      {/* Goal header panel */}
      <Box
        sx={{
          ...CARD_STYLE,
          p: 2.5,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #1a73e8, #42a5f5)',
          },
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={3}>
          <RadialProgress value={overallProgress} size={96} label="overall" />

          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{goal.icon}</Typography>
              <Typography
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: '#202124',
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                {goal.name}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.8rem', color: '#5f6368', mb: 1.5, lineHeight: 1.5 }}>
              {goal.description}
            </Typography>

            <Stack direction="row" spacing={2}>
              {[
                { label: 'Skills', value: goalSkills.length, color: '#0288d1' },
                { label: 'Acquired', value: `${acquiredCount}/${totalCount}`, color: '#1a73e8' },
                { label: 'Expert', value: expertCount, color: '#ea4335' },
                { label: 'Advanced', value: advancedCount, color: '#f9ab00' },
              ].map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 1,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    minWidth: 60,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: stat.color, fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: '#80868b', mt: 0.25 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <GoalRadarChart skills={goalSkills} states={states} />

      <Stack spacing={1.5}>
        {goalSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            states={states}
            onStateChange={onStateChange}
          />
        ))}
        {goalSkills.length === 0 && (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              border: '1px dashed rgba(0,0,0,0.15)',
              borderRadius: 2,
            }}
          >
            <Typography sx={{ color: '#9aa0a6', fontSize: '0.8rem' }}>
              No skills configured for this goal
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [states, setStates] = useState<Record<string, SubSkillState>>(loadStates);

  useEffect(() => {
    saveStates(states);
  }, [states]);

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  const { data: skills, isLoading: skillsLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
  });

  const handleStateChange = (subSkillId: string, next: SubSkillState) => {
    setStates((prev) => ({ ...prev, [subSkillId]: next }));
  };

  if (goalsLoading || skillsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#1a73e8' }} />
      </Box>
    );
  }
  if (isError) {
    return (
      <Typography sx={{ color: '#d93025', fontSize: '0.875rem' }}>
        Failed to load skills data
      </Typography>
    );
  }

  const activeGoal = goals?.[activeTab];

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
            Skills
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#5f6368', mt: 0.25 }}>
            Track mastery & sub-skill progress
          </Typography>
        </Box>
      </Stack>

      {/* Goal tabs */}
      <Stack direction="row" spacing={0} sx={{ mb: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        {goals?.map((goal, i) => (
          <ButtonBase
            key={goal.id}
            onClick={() => setActiveTab(i)}
            sx={{
              px: 2.5,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: 'relative',
              borderBottom: activeTab === i ? '3px solid #1a73e8' : '3px solid transparent',
              color: activeTab === i ? '#1a73e8' : '#5f6368',
              transition: 'all 0.15s',
              borderRadius: '2px 2px 0 0',
              '&:hover': {
                color: activeTab === i ? '#1a73e8' : '#202124',
                bgcolor: 'rgba(26,115,232,0.04)',
              },
            }}
          >
            <Typography sx={{ fontSize: '0.85rem' }}>{goal.icon}</Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: activeTab === i ? 500 : 400,
                fontFamily: '"Google Sans", "Roboto", sans-serif',
              }}
            >
              {goal.name}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>

      {activeGoal && skills && (
        <GoalView
          goal={activeGoal}
          skills={skills}
          states={states}
          onStateChange={handleStateChange}
        />
      )}
    </Box>
  );
}
