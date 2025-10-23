import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import AirbnbLayout from './components/layout/AirbnbLayout';
import Dashboard from './pages/Dashboard';
// Removed unused StageDashboard import
import AirbnbAgentLibrary_v2 from './pages/AirbnbAgentLibrary_v2';
import AgentChatPage from './pages/AgentChatPage';
import EnhancedChatPage from './pages/EnhancedChatPage';
import EnhancedGroupChatPage from './pages/chat/EnhancedGroupChatPage';
import DesignFeedback from './components/DesignFeedback';
import UserResearchModern from './pages/UserResearchModern';
import SessionCall from './pages/SessionCall';
import UserInterview from './pages/UserInterview';
import AudioCall from './pages/AudioCall';
import SocketTest from './pages/SocketTest';
import TestRoute from './pages/TestRoute';
import AdminRoles from './pages/AdminRoles';
import DesignImport from './pages/DesignImport';
import FigmaCallback from './components/FigmaCallback';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Projects from './pages/Projects';
import ProjectsDashboard from './pages/ProjectsDashboard';
import AIAgents from './pages/AIAgents';
import AgentLibrary from './pages/AgentLibrary';
import GroupChatPage from './pages/GroupChatPage';
import useAuthStore from './stores/authStore';
import usePermissions from './hooks/usePermissions';
import modernTheme from './theme/modernTheme';
import './index.css';

function App() {
  const { user, isAuthenticated, isLoading, login, logout, initialize } = useAuthStore();
  const { canAccessAdmin } = usePermissions();

  useEffect(() => {
    // Initialize the auth store after rehydration
    initialize();
  }, [initialize]);

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

  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Route path="*" element={<LoginPage />} />
          </Routes>
        ) : (
          <AirbnbLayout user={user} onLogout={logout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<AirbnbAgentLibrary_v2 />} />
              <Route path="/agent-library" element={<AgentLibrary />} />
              <Route path="/ai-agents" element={<AIAgents />} />
              <Route path="/group-chat" element={<EnhancedGroupChatPage />} />
              <Route path="/chat" element={<GroupChatPage />} />
              <Route path="/design-feedback" element={<DesignFeedback />} />
              <Route path="/user-research" element={<UserResearchModern />} />
              <Route path="/user-research/session/:sessionId" element={<SessionCall />} />
              <Route path="/user-interview" element={<UserInterview />} />
              <Route path="/audio-call" element={<AudioCall />} />
              <Route path="/socket-test" element={<SocketTest />} />
              <Route path="/test-route" element={<TestRoute />} />
              <Route path="/projects" element={<ProjectsDashboard />} />
              <Route path="/projects/:projectId" element={<Projects />} />
              <Route path="/agent-chat/:agentId" element={<AgentChatPage />} />
              <Route path="/enhanced-chat/:agentId" element={<EnhancedChatPage />} />
              
              {/* Admin Routes - Protected by permissions */}
              {canAccessAdmin() && (
                <>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/roles" element={<AdminRoles />} />
                  <Route path="/admin/products" element={<Products />} />
                  <Route path="/admin/design-import" element={<DesignImport />} />
                </>
              )}
              
              {/* OAuth Callback - No auth required */}
              <Route path="/admin/figma-callback" element={<FigmaCallback />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AirbnbLayout>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
