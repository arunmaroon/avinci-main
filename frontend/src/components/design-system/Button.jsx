import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledButton = styled(MuiButton)(({ theme, variant = 'filled' }) => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 24px',
  minHeight: 40,
  boxShadow: 'none',
  ...(variant === 'filled' && {
    backgroundColor: theme.palette.primary?.main || '#6750A4',
    color: theme.palette.primary?.contrastText || '#FFFFFF',
    '&:hover': {
      backgroundColor: theme.palette.primary?.dark || '#381E72',
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: theme.palette.outline || theme.palette.divider,
    color: theme.palette.primary?.main || '#6750A4',
    '&:hover': {
      backgroundColor: `${theme.palette.primary?.main || '#6750A4'}0A`,
      borderColor: theme.palette.primary?.main || '#6750A4',
    },
  }),
  ...(variant === 'text' && {
    color: theme.palette.primary?.main || '#6750A4',
    '&:hover': {
      backgroundColor: `${theme.palette.primary?.main || '#6750A4'}0A`,
    },
  }),
}));

const Button = ({
  children,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  type = 'button',
  startIcon,
  endIcon,
  ...props
}) => {
  const sizeProps = {
    small: { size: 'small' },
    medium: { size: 'medium' },
    large: { size: 'large' },
  };

  const buttonContent = (
    <>
      {loading && (
        <CircularProgress size={16} sx={{ mr: 1 }} />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span style={{ marginRight: 8 }}>{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span style={{ marginLeft: 8 }}>{icon}</span>
      )}
    </>
  );

  return (
    <motion.div
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.1 }}
    >
      <StyledButton
        variant={variant}
        disabled={disabled || loading}
        onClick={onClick}
        className={className}
        type={type}
        startIcon={startIcon || (icon && iconPosition === 'left' && !loading ? icon : undefined)}
        endIcon={endIcon || (icon && iconPosition === 'right' && !loading ? icon : undefined)}
        {...sizeProps[size]}
        {...props}
      >
        {buttonContent}
      </StyledButton>
    </motion.div>
  );
};

export default Button;
