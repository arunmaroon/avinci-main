import React from 'react';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, FormHelperText } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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

const Select = ({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
  error = false,
  helperText,
  required = false,
  multiple = false,
  className = '',
  ...props
}) => {
  return (
    <StyledFormControl
      fullWidth
      disabled={disabled}
      error={error}
      required={required}
      className={className}
    >
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        value={value}
        onChange={onChange}
        multiple={multiple}
        label={label}
        {...props}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  );
};

export default Select;