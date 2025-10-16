import { createTheme } from '@mui/material/styles';

// Modern Vibrant Color Palette
const modernColors = {
  // Primary - Deep Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Secondary - Vibrant Purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Success - Emerald
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Error - Rose
  error: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  // Neutral - Slate
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Create Modern Theme
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: modernColors.primary[600],
      light: modernColors.primary[400],
      dark: modernColors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: modernColors.secondary[600],
      light: modernColors.secondary[400],
      dark: modernColors.secondary[800],
      contrastText: '#ffffff',
    },
    success: {
      main: modernColors.success[600],
      light: modernColors.success[400],
      dark: modernColors.success[800],
      contrastText: '#ffffff',
    },
    warning: {
      main: modernColors.warning[500],
      light: modernColors.warning[400],
      dark: modernColors.warning[700],
      contrastText: '#ffffff',
    },
    error: {
      main: modernColors.error[600],
      light: modernColors.error[400],
      dark: modernColors.error[800],
      contrastText: '#ffffff',
    },
    background: {
      default: modernColors.neutral[50],
      paper: '#ffffff',
    },
    surface: {
      main: '#ffffff',
      variant: modernColors.neutral[100],
    },
    text: {
      primary: modernColors.neutral[900],
      secondary: modernColors.neutral[600],
      disabled: modernColors.neutral[400],
    },
    divider: modernColors.neutral[200],
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Inter',
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    h2: {
      fontFamily: 'Inter',
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    h3: {
      fontFamily: 'Inter',
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    h4: {
      fontFamily: 'Inter',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    h5: {
      fontFamily: 'Inter',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    h6: {
      fontFamily: 'Inter',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: modernColors.neutral[900],
    },
    body1: {
      fontFamily: 'Inter',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em',
      color: modernColors.neutral[700],
    },
    body2: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em',
      color: modernColors.neutral[600],
    },
    button: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
      textTransform: 'none',
    },
    caption: {
      fontFamily: 'Inter',
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: modernColors.neutral[500],
    },
  },
  shape: {
    borderRadius: 16, // More rounded corners
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          minHeight: 44,
          fontSize: '0.875rem',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${modernColors.primary[600]} 0%, ${modernColors.primary[700]} 100%)`,
          color: '#ffffff',
          '&:hover': {
            background: `linear-gradient(135deg, ${modernColors.primary[700]} 0%, ${modernColors.primary[800]} 100%)`,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: modernColors.neutral[300],
          color: modernColors.neutral[700],
          '&:hover': {
            borderWidth: 2,
            backgroundColor: modernColors.neutral[50],
            borderColor: modernColors.primary[600],
            color: modernColors.primary[600],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: modernColors.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: modernColors.primary[600],
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 32,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default modernTheme;
