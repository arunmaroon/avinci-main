import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Avatar, Button } from './design-system';
import DetailedPersonaCard from './DetailedPersonaCard';
import PasswordConfirmation from './PasswordConfirmation';
import api from '../utils/api';

const AgentGrid = ({ agents, onSelectAgent, onDeleteAgent, onAgentStatusChange }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [detailedPersona, setDetailedPersona] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const getBadgeVariant = (knowledgeLevel) => {
    switch (knowledgeLevel) {
      case 'Novice': return 'success';
      case 'Intermediate': return 'primary';
      case 'Advanced': return 'warning';
      case 'Expert': return 'error';
      default: return 'gray';
    }
  };

  const getPersonaIcon = (agent) => {
    const role = agent.role_title || '';
    const name = agent.name || '';
    const searchText = `${role} ${name}`.toLowerCase();
    
    if (searchText.includes('tech') || searchText.includes('developer') || searchText.includes('engineer')) return '💻';
    if (searchText.includes('business') || searchText.includes('manager') || searchText.includes('executive')) return '💼';
    if (searchText.includes('designer') || searchText.includes('creative')) return '🎨';
    if (searchText.includes('freelance') || searchText.includes('independent')) return '🆓';
    if (searchText.includes('finance') || searchText.includes('banking')) return '💰';
    return '👤';
  };

  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    setLoadingPersona(true);
    setShowDetailView(true);
    
    try {
      // Fetch detailed persona data
      const response = await api.get(`/agent/generate/detailed/${agent.id}`);
      setDetailedPersona(response.data.persona);
    } catch (error) {
      console.error('Error fetching detailed persona:', error);
      // Fallback to basic agent data
      setDetailedPersona(agent);
    } finally {
      setLoadingPersona(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailView(false);
    setSelectedAgent(null);
    setDetailedPersona(null);
  };

  const handleChat = (agent) => {
    // Navigate to chat page with specific agent
    window.location.href = `/agent-chat/${agent.id}`;
  };

  const handleSleepAgent = (agent) => {
    setPendingAction('Sleep');
    setPendingAgent(agent);
    setShowPasswordConfirm(true);
  };

  const handleDeleteAgent = (agent) => {
    setPendingAction('Delete');
    setPendingAgent(agent);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = async () => {
    if (!pendingAgent || !pendingAction) return;

    try {
      if (pendingAction === 'Sleep') {
        const newStatus = pendingAgent.status === 'sleeping' ? 'active' : 'sleeping';
        await api.patch(`/agents/v5/${pendingAgent.id}/status`, { status: newStatus });
        onAgentStatusChange && onAgentStatusChange(pendingAgent.id, newStatus);
      } else if (pendingAction === 'Delete') {
        await api.delete(`/agents/v5/${pendingAgent.id}`);
        onDeleteAgent && onDeleteAgent(pendingAgent.id);
      }
    } catch (error) {
      console.error(`Error ${pendingAction.toLowerCase()}ing agent:`, error);
      alert(`Failed to ${pendingAction.toLowerCase()} agent. Please try again.`);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirm(false);
    setPendingAction(null);
    setPendingAgent(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelectAgent && onSelectAgent(agent)}
        >
          <Card className="cursor-pointer">
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                            <img
                              src={agent.avatar_url}
                              alt={agent.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                // First fallback: Try a different Random User photo
                                if (e.target.src.includes('randomuser.me')) {
                                  const fallbackUrl = `https://randomuser.me/api/portraits/${agent.demographics?.gender === 'Male' ? 'men' : 'women'}/${Math.floor(Math.random() * 99) + 1}.jpg`;
                                  e.target.src = fallbackUrl;
                                } else {
                                  // Second fallback: Use UI Avatars
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                                }
                              }}
                            />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-h4 font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-body-sm text-gray-600 font-medium">{agent.role_title || 'AI Persona'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{agent.age} years</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{agent.location}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{agent.education}</div>
                    </div>
                  </div>
              <div className="flex items-center space-x-2">
                {/* Primary Actions */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(agent);
                  }}
                  className="px-3 py-1 text-xs"
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChat(agent);
                  }}
                  className="px-3 py-1 text-xs"
                >
                  Chat
                </Button>
                
                {/* Hidden Actions Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle dropdown
                      const dropdown = e.target.closest('.relative').querySelector('.dropdown-menu');
                      dropdown.classList.toggle('hidden');
                    }}
                    className="p-1"
                    title="More Actions"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="dropdown-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSleepAgent(agent);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        {agent.status === 'sleeping' ? 'Wake Agent' : 'Sleep Agent'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAgent(agent);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Agent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

                {/* Agent Traits */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-500">Domain Literacy</span>
                      <Badge variant={getBadgeVariant(agent.gauges?.domain)}>
                        {agent.gauges?.domain || 'medium'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-500">English Literacy</span>
                      <Badge variant={getBadgeVariant(agent.gauges?.english_literacy)}>
                        {agent.gauges?.english_literacy || 'medium'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-500">Tech Savviness</span>
                      <Badge variant={getBadgeVariant(agent.gauges?.tech)}>
                        {agent.gauges?.tech || 'medium'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-gray-500">Communication</span>
                      <Badge variant={getBadgeVariant(agent.gauges?.comms)}>
                        {agent.gauges?.comms || 'medium'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-gray-500">Status</span>
                    <Badge variant={agent.status === 'active' ? 'success' : 'gray'}>
                      {agent.status || 'active'}
                    </Badge>
                  </div>
                </div>

            {/* Goals Preview */}
            {agent.goals_preview && agent.goals_preview.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {agent.goals_preview.slice(0, 3).map((goal, index) => (
                    <Badge key={index} variant="primary" size="sm">
                      {goal}
                    </Badge>
                  ))}
                  {agent.goals_preview.length > 3 && (
                    <Badge variant="gray" size="sm">
                      +{agent.goals_preview.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Quote Preview */}
            {agent.quote && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-caption line-clamp-3 italic">
                  "{agent.quote}"
                </p>
              </div>
            )}

            {/* Created Date */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-caption text-gray-500">
                Created {new Date(agent.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
      </div>

          {/* Detail View Modal */}
          {showDetailView && selectedAgent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header with close button */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Detailed Persona</h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {loadingPersona ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      <p className="ml-4 text-gray-600">Loading detailed persona...</p>
                    </div>
                  ) : detailedPersona ? (
                    <DetailedPersonaCard persona={detailedPersona} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Failed to load detailed persona data.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Password Confirmation Modal */}
          <PasswordConfirmation
            isOpen={showPasswordConfirm}
            onClose={handlePasswordCancel}
            onConfirm={handlePasswordConfirm}
            action={pendingAction}
            agentName={pendingAgent?.name}
          />
        </>
      );
    };

export default AgentGrid;
