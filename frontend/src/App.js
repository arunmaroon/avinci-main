import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SimpleLogin from './components/SimpleLogin';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AIAgents from './pages/AIAgents';
import AgentLibrary from './pages/AgentLibrary';
import ChatInterface from './pages/ChatInterface';
import DesignFeedback from './components/DesignFeedback';
import AgentChat from './components/AgentChat';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/generate" element={<AIAgents />} />
          <Route path="/agents" element={<AgentLibrary />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/agent-chat/:agentId?" element={<AgentChat />} />
          <Route path="/design-feedback" element={<DesignFeedback />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;