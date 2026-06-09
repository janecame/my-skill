import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
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
      primary: '#202124',
      secondary: '#5f6368',
      disabled: '#9aa0a6',
    },
    divider: 'rgba(0,0,0,0.08)',
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
        ::-webkit-scrollbar-track { background: #f1f3f4; }
        ::-webkit-scrollbar-thumb { background: #bdc1c6; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #9aa0a6; }

        body { background: #f8f9fa; }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: 'none',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          '&:hover': {
            boxShadow: '0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
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
          '&:hover': { borderColor: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.04)' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: 'rgba(0,0,0,0.08)',
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
          color: '#5f6368',
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
          color: '#dadce0',
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
            borderColor: 'rgba(0,0,0,0.15)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(0,0,0,0.3)',
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
            backgroundColor: 'rgba(26,115,232,0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(26,115,232,0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#5f6368',
          '&:hover': {
            color: '#1a73e8',
            backgroundColor: 'rgba(26,115,232,0.04)',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
