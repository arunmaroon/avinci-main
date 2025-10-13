import { createTheme } from '@mui/material/styles';

// Material Design 3 Color Tokens
const m3Colors = {
  // Primary Colors
  primary: {
    0: '#000000',
    10: '#21005D',
    20: '#381E72',
    30: '#4F378B',
    40: '#6750A4',
    50: '#7F67BE',
    60: '#9A82DB',
    70: '#B69DF8',
    80: '#D0BCFF',
    90: '#EADDFF',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  // Secondary Colors
  secondary: {
    0: '#000000',
    10: '#1D192B',
    20: '#332D41',
    30: '#4A4458',
    40: '#625B71',
    50: '#7A7289',
    60: '#958DA5',
    70: '#B0A7C0',
    80: '#CCC2DC',
    90: '#E8DEF8',
    95: '#F6EDFF',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  // Tertiary Colors
  tertiary: {
    0: '#000000',
    10: '#31111D',
    20: '#492532',
    30: '#633B48',
    40: '#7D5260',
    50: '#986977',
    60: '#B58392',
    70: '#D29DAC',
    80: '#F0B8C8',
    90: '#FFD8E4',
    95: '#FFECF1',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  // Error Colors
  error: {
    0: '#000000',
    10: '#410E0B',
    20: '#601410',
    30: '#8C1D18',
    40: '#B3261E',
    50: '#DC362E',
    60: '#E46962',
    70: '#EC928E',
    80: '#F2B8B5',
    90: '#F9DEDC',
    95: '#FCEEEE',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  // Neutral Colors
  neutral: {
    0: '#000000',
    4: '#0F0D13',
    6: '#151218',
    10: '#1C1B1F',
    12: '#211F26',
    17: '#2B2930',
    20: '#313033',
    22: '#36343A',
    24: '#3B383E',
    30: '#484649',
    40: '#605D62',
    50: '#787579',
    60: '#918F94',
    70: '#ACA9AE',
    80: '#C7C5CA',
    87: '#D5D3D8',
    90: '#E0DDE3',
    92: '#E6E1E5',
    94: '#ECE6F0',
    95: '#F0EBF4',
    96: '#F3EFF4',
    98: '#F7F2FA',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
  // Neutral Variant Colors
  neutralVariant: {
    0: '#000000',
    10: '#1D1A22',
    20: '#322F37',
    30: '#48454C',
    40: '#5F5B63',
    50: '#78737A',
    60: '#918C94',
    70: '#ABA5AE',
    80: '#C6C0C9',
    90: '#E2DCE5',
    95: '#F0EAF4',
    99: '#FFFBFE',
    100: '#FFFFFF',
  },
};

// Material Design 3 Typography Scale
const m3Typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  // Display styles
  displayLarge: {
    fontFamily: 'Roboto',
    fontSize: '57px',
    fontWeight: 400,
    lineHeight: '64px',
    letterSpacing: '-0.25px',
  },
  displayMedium: {
    fontFamily: 'Roboto',
    fontSize: '45px',
    fontWeight: 400,
    lineHeight: '52px',
    letterSpacing: '0px',
  },
  displaySmall: {
    fontFamily: 'Roboto',
    fontSize: '36px',
    fontWeight: 400,
    lineHeight: '44px',
    letterSpacing: '0px',
  },
  // Headline styles
  headlineLarge: {
    fontFamily: 'Roboto',
    fontSize: '32px',
    fontWeight: 400,
    lineHeight: '40px',
    letterSpacing: '0px',
  },
  headlineMedium: {
    fontFamily: 'Roboto',
    fontSize: '28px',
    fontWeight: 400,
    lineHeight: '36px',
    letterSpacing: '0px',
  },
  headlineSmall: {
    fontFamily: 'Roboto',
    fontSize: '24px',
    fontWeight: 400,
    lineHeight: '32px',
    letterSpacing: '0px',
  },
  // Title styles
  titleLarge: {
    fontFamily: 'Roboto',
    fontSize: '22px',
    fontWeight: 400,
    lineHeight: '28px',
    letterSpacing: '0px',
  },
  titleMedium: {
    fontFamily: 'Roboto',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  // Label styles
  labelLarge: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontFamily: 'Roboto',
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontFamily: 'Roboto',
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: '16px',
    letterSpacing: '0.5px',
  },
  // Body styles
  bodyLarge: {
    fontFamily: 'Roboto',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontFamily: 'Roboto',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontFamily: 'Roboto',
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '16px',
    letterSpacing: '0.4px',
  },
};

// Create Material Design 3 Theme
const m3Theme = createTheme({
  palette: {
    mode: 'light',
    // Clean modern project management palette
    primary: {
      main: '#1E293B', // Dark slate for primary elements
      light: '#334155',
      dark: '#0F172A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3B82F6', // Blue for secondary actions
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#10B981', // Green for success states
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#EF4444', // Red for errors
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F59E0B', // Amber for warnings
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald for success
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Very light gray background
      paper: '#FFFFFF', // Pure white cards
    },
    surface: {
      main: '#FFFFFF',
      variant: '#F1F5F9',
    },
    text: {
      primary: '#1E293B', // Dark slate for primary text
      secondary: '#64748B', // Medium gray for secondary text
      disabled: '#94A3B8', // Light gray for disabled text
    },
    divider: '#E2E8F0', // Very light border
  },
  typography: {
    // Clean modern typography
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
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    h2: {
      fontFamily: 'Inter',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    h3: {
      fontFamily: 'Inter',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    h4: {
      fontFamily: 'Inter',
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    h5: {
      fontFamily: 'Inter',
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    h6: {
      fontFamily: 'Inter',
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.025em',
      color: '#1E293B',
    },
    body1: {
      fontFamily: 'Inter',
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0em',
      color: '#1E293B',
    },
    body2: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0em',
      color: '#64748B',
    },
    button: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: 500,
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
      color: '#64748B',
    },
  },
  shape: {
    borderRadius: 12, // Clean rounded corners
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          minHeight: 36,
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0F172A',
          },
        },
        outlined: {
          borderWidth: 1,
          borderColor: '#E2E8F0',
          color: '#1E293B',
          '&:hover': {
            borderWidth: 1,
            backgroundColor: '#F8FAFC',
            borderColor: '#1E293B',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #F1F5F9',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E293B',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E293B',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default m3Theme;
