import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#050505' : '#f9fafb',
        paper: isDark ? '#0A0A0A' : '#ffffff',
      },
      primary: {
        main: '#4338ca',
        light: '#6366f1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#10b981',
        contrastText: '#ffffff',
      },
      text: {
        primary: isDark ? '#e5e7eb' : '#111827',
        secondary: isDark ? '#9ca3af' : '#6b7280',
      },
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },
    typography: {
      fontFamily: '"Montserrat", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.75rem' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.25rem' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem' },
      subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
      subtitle2: { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
      body2: { fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: isDark ? "#333 #050505" : "#ccc #f9fafb",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: isDark ? "#333" : "#ccc",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none', 
            backgroundColor: isDark ? '#0A0A0A' : '#ffffff',
            boxShadow: isDark 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out',
            '&:hover': {
              boxShadow: isDark 
                ? '0 8px 30px rgba(0, 0, 0, 0.7)' 
                : '0 8px 30px rgba(0, 0, 0, 0.1)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            }
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px',
            '&:last-child': { paddingBottom: '20px' }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#050505' : '#ffffff',
            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(5, 5, 5, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            boxShadow: 'none',
            color: isDark ? '#ffffff' : '#111827',
          },
        },
      },
    },
  });
};
