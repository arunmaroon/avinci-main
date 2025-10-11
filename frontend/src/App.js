import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import SimpleLogin from './components/SimpleLogin';
import M3Layout from './components/layout/M3Layout';
import Dashboard from './pages/Dashboard';
import AIAgents from './pages/AIAgents';
import AgentLibrary from './pages/AgentLibrary';
import DetailedPersonas from './pages/DetailedPersonas';
import AgentChatPage from './pages/AgentChatPage';
import EnhancedChatPage from './pages/EnhancedChatPage';
import GroupChatPage from './pages/GroupChatPage';
import ChatArchive from './pages/ChatArchive';
import DesignFeedback from './components/DesignFeedback';
import m3Theme from './theme/m3Theme';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('sirius_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('sirius_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sirius_user');
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={m3Theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="bodyLarge" color="text.secondary">
              Loading...
            </Typography>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={m3Theme}>
        <CssBaseline />
        <SimpleLogin onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={m3Theme}>
      <CssBaseline />
      <Router>
        <M3Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<AIAgents />} />
            <Route path="/agents" element={<AgentLibrary />} />
            <Route path="/personas" element={<DetailedPersonas />} />
            <Route path="/group-chat" element={<GroupChatPage />} />
            <Route path="/archive" element={<ChatArchive />} />
            <Route path="/design-feedback" element={<DesignFeedback />} />
            <Route path="/agent-chat/:agentId" element={<AgentChatPage />} />
            <Route path="/enhanced-chat/:agentId" element={<EnhancedChatPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </M3Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
