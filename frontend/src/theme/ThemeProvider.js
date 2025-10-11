import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import m3Theme from './m3Theme';

const ThemeProvider = ({ children }) => {
  return (
    <MuiThemeProvider theme={m3Theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;