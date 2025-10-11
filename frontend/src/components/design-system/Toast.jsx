import React from 'react';
import { Snackbar as MuiSnackbar, Alert as MuiAlert } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSnackbar = styled(MuiSnackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    borderRadius: 4,
    backgroundColor: theme.palette.inverseSurface,
    color: theme.palette.inverseOnSurface,
  },
}));

const StyledAlert = styled(MuiAlert)(({ theme, severity = 'info' }) => ({
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

const Toast = ({
  open,
  onClose,
  message,
  severity = 'info',
  autoHideDuration = 6000,
  ...props
}) => {
  return (
    <StyledSnackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      {...props}
    >
      <StyledAlert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%' }}
      >
        {message}
      </StyledAlert>
    </StyledSnackbar>
  );
};

export default Toast;