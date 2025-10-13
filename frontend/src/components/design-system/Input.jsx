import React from 'react';
import { TextField as MuiTextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(MuiTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary?.main || '#6750A4',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary?.main || '#6750A4',
      borderWidth: 2,
    },
  },
}));

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error = false,
  helperText,
  required = false,
  multiline = false,
  rows = 1,
  startIcon,
  endIcon,
  className = '',
  ...props
}) => {
  return (
    <StyledTextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
      disabled={disabled}
      error={error}
      helperText={helperText}
      required={required}
      multiline={multiline}
      rows={rows}
      className={className}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : undefined,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : undefined,
      }}
      {...props}
    />
  );
};

export default Input;