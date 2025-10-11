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
    primary: {
      main: m3Colors.primary[40], // #6750A4
      light: m3Colors.primary[80], // #D0BCFF
      dark: m3Colors.primary[20], // #381E72
      contrastText: m3Colors.primary[100], // #FFFFFF
    },
    secondary: {
      main: m3Colors.secondary[40], // #625B71
      light: m3Colors.secondary[80], // #CCC2DC
      dark: m3Colors.secondary[20], // #332D41
      contrastText: m3Colors.secondary[100], // #FFFFFF
    },
    tertiary: {
      main: m3Colors.tertiary[40], // #7D5260
      light: m3Colors.tertiary[80], // #F0B8C8
      dark: m3Colors.tertiary[20], // #492532
      contrastText: m3Colors.tertiary[100], // #FFFFFF
    },
    error: {
      main: m3Colors.error[40], // #B3261E
      light: m3Colors.error[80], // #F2B8B5
      dark: m3Colors.error[20], // #601410
      contrastText: m3Colors.error[100], // #FFFFFF
    },
    background: {
      default: m3Colors.neutral[99], // #FFFBFE
      paper: m3Colors.neutral[100], // #FFFFFF
    },
    surface: {
      main: m3Colors.neutral[100], // #FFFFFF
      variant: m3Colors.neutralVariant[90], // #E2DCE5
    },
    text: {
      primary: m3Colors.neutral[10], // #1C1B1F
      secondary: m3Colors.neutralVariant[50], // #78737A
      disabled: m3Colors.neutralVariant[40], // #5F5B63
    },
    divider: m3Colors.neutralVariant[80], // #C6C0C9
  },
  typography: {
    fontFamily: m3Typography.fontFamily,
    h1: m3Typography.displayLarge,
    h2: m3Typography.displayMedium,
    h3: m3Typography.displaySmall,
    h4: m3Typography.headlineLarge,
    h5: m3Typography.headlineMedium,
    h6: m3Typography.headlineSmall,
    subtitle1: m3Typography.titleLarge,
    subtitle2: m3Typography.titleMedium,
    body1: m3Typography.bodyLarge,
    body2: m3Typography.bodyMedium,
    button: m3Typography.labelLarge,
    caption: m3Typography.bodySmall,
    overline: m3Typography.labelSmall,
  },
  shape: {
    borderRadius: 12, // M3 uses 12px as the default border radius
  },
  spacing: 8, // 8px base spacing unit
  components: {
    // MUI Button customization for M3
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // M3 button border radius
          textTransform: 'none', // M3 doesn't use uppercase
          fontWeight: 500,
          padding: '10px 24px',
          minHeight: 40,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    // MUI Card customization for M3
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
          '&:hover': {
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    // MUI TextField customization for M3
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4, // M3 text field border radius
          },
        },
      },
    },
    // MUI Chip customization for M3
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // M3 chip border radius
        },
      },
    },
  },
});

export default m3Theme;
