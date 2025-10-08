import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  ChatBubbleLeftRightIcon, 
  EllipsisVerticalIcon,
  UserCircleIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
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
  const [favorites, setFavorites] = useState(new Set());
  const [ratings, setRatings] = useState({});

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
      const response = await api.get(`/agent/generate/detailed/${agent.id}`);
      setDetailedPersona(response.data.persona);
    } catch (error) {
      console.error('Error fetching detailed persona:', error);
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
    window.location.href = `/agent-chat/${agent.id}`;
  };

  const handleAction = (action, agent) => {
    setPendingAction(action);
    setPendingAgent(agent);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = (password) => {
    if (password === '12345') {
      if (pendingAction === 'delete') {
        onDeleteAgent(pendingAgent.id);
      } else if (pendingAction === 'sleep') {
        onAgentStatusChange(pendingAgent.id, 'sleeping');
      }
    }
    setShowPasswordConfirm(false);
    setPendingAction(null);
    setPendingAgent(null);
  };

  const toggleFavorite = (agentId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(agentId)) {
        newFavorites.delete(agentId);
      } else {
        newFavorites.add(agentId);
      }
      return newFavorites;
    });
  };

  const handleRating = (agentId, rating) => {
    setRatings(prev => ({
      ...prev,
      [agentId]: rating
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  if (!agents || agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
          <UserGroupIcon className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No agents found</h3>
        <p className="text-slate-500 text-center max-w-md">
          Create your first AI agent to get started with realistic user testing and design feedback.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            variants={cardVariants}
            whileHover="hover"
            className="group"
          >
            <div className="card-interactive relative overflow-hidden">
              {/* Header with gradient background */}
              <div className="relative h-32 p-4 bg-gradient-primary">
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                      {getPersonaIcon(agent)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                      <p className="text-white/80 text-sm">{agent.role_title}</p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(agent.id)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      {favorites.has(agent.id) ? (
                        <HeartSolidIcon className="w-4 h-4 text-red-400" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <div className="relative">
                      <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200">
                        <EllipsisVerticalIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${
                    agent.status === 'active' ? 'bg-green-400' : 
                    agent.status === 'sleeping' ? 'bg-yellow-400' : 'bg-gray-400'
                  } animate-pulse`} />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Basic info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <BriefcaseIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{agent.company}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="truncate">{agent.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quote */}
                {agent.quote && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border-l-4 border-l-primary-500">
                    <p className="text-sm text-slate-700 italic">"{agent.quote}"</p>
                  </div>
                )}

                {/* Goals preview */}
                {agent.objectives && agent.objectives.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Goals</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.objectives.slice(0, 3).map((goal, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(agent.id, star)}
                        className="transition-colors duration-200"
                      >
                        {star <= (ratings[agent.id] || 0) ? (
                          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-4 h-4 text-gray-300 hover:text-yellow-400" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {ratings[agent.id] || 0}/5
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(agent)}
                    className="flex-1 btn btn-secondary text-sm py-2"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleChat(agent)}
                    className="flex-1 btn btn-primary text-sm py-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                    Chat
                  </button>
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detailed Persona Modal */}
      <AnimatePresence>
        {showDetailView && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-primary">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Detailed Persona</h2>
                    <p className="text-sm text-gray-500">Comprehensive user profile</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCloseDetails}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Confirmation Modal */}
      <PasswordConfirmation
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={handlePasswordConfirm}
        action={pendingAction}
        agentName={pendingAgent?.name}
      />
    </>
  );
};

export default AgentGrid;