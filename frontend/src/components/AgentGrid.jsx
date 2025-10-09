import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Avatar, Button } from './design-system';
import EnhancedDetailedPersonaCard from './EnhancedDetailedPersonaCard';
import PasswordConfirmation from './PasswordConfirmation';
import { ChatBubbleLeftIcon, EyeIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
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

  const getEnglishLevel = (complexity) => {
    if (!complexity) return 'N/A';
    if (complexity >= 8) return 'Advanced';
    if (complexity >= 6) return 'Intermediate';
    if (complexity >= 4) return 'Basic';
    return 'Beginner';
  };

  const getEnglishLevelBadgeVariant = (complexity) => {
    if (!complexity) return 'gray';
    if (complexity >= 8) return 'success';
    if (complexity >= 6) return 'warning';
    if (complexity >= 4) return 'error';
    return 'gray';
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
      // Fetch detailed persona data using the correct endpoint
      const response = await api.get(`/personas/${agent.id}`);
      setDetailedPersona(response.data.agent);
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
    // Navigate to enhanced chat page
    window.location.href = `/enhanced-chat/${agent.id}`;
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
        alert(`Agent ${newStatus === 'active' ? 'woken up' : 'put to sleep'} successfully!`);
      } else if (pendingAction === 'Delete') {
        await api.delete(`/agents/v5/${pendingAgent.id}`);
        onDeleteAgent && onDeleteAgent(pendingAgent.id);
        alert('Agent deleted successfully!');
      }
      
      // Reset state
      setShowPasswordConfirm(false);
      setPendingAction(null);
      setPendingAgent(null);
    } catch (error) {
      console.error(`Error ${pendingAction.toLowerCase()}ing agent:`, error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to ${pendingAction.toLowerCase()} agent: ${error.response?.data?.error || error.message}`);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirm(false);
    setPendingAction(null);
    setPendingAgent(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group" onClick={() => handleViewDetails(agent)}>
            {/* Agent Header */}
            <div className="flex items-center mb-4">
              <div className="relative">
                <img
                  src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0 ml-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{agent.name}</h3>
                <p className="text-sm text-gray-600 truncate">{agent.occupation || agent.role_title || 'AI Persona'}</p>
              </div>
            </div>

            {/* Key Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Age</span>
                <span className="text-gray-900">{agent.demographics?.age || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-900">{agent.location || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tech Level</span>
                <Badge variant={getBadgeVariant(agent.tech_savviness)} size="sm">
                  {agent.tech_savviness || 'medium'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">English Level</span>
                <Badge variant={getEnglishLevelBadgeVariant(agent.vocabulary_profile?.complexity)} size="sm">
                  {getEnglishLevel(agent.vocabulary_profile?.complexity)}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <Badge variant={agent.status === 'active' ? 'success' : 'gray'} size="sm">
                  {agent.status || 'active'}
                </Badge>
              </div>
            </div>

            {/* Quote Preview */}
            {agent.quote && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic line-clamp-2">
                  "{agent.quote}"
                </p>
              </div>
            )}

            {/* Action Icons at Bottom */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(agent);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="View Details"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleChat(agent);
                }}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Start Chat"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const dropdown = e.target.closest('.relative').querySelector('.dropdown-menu');
                    dropdown.classList.toggle('hidden');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
                  title="More Actions"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
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
                    <EnhancedDetailedPersonaCard persona={detailedPersona} />
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
