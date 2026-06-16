import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  ButtonBase,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
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
import { fetchSkills, fetchGoals, updateSubSkillState } from '../api';
import { Goal, LearnReminder, MasteryLevel, Skill, SubSkill, SubSkillState } from '../types';
import { appendReminder } from '../utils/reminders';
import { useAuth } from '../auth/AuthContext';

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


function useCardStyle() {
  const theme = useTheme();
  return {
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 1,
    boxShadow: theme.palette.mode === 'dark'
      ? '0 1px 2px rgba(0,0,0,0.5)'
      : '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
  };
}

function useTooltipStyle() {
  const theme = useTheme();
  return {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 8,
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  };
}

function RadialProgress({ value, size = 80, label }: { value: number; size?: number; label?: string }) {
  const theme = useTheme();
  const data = [{ name: 'progress', value, fill: theme.palette.primary.main }];
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} data={data}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: theme.palette.divider }} dataKey="value" cornerRadius={2} fill={theme.palette.primary.main} />
        </RadialBarChart>
      </ResponsiveContainer>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: size < 70 ? '0.7rem' : '0.9rem', fontWeight: 500, color: 'primary.main', lineHeight: 1, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          {value}%
        </Typography>
        {label && <Typography sx={{ fontSize: '0.5rem', color: 'text.disabled' }}>{label}</Typography>}
      </Box>
    </Box>
  );
}

function NestedSubSkillRow({ subSkill, onChange, isAdmin }: { subSkill: SubSkill; onChange: (next: SubSkillState) => void; isAdmin: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.4, px: 1 }}>
      <Checkbox
        checked={subSkill.acquired}
        onChange={(e) => onChange({ acquired: e.target.checked, mastery: subSkill.mastery })}
        size="small"
        disabled={!isAdmin}
        sx={{ p: 0 }}
      />
      <Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: subSkill.acquired ? 500 : 400, color: subSkill.acquired ? 'text.primary' : 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          {subSkill.name}
        </Typography>
        {subSkill.description && (
          <Typography sx={{ fontSize: '0.63rem', color: 'text.disabled' }}>{subSkill.description}</Typography>
        )}
      </Box>
    </Stack>
  );
}

