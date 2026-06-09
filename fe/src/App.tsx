import { useState, useMemo } from 'react';
import { Box, Stack, Typography, ButtonBase, IconButton, ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import OverviewPage from './pages/OverviewPage';
import SkillsPage from './pages/SkillsPage';
import ProjectsPage from './pages/ProjectsPage';
import LessonsPage from './pages/LessonsPage';
import SettingsPage from './pages/SettingsPage';

const TABS = [
  { label: 'Overview' },
  { label: 'Skills' },
  { label: 'Projects' },
  { label: 'Task' },
  { label: 'Settings' },
];

const GOOGLE_COLORS = ['#4285f4', '#ea4335', '#fbbc04', '#34a853'];

function buildTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'light' ? '#f8f9fa' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      primary: {
        main: '#1a73e8',
        light: '#4fc3f7',
        dark: '#1557b0',
      },
      secondary: {
        main: '#0288d1',
        light: '#b3e5fc',
        dark: '#01579b',
      },
      error: { main: '#d93025' },
      warning: { main: '#f9ab00' },
      success: { main: '#1e8e3e' },
      info: { main: '#1a73e8' },
      text: {
        primary: mode === 'light' ? '#202124' : '#e8eaed',
        secondary: mode === 'light' ? '#5f6368' : '#9aa0a6',
        disabled: mode === 'light' ? '#9aa0a6' : '#5f6368',
      },
      divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
      h1: { fontWeight: 500 },
      h2: { fontWeight: 500 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.5 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: ${mode === 'light' ? '#f1f3f4' : '#2a2a2a'}; }
          ::-webkit-scrollbar-thumb { background: ${mode === 'light' ? '#bdc1c6' : '#5f6368'}; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: ${mode === 'light' ? '#9aa0a6' : '#80868b'}; }

          body { background: ${mode === 'light' ? '#f8f9fa' : '#121212'}; }
        `,
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: mode === 'light' ? '#ffffff' : '#1e1e1e',
            border: 'none',
            borderRadius: 8,
            boxShadow: mode === 'light'
              ? '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'
              : '0 1px 2px rgba(0,0,0,0.5), 0 1px 3px 1px rgba(0,0,0,0.3)',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)'
                : '0 1px 3px rgba(0,0,0,0.5), 0 4px 8px 3px rgba(0,0,0,0.3)',
            },
            transition: 'box-shadow 0.2s ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
          outlined: {
            borderColor: 'rgba(26,115,232,0.3)',
            color: '#1a73e8',
            '&:hover': { borderColor: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.08)' },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)',
            height: 4,
          },
          bar: {
            borderRadius: 2,
            background: 'linear-gradient(90deg, #1a73e8, #42a5f5)',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            color: mode === 'light' ? '#5f6368' : '#9aa0a6',
            minHeight: 48,
            '&.Mui-selected': {
              color: '#1a73e8',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: '#1a73e8',
            height: 3,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#dadce0' : '#5f6368',
            '&.Mui-checked': {
              color: '#1a73e8',
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1a73e8',
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(26,115,232,0.08)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(26,115,232,0.12)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#5f6368' : '#9aa0a6',
            '&:hover': {
              color: '#1a73e8',
              backgroundColor: 'rgba(26,115,232,0.08)',
            },
          },
        },
      },
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: '#1a73e8' },
          iconEmpty: { color: 'rgba(26,115,232,0.2)' },
        },
      },
    },
  });
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => buildTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  const headerBg = darkMode ? '#1e1e1e' : '#ffffff';
  const titleColor = darkMode ? '#e8eaed' : '#202124';
  const subtitleColor = darkMode ? '#9aa0a6' : '#5f6368';
  const tabActive = '#1a73e8';
  const tabInactive = darkMode ? '#9aa0a6' : '#5f6368';
  const tabHover = darkMode ? '#e8eaed' : '#202124';
  const footerBg = darkMode ? '#1e1e1e' : '#ffffff';
  const footerBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            background: headerBg,
            borderBottom: `1px solid ${footerBorder}`,
            boxShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(60,64,67,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          {/* Title bar */}
          <Box sx={{ px: 3, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    color: titleColor,
                    lineHeight: 1.2,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  }}
                >
                  Skill Progress
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: subtitleColor,
                    lineHeight: 1,
                    fontFamily: '"Google Sans", "Roboto", sans-serif',
                  }}
                >
                  Learning tracker
                </Typography>
              </Box>
            </Stack>

            {/* Dark mode toggle */}
            <IconButton
              onClick={() => setDarkMode((d) => !d)}
              size="small"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
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
                  color: tab === i ? tabActive : tabInactive,
                  transition: 'all 0.15s ease',
                  borderRadius: '2px 2px 0 0',
                  '&:hover': {
                    color: tab === i ? tabActive : tabHover,
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
          {tab === 4 && <SettingsPage />}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${footerBorder}`,
            px: 4,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: footerBg,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: subtitleColor }}>
            Skill Tracker — All data synced
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: subtitleColor }}>
            v0.1
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
