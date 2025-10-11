import React from 'react';
import { Badge as MuiBadge, Chip as MuiChip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(MuiBadge)(({ theme, variant = 'standard' }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    borderRadius: 10,
    ...(variant === 'dot' && {
      width: 8,
      height: 8,
      borderRadius: '50%',
    }),
  },
}));

const StyledChip = styled(MuiChip)(({ theme, variant = 'filled' }) => ({
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

const Badge = ({
  children,
  badgeContent,
  variant = 'standard',
  invisible = false,
  max = 99,
  showZero = false,
  ...props
}) => {
  return (
    <StyledBadge
      badgeContent={badgeContent}
      variant={variant}
      invisible={invisible}
      max={max}
      showZero={showZero}
      {...props}
    >
      {children}
    </StyledBadge>
  );
};

const Chip = ({
  label,
  variant = 'filled',
  size = 'medium',
  color = 'default',
  onDelete,
  ...props
}) => {
  return (
    <StyledChip
      label={label}
      variant={variant}
      size={size}
      color={color}
      onDelete={onDelete}
      {...props}
    />
  );
};

Badge.Chip = Chip;

export default Badge;