function SubSkillRow({ subSkill, onStateChange, onPlanToLearn, isAdmin }: {
  subSkill: SubSkill;
  onStateChange: (id: string, next: SubSkillState) => void;
  onPlanToLearn: () => void;
  isAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const nested = subSkill.sub_skills ?? [];
  const acquiredCount = nested.filter((s) => s.acquired).length;
  const total = nested.length;
  const progress = total > 0 ? Math.round((acquiredCount / total) * 100) : 0;

  return (
    <Box sx={{
      borderRadius: 1,
      border: '1px solid',
      borderColor: subSkill.acquired ? 'rgba(26,115,232,0.25)' : theme.palette.divider,
      bgcolor: subSkill.acquired ? 'rgba(26,115,232,0.04)' : 'transparent',
      overflow: 'hidden',
      transition: 'all 0.15s ease',
    }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75, px: 1.5, '&:hover': { bgcolor: 'rgba(26,115,232,0.04)' } }}>
        <Checkbox
          checked={subSkill.acquired}
          onChange={(e) => onStateChange(subSkill.id, { acquired: e.target.checked, mastery: subSkill.mastery })}
          size="small"
          disabled={!isAdmin}
          sx={{ p: 0 }}
        />
        {nested.length > 0 && (
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: progress === 100 ? 'success.main' : 'primary.main', minWidth: 32, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
            {progress}%
          </Typography>
        )}
        <Box flex={1} minWidth={0}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: subSkill.acquired ? 500 : 400, color: subSkill.acquired ? 'text.primary' : 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
            {subSkill.name}
          </Typography>
          {subSkill.description && (
            <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>{subSkill.description}</Typography>
          )}
        </Box>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={subSkill.mastery ?? ''}
            displayEmpty
            disabled={!isAdmin || !subSkill.acquired}
            onChange={(e) => onStateChange(subSkill.id, { acquired: subSkill.acquired, mastery: (e.target.value as MasteryLevel) || null })}
            renderValue={(val: string) =>
              val ? (
                <Chip label={val} size="small" sx={{ bgcolor: MASTERY_COLOR[val as MasteryLevel] + '18', color: MASTERY_COLOR[val as MasteryLevel], border: `1px solid ${MASTERY_COLOR[val as MasteryLevel]}40`, fontWeight: 500, height: 20, fontSize: '0.65rem' }} />
              ) : (
                <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>Set level</Typography>
              )
            }
            sx={{ fontSize: '0.7rem', '& .MuiSelect-select': { py: 0.5, px: 1 } }}
          >
            <MenuItem value="">
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>— None —</Typography>
            </MenuItem>
            {MASTERY_LEVELS.map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                <Chip label={lvl} size="small" sx={{ bgcolor: MASTERY_COLOR[lvl] + '18', color: MASTERY_COLOR[lvl], border: `1px solid ${MASTERY_COLOR[lvl]}40`, fontWeight: 500, height: 20, fontSize: '0.65rem', cursor: 'pointer' }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {isAdmin && (
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onPlanToLearn(); }}
            sx={{ p: 0.25, color: 'text.disabled', flexShrink: 0, '&:hover': { color: 'primary.main', bgcolor: 'rgba(26,115,232,0.08)' } }}
            title="Plan to learn"
          >
            <BookmarkAddIcon sx={{ fontSize: 15 }} />
          </IconButton>
        )}
        {nested.length > 0 && (
          <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ p: 0.25 }}>
            {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        )}
      </Stack>
      {nested.length > 0 && (
        <Collapse in={expanded}>
          <Box sx={{ px: 2, pb: 0.75, pt: 0.25, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
            {nested.map((child) => (
              <NestedSubSkillRow key={child.id} subSkill={child} onChange={(next) => onStateChange(child.id, next)} isAdmin={isAdmin} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

function SkillRadarChart({ skill }: { skill: Skill }) {
  const theme = useTheme();
  const tooltipStyle = useTooltipStyle();
  const data = skill.sub_skills.map((sub) => {
    const nested = sub.sub_skills ?? [];
    let value: number;
    if (nested.length > 0) {
      const acquired = nested.filter((s) => s.acquired).length;
      value = Math.round((acquired / nested.length) * 100);
    } else {
      value = sub.acquired ? 100 : 0;
    }
    return { subject: sub.name.length > 12 ? sub.name.slice(0, 12) + '…' : sub.name, value };
  });
  if (data.length < 3) return null;

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Box sx={{ width: 3, height: 14, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 500, color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          Sub-skill Coverage
        </Typography>
      </Stack>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid stroke={theme.palette.divider} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontFamily: 'Roboto' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Progress" dataKey="value" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.12} strokeWidth={2} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Progress']} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function SkillCard({ skill, onStateChange, onPlanToLearn, isAdmin }: {
  skill: Skill;
  onStateChange: (subSkillId: string, next: SubSkillState) => void;
  onPlanToLearn: (subSkillName: string) => void;
  isAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();
  const cardStyle = useCardStyle();

  const acquired = skill.sub_skills.filter((s) => s.acquired).length;
  const total = skill.sub_skills.length;
  const progress = total > 0 ? Math.round((acquired / total) * 100) : 0;

  const avgMastery = (() => {
    const masteries = skill.sub_skills.filter((s) => s.mastery).map((s) => MASTERY_VALUE[s.mastery!]);
    return masteries.length > 0 ? Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length) : 0;
  })();

  return (
    <Box sx={{ ...cardStyle, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)' } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 2, py: 1.5, borderBottom: expanded ? `1px solid ${theme.palette.divider}` : 'none' }}>
        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {skill.name}
            </Typography>
            <Chip label={skill.category} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {acquired}/{total} acquired
            </Typography>
            {avgMastery > 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: 'primary.main', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                Avg mastery {avgMastery}%
              </Typography>
            )}
          </Stack>
          <Box sx={{ mt: 0.75, height: 3, borderRadius: 2, bgcolor: theme.palette.divider, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`, background: progress === 100 ? 'linear-gradient(90deg, #1e8e3e, #34a853)' : 'linear-gradient(90deg, #1a73e8, #42a5f5)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </Box>
        </Box>
        <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ flexShrink: 0 }}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Stack>
      <Collapse in={expanded}>
        <SkillRadarChart skill={skill} />
        <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={0.5} sx={{ px: 2, py: 1.5 }}>
            {skill.sub_skills.map((sub) => (
              <SubSkillRow key={sub.id} subSkill={sub} onStateChange={onStateChange}
                onPlanToLearn={() => onPlanToLearn(sub.name)} isAdmin={isAdmin} />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

function GoalRadarChart({ skills }: { skills: Skill[] }) {
  const theme = useTheme();
  const cardStyle = useCardStyle();
  const tooltipStyle = useTooltipStyle();

  const data = skills.map((skill) => {
    const leafSubs = skill.sub_skills.flatMap((s) => s.sub_skills && s.sub_skills.length > 0 ? s.sub_skills : [s]);
    const acquired = leafSubs.filter((s) => s.acquired).length;
    const total = leafSubs.length;
    const progress = total > 0 ? Math.round((acquired / total) * 100) : 0;
    return { subject: skill.name.length > 10 ? skill.name.slice(0, 10) + '…' : skill.name, value: progress };
  });
  if (data.length < 3) return null;

  return (
    <Box sx={{ ...cardStyle, p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Box sx={{ width: 3, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.secondary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
          Skill Distribution
        </Typography>
      </Stack>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke={theme.palette.divider} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontFamily: 'Roboto' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Progress" dataKey="value" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.12} strokeWidth={2} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Progress']} />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function GoalView({ goal, skills, onStateChange, onPlanToLearn, isAdmin }: {
  goal: Goal;
  skills: Skill[];
  onStateChange: (subSkillId: string, next: SubSkillState) => void;
  onPlanToLearn: (subSkillName: string, skillName: string, goalName: string) => void;
  isAdmin: boolean;
}) {
  const theme = useTheme();
  const cardStyle = useCardStyle();

  const goalSkills = skills.filter((s) => s.goal_ids.includes(goal.id));
  const allSubs = goalSkills.flatMap((s) => s.sub_skills);
  const allLeafSubs = allSubs.flatMap((s) => s.sub_skills && s.sub_skills.length > 0 ? s.sub_skills : [s]);
  const acquiredCount = allLeafSubs.filter((s) => s.acquired).length;
  const totalCount = allLeafSubs.length;
  const overallProgress = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;
  const expertCount = allSubs.filter((s) => s.mastery === 'Expert').length;
  const advancedCount = allSubs.filter((s) => s.mastery === 'Advanced').length;

  return (
    <Box>
      <Box sx={{ ...cardStyle, p: 2.5, mb: 3, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #1a73e8, #42a5f5)' } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={3}>
          <RadialProgress value={overallProgress} size={96} label="overall" />
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography sx={{ fontSize: '1.4rem', lineHeight: 1 }}>{goal.icon}</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
                {goal.name}
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1.5, lineHeight: 1.5 }}>
              {goal.description}
            </Typography>
            <Stack direction="row" spacing={2}>
              {[
                { label: 'Skills', value: goalSkills.length, color: theme.palette.info.main },
                { label: 'Acquired', value: `${acquiredCount}/${totalCount}`, color: theme.palette.primary.main },
                { label: 'Expert', value: expertCount, color: '#ea4335' },
                { label: 'Advanced', value: advancedCount, color: theme.palette.warning.main },
              ].map((stat) => (
                <Box key={stat.label} sx={{ px: 1.5, py: 0.75, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', minWidth: 60, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: stat.color, fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mt: 0.25 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <GoalRadarChart skills={goalSkills} />

      <Stack spacing={1.5}>
        {goalSkills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onStateChange={onStateChange}
            onPlanToLearn={(subSkillName) => onPlanToLearn(subSkillName, skill.name, goal.name)} isAdmin={isAdmin} />
        ))}
        {goalSkills.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, borderRadius: 2 }}>
            <Typography sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>
              No skills configured for this goal
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

interface PlanDialogState {
  open: boolean;
  subSkillName: string;
  skillName: string;
  goalName: string;
}

function PlanToLearnDialog({ state, onClose }: { state: PlanDialogState; onClose: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const reminder: LearnReminder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      subSkillName: state.subSkillName,
      skillName: state.skillName,
      goalName: state.goalName,
      startDate,
      addedAt: new Date().toISOString(),
      done: false,
    };
    appendReminder(reminder);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  }

  function handleClose() {
    setStartDate('');
    setSaved(false);
    onClose();
  }

  return (
    <Dialog open={state.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Google Sans", "Roboto", sans-serif', fontSize: '1rem', fontWeight: 500, pb: 1 }}>
        Plan to Learn
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mb: 0.25 }}>Sub-skill</Typography>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {state.subSkillName}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled', mb: 0.25 }}>Skill · Goal</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {state.skillName}{state.goalName ? ` · ${state.goalName}` : ''}
            </Typography>
          </Box>
          <TextField
            label="Plan to start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="small" sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" size="small" disabled={!startDate || saved}
          sx={{ textTransform: 'none', bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}>
          {saved ? 'Saved!' : 'Add to Learn List'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function SkillsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [planDialog, setPlanDialog] = useState<PlanDialogState>({ open: false, subSkillName: '', skillName: '', goalName: '' });
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: goals, isLoading: goalsLoading } = useQuery({ queryKey: ['goals'], queryFn: fetchGoals });
  const { data: skills, isLoading: skillsLoading, isError } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills });

  const mutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: SubSkillState }) =>
      updateSubSkillState(id, next.acquired, next.mastery),
    onMutate: async ({ id, next }) => {
      await queryClient.cancelQueries({ queryKey: ['skills'] });
      const prev = queryClient.getQueryData<Skill[]>(['skills']);
      queryClient.setQueryData<Skill[]>(['skills'], (old) =>
        old?.map((skill) => ({
          ...skill,
          sub_skills: skill.sub_skills.map((ss) =>
            ss.id === id
              ? { ...ss, ...next }
              : { ...ss, sub_skills: ss.sub_skills?.map((nested) => nested.id === id ? { ...nested, ...next } : nested) }
          ),
        }))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['skills'], ctx.prev);
    },
  });

  const handleStateChange = (subSkillId: string, next: SubSkillState) => {
    mutation.mutate({ id: subSkillId, next });
  };

  if (goalsLoading || skillsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }
  if (isError) {
    return <Typography sx={{ color: 'error.main', fontSize: '0.875rem' }}>Failed to load skills data</Typography>;
  }

  const activeGoal = goals?.[activeTab];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Box sx={{ width: 3, height: 28, bgcolor: 'primary.main', borderRadius: 1 }} />
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 500, color: 'text.primary', fontFamily: '"Google Sans", "Roboto", sans-serif', lineHeight: 1 }}>
            Skills
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
            Track mastery & sub-skill progress · bookmark icon to plan learning
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0} sx={{ mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {goals?.map((goal, i) => (
          <ButtonBase
            key={goal.id}
            onClick={() => setActiveTab(i)}
            sx={{
              px: 2.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1, position: 'relative',
              borderBottom: activeTab === i ? '3px solid #1a73e8' : '3px solid transparent',
              color: activeTab === i ? 'primary.main' : 'text.secondary',
              transition: 'all 0.15s', borderRadius: '2px 2px 0 0',
              '&:hover': { color: activeTab === i ? 'primary.main' : 'text.primary', bgcolor: 'rgba(26,115,232,0.04)' },
            }}
          >
            <Typography sx={{ fontSize: '0.85rem' }}>{goal.icon}</Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: activeTab === i ? 500 : 400, fontFamily: '"Google Sans", "Roboto", sans-serif' }}>
              {goal.name}
            </Typography>
          </ButtonBase>
        ))}
      </Stack>

      {activeGoal && skills && (
        <GoalView
          goal={activeGoal}
          skills={skills}
          onStateChange={handleStateChange}
          onPlanToLearn={(subSkillName, skillName, goalName) =>
            setPlanDialog({ open: true, subSkillName, skillName, goalName })
          }
          isAdmin={isAdmin}
        />
      )}

      <PlanToLearnDialog
        state={planDialog}
        onClose={() => setPlanDialog((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}
