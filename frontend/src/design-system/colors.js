/**
 * Avinci Design System - Color Palette
 * Based on the provided color chart with Primary (#144835) and Secondary (#FF7F4C)
 */

export const colors = {
  // Primary Colors (Green)
  primary: {
    50: '#F0F9F4',
    100: '#D7F4E9',
    200: '#AFE9D3',
    300: '#87DEBD',
    400: '#5FD3A7',
    500: '#37C893', // Main primary color
    600: '#2CA076',
    700: '#217858',
    800: '#144835', // Dark primary
    900: '#0B281D',
  },

  // Secondary Colors (Orange)
  secondary: {
    50: '#FFF7F4',
    100: '#FFE5DB',
    200: '#FFCCB8',
    300: '#FFB294',
    400: '#FF976E',
    500: '#FF7F4C', // Main secondary color
    600: '#DE5E2B',
    700: '#BD3D0A',
    800: '#892700',
    900: '#441300',
  },

  // Complementary Colors (Purple)
  complementary: {
    50: '#FDFBFF',
    100: '#F5E4FF',
    200: '#EBC9FF',
    300: '#D8AAF3',
    400: '#CA9CE5',
    500: '#B789D2', // Main complementary color
    600: '#976982',
    700: '#764891',
    800: '#582A73',
    900: '#380A53',
  },

  // Neutral Colors
  neutral: {
    0: '#FFFFFF',
    50: '#F6F6F6',
    100: '#F0F0F0',
    200: '#E0E0E0',
    300: '#C4C4C4',
    400: '#A8A8A8',
    500: '#8C8C8C',
    600: '#707070',
    700: '#545454',
    800: '#383838',
    900: '#1C1C1C',
  },

  // Semantic Colors
  success: {
    50: '#F0F9F4',
    500: '#144835',
    600: '#103A2B',
  },

  warning: {
    50: '#FEF9EC',
    500: '#FF7F4C',
    600: '#DE5E2B',
  },

  error: {
    50: '#FCE9E8',
    500: '#E12B1D',
    600: '#C41E12',
  },

  info: {
    50: '#E9F1FB',
    500: '#2562BD',
    600: '#1E4A96',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #37C893 0%, #144835 100%)',
  secondary: 'linear-gradient(135deg, #FF7F4C 0%, #DE5E2B 100%)',
  complementary: 'linear-gradient(135deg, #B789D2 0%, #582A73 100%)',
  hero: 'linear-gradient(135deg, #37C893 0%, #B789D2 100%)',
  subtle: 'linear-gradient(135deg, #F0F9F4 0%, #F5E4FF 100%)',
};

export default colors;
