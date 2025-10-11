import React from 'react';
import {
  Button as MuiButton,
  Card as MuiCard,
  CardContent,
  CardActions,
  TextField as MuiTextField,
  Chip as MuiChip,
  Avatar as MuiAvatar,
  Badge as MuiBadge,
  IconButton as MuiIconButton,
  Fab as MuiFab,
  Switch as MuiSwitch,
  Checkbox as MuiCheckbox,
  Radio as MuiRadio,
  Slider as MuiSlider,
  LinearProgress as MuiLinearProgress,
  CircularProgress as MuiCircularProgress,
  Alert as MuiAlert,
  Snackbar as MuiSnackbar,
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider as MuiDivider,
  Paper as MuiPaper,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// M3 Button Component
export const Button = styled(MuiButton)(({ theme, variant = 'filled' }) => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 24px',
  minHeight: 40,
  ...(variant === 'filled' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: theme.palette.outline,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '0A',
      borderColor: theme.palette.primary.main,
    },
  }),
  ...(variant === 'text' && {
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '0A',
    },
  }),
}));

// M3 Card Component
export const Card = styled(MuiCard)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
}));

// M3 TextField Component
export const TextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
}));

// M3 Chip Component
export const Chip = styled(MuiChip)(({ theme, variant = 'filled' }) => ({
  borderRadius: 8,
  ...(variant === 'filled' && {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  }),
  ...(variant === 'outlined' && {
    borderColor: theme.palette.outline,
    color: theme.palette.onSurfaceVariant,
  }),
}));

// M3 Avatar Component
export const Avatar = styled(MuiAvatar)(({ theme, size = 'medium' }) => ({
  ...(size === 'small' && {
    width: 24,
    height: 24,
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
  }),
  ...(size === 'large' && {
    width: 56,
    height: 56,
  }),
}));

// M3 Badge Component
export const Badge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: 10,
  },
}));

// M3 IconButton Component
export const IconButton = styled(MuiIconButton)(({ theme }) => ({
  borderRadius: 20,
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '0A',
  },
}));

// M3 FAB Component
export const Fab = styled(MuiFab)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
}));

// M3 Switch Component
export const Switch = styled(MuiSwitch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: theme.palette.primary.main,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
}));

// M3 Checkbox Component
export const Checkbox = styled(MuiCheckbox)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

// M3 Radio Component
export const Radio = styled(MuiRadio)(({ theme }) => ({
  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },
}));

// M3 Slider Component
export const Slider = styled(MuiSlider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${theme.palette.primary.main}20`,
    },
  },
}));

// M3 Progress Components
export const LinearProgress = styled(MuiLinearProgress)(({ theme }) => ({
  borderRadius: 2,
  backgroundColor: theme.palette.surfaceVariant,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const CircularProgress = styled(MuiCircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

// M3 Alert Component
export const Alert = styled(MuiAlert)(({ theme, severity = 'info' }) => ({
  borderRadius: 12,
  ...(severity === 'error' && {
    backgroundColor: theme.palette.error.main + '0A',
    color: theme.palette.error.main,
    '& .MuiAlert-icon': {
      color: theme.palette.error.main,
    },
  }),
  ...(severity === 'warning' && {
    backgroundColor: theme.palette.warning.main + '0A',
    color: theme.palette.warning.main,
    '& .MuiAlert-icon': {
      color: theme.palette.warning.main,
    },
  }),
  ...(severity === 'info' && {
    backgroundColor: theme.palette.info.main + '0A',
    color: theme.palette.info.main,
    '& .MuiAlert-icon': {
      color: theme.palette.info.main,
    },
  }),
  ...(severity === 'success' && {
    backgroundColor: theme.palette.success.main + '0A',
    color: theme.palette.success.main,
    '& .MuiAlert-icon': {
      color: theme.palette.success.main,
    },
  }),
}));

// M3 Snackbar Component
export const Snackbar = styled(MuiSnackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    borderRadius: 4,
    backgroundColor: theme.palette.inverseSurface,
    color: theme.palette.inverseOnSurface,
  },
}));

// M3 Dialog Component
export const Dialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 28,
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  },
}));

// M3 List Components
export const List = styled(MuiList)(({ theme }) => ({
  padding: 0,
}));

export const ListItem = styled(MuiListItem)(({ theme }) => ({
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '0A',
  },
}));

export const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  borderRadius: 0,
  '&:hover': {
    backgroundColor: theme.palette.primary.main + '0A',
  },
}));

// M3 Divider Component
export const Divider = styled(MuiDivider)(({ theme }) => ({
  borderColor: theme.palette.outlineVariant,
}));

// M3 Paper Component
export const Paper = styled(MuiPaper)(({ theme, elevation = 1 }) => ({
  borderRadius: 12,
  ...(elevation === 1 && {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  }),
  ...(elevation === 2 && {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  }),
  ...(elevation === 3 && {
    boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.30), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
  }),
}));

// M3 Layout Components
export const Container = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(2),
}));

export const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const Grid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

// M3 Typography Components
export const Heading = styled(Typography)(({ theme, level = 1 }) => ({
  fontWeight: 400,
  ...(level === 1 && theme.typography.displayLarge),
  ...(level === 2 && theme.typography.displayMedium),
  ...(level === 3 && theme.typography.displaySmall),
  ...(level === 4 && theme.typography.headlineLarge),
  ...(level === 5 && theme.typography.headlineMedium),
  ...(level === 6 && theme.typography.headlineSmall),
}));

export const Body = styled(Typography)(({ theme, size = 'medium' }) => ({
  ...(size === 'large' && theme.typography.bodyLarge),
  ...(size === 'medium' && theme.typography.bodyMedium),
  ...(size === 'small' && theme.typography.bodySmall),
}));

export const Label = styled(Typography)(({ theme, size = 'medium' }) => ({
  fontWeight: 500,
  ...(size === 'large' && theme.typography.labelLarge),
  ...(size === 'medium' && theme.typography.labelMedium),
  ...(size === 'small' && theme.typography.labelSmall),
}));

// M3 Utility Components
export const Spacer = styled(Box)(({ size = 1 }) => ({
  height: size * 8,
}));

export const Flex = styled(Box)(({ direction = 'row', justify = 'flex-start', align = 'stretch', gap = 1 }) => ({
  display: 'flex',
  flexDirection: direction,
  justifyContent: justify,
  alignItems: align,
  gap: gap * 8,
}));

export const Center = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const Stack = styled(Stack)(({ theme, spacing = 1 }) => ({
  gap: spacing * 8,
}));
