import { useState } from 'react';
import { Box, Stack, Typography, ButtonBase } from '@mui/material';
import OverviewPage from './pages/OverviewPage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import LessonsPage from './pages/LessonsPage';

const TABS = [
  { label: 'Overview' },
  { label: 'Skills' },
  { label: 'Projects' },
  { label: 'Lessons' },
];

const GOOGLE_COLORS = ['#4285f4', '#ea4335', '#fbbc04', '#34a853'];

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 2px rgba(60,64,67,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Title bar */}
        <Box sx={{ px: 3, py: 1, display: 'flex', alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Google-dots logo */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: 20, height: 20 }}>
              {GOOGLE_COLORS.map((color, i) => (
                <Box key={i} sx={{ borderRadius: '50%', bgcolor: color }} />
              ))}
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#202124',
                  lineHeight: 1.2,
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                Skill Progress
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: '#5f6368',
                  lineHeight: 1,
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                Learning tracker
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Navigation tabs */}
        <Stack direction="row" sx={{ px: 2 }}>
          {TABS.map((t, i) => (
            <ButtonBase
              key={t.label}
              onClick={() => setTab(i)}
              sx={{
                px: 2,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                borderBottom: tab === i ? '3px solid #1a73e8' : '3px solid transparent',
                color: tab === i ? '#1a73e8' : '#5f6368',
                transition: 'all 0.15s ease',
                borderRadius: '2px 2px 0 0',
                '&:hover': {
                  color: tab === i ? '#1a73e8' : '#202124',
                  bgcolor: 'rgba(26,115,232,0.04)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: tab === i ? 500 : 400,
                  fontFamily: '"Google Sans", "Roboto", sans-serif',
                }}
              >
                {t.label}
              </Typography>
            </ButtonBase>
          ))}
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, py: 3, maxWidth: 1100, mx: 'auto', width: '100%' }}>
        {tab === 0 && <OverviewPage />}
        {tab === 1 && <SkillsPage />}
        {tab === 2 && <ProjectsPage />}
        {tab === 3 && <LessonsPage />}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0,0,0,0.08)',
          px: 4,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
          Skill Tracker — All data synced
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#9aa0a6' }}>
          v0.1
        </Typography>
      </Box>
    </Box>
  );
}
