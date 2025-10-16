import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import M3Layout from './components/layout/M3Layout';
import Dashboard from './pages/Dashboard';
import StageDashboard from './pages/ai-setup/stages/StageDashboard';
import PmDashboard from './pages/ai-setup/PmDashboard';
import AdminSettings from './pages/ai-setup/AdminSettings';
import Projects from './pages/Projects';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectWorkflow from './pages/ProjectWorkflow';
import AIAgents from './pages/AIAgents';
import AgentLibrary from './pages/AgentLibrary';
import AgentChatPage from './pages/AgentChatPage';
import EnhancedChatPage from './pages/EnhancedChatPage';
import GroupChatPage from './pages/GroupChatPage';
import DesignFeedback from './components/DesignFeedback';
import UserResearch from './pages/UserResearch';
import SessionCall from './pages/SessionCall';
import UserInterview from './pages/UserInterview';
import AudioCall from './pages/AudioCall';
import SocketTest from './pages/SocketTest';
import TestRoute from './pages/TestRoute';
import modernTheme from './theme/modernTheme';
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
      <ThemeProvider theme={modernTheme}>
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
    // Auto-login for demo purposes
    const demoUser = { name: 'Demo User', role: 'admin' };
    handleLogin(demoUser);
    return null;
  }

  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Router>
        <M3Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<AIAgents />} />
            <Route path="/agents" element={<AgentLibrary />} />
            <Route path="/group-chat" element={<GroupChatPage />} />
            <Route path="/design-feedback" element={<DesignFeedback />} />
            <Route path="/user-research" element={<UserResearch />} />
            <Route path="/user-research/session/:sessionId" element={<SessionCall />} />
            <Route path="/user-interview" element={<UserInterview />} />
            <Route path="/audio-call" element={<AudioCall />} />
            <Route path="/socket-test" element={<SocketTest />} />
            <Route path="/test-route" element={<TestRoute />} />
            <Route path="/agent-chat/:agentId" element={<AgentChatPage />} />
            <Route path="/enhanced-chat/:agentId" element={<EnhancedChatPage />} />
            <Route path="/projects" element={<ProjectsDashboard />} />
            <Route path="/projects/:projectId" element={<ProjectWorkflow />} />
            <Route path="/projects/:projectId/stages/:stageId" element={<StageDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </M3Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
