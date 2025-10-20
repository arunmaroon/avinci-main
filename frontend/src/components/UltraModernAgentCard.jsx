import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftIcon, 
  EyeIcon, 
  EllipsisVerticalIcon,
  MicrophoneIcon,
  UserGroupIcon,
  MapPinIcon,
  CalendarIcon,
  AcademicCapIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftIcon as ChatSolid,
  EyeIcon as EyeSolid,
  MicrophoneIcon as MicSolid,
  StarIcon as StarSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const formatTitleCase = (value, fallback = 'N/A') => {
  if (!value) return fallback;
  const str = value.toString().replace(/_/g, ' ').trim();
  if (!str) return fallback;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getLevelGradient = (level) => {
  const normalized = (level || '').toLowerCase();
  if (['high', 'advanced', 'expert'].includes(normalized)) return 'from-emerald-400 via-teal-500 to-cyan-500';
  if (['medium', 'intermediate'].includes(normalized)) return 'from-blue-400 via-indigo-500 to-purple-500';
  if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'from-amber-400 via-orange-500 to-red-500';
  if (['unknown', 'n/a'].includes(normalized)) return 'from-gray-400 via-gray-500 to-gray-600';
  return 'from-gray-400 via-gray-500 to-gray-600';
};

const getLevelColor = (level) => {
  const normalized = (level || '').toLowerCase();
  if (['high', 'advanced', 'expert'].includes(normalized)) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (['medium', 'intermediate'].includes(normalized)) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'text-amber-700 bg-amber-50 border-amber-200';
  if (['unknown', 'n/a'].includes(normalized)) return 'text-gray-700 bg-gray-50 border-gray-200';
  return 'text-gray-700 bg-gray-50 border-gray-200';
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'bg-emerald-500 shadow-emerald-200';
    case 'sleeping':
      return 'bg-amber-500 shadow-amber-200';
    case 'archived':
      return 'bg-gray-400 shadow-gray-200';
    default:
      return 'bg-gray-300 shadow-gray-200';
  }
};

const UltraModernAgentCard = ({ 
  agent, 
  index, 
  onSelectAgent, 
  onDeleteAgent, 
  onAgentStatusChange,
  onViewDetails,
  onStartChat,
  onStartAudioCall,
  onRequestProtectedAction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const techLabel = agent.techLabel || formatTitleCase(agent.tech_savviness, 'Medium');
  const domainLabel = agent.domainLevel || formatTitleCase(agent.domain_literacy?.level, 'Medium');
  const englishLabel = agent.englishLevel || 'Unknown';
  const statusLabel = agent.statusLabel || formatTitleCase(agent.status, 'Active');
  const location = agent.locationLabel || agent.location || 'Unknown';
  const age = agent.demographics?.age ?? agent.age;

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(agent);
    }
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
    if (onStartChat) {
      onStartChat(agent);
    }
  };

  const handleAudioClick = (e) => {
    e.stopPropagation();
    if (onStartAudioCall) {
      onStartAudioCall(agent);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -12,
        scale: 1.03,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
      whileTap={{ 
        scale: 0.97,
        transition: { duration: 0.1 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div 
        className={`
          relative overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 cursor-pointer
          ${isHovered ? 'shadow-2xl shadow-blue-500/20' : 'shadow-lg shadow-gray-500/10'}
          border border-gray-100/50 backdrop-blur-sm
        `}
        onClick={handleCardClick}
      >
        {/* Animated Background Gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50"
          animate={{
            background: isHovered 
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)'
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Top Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        {/* Header Section */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              <motion.div 
                className={`
                  w-20 h-20 rounded-2xl overflow-hidden border-3 border-white shadow-2xl
                  ${isHovered ? 'scale-110' : ''}
                  transition-transform duration-300
                `}
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={getAvatarSrc(agent.avatar_url, agent.name, { size: 200 })}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleAvatarError(e, agent.name, { size: 200 })}
                />
              </motion.div>
              
              {/* Status Indicator with pulse animation */}
              <motion.div 
                className={`
                  absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-lg
                  ${getStatusColor(agent.status)}
                `}
                animate={{ 
                  scale: isHovered ? 1.2 : 1,
                  boxShadow: isHovered ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 0px rgba(16, 185, 129, 0)'
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikeClick}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            >
              {isLiked ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>
          </div>

          {/* Agent Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {agent.name || 'Unnamed Agent'}
              </h3>
              <span className="text-xs font-semibold text-gray-500 px-3 py-1 rounded-full bg-gray-100">
                {statusLabel}
              </span>
            </div>
            
            <p className="text-sm font-semibold text-blue-600 mb-2">
              {agent.occupation || agent.role_title || 'AI Persona'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {age && (
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">{age} yrs</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span className="truncate font-medium">{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section with enhanced badges */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className={`
              px-3 py-2 rounded-xl text-xs font-bold text-center
              bg-gradient-to-r ${getLevelGradient(techLabel)}
              text-white shadow-lg
            `}>
              Tech: {techLabel}
            </div>
            <div className={`
              px-3 py-2 rounded-xl text-xs font-bold text-center
              bg-gradient-to-r ${getLevelGradient(domainLabel)}
              text-white shadow-lg
            `}>
              Domain: {domainLabel}
            </div>
            <div className={`
              px-3 py-2 rounded-xl text-xs font-bold text-center
              bg-gradient-to-r ${getLevelGradient(englishLabel)}
              text-white shadow-lg
            `}>
              English: {englishLabel}
            </div>
          </div>
        </div>

        {/* Quote Section with enhanced styling */}
        {agent.quote && (
          <div className="px-6 pb-4">
            <motion.div 
              className="bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/50 rounded-2xl p-4 border border-gray-100/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm leading-relaxed text-gray-700 line-clamp-2 italic font-medium">
                &ldquo;{agent.quote}&rdquo;
              </p>
            </motion.div>
          </div>
        )}

        {/* Action Buttons with enhanced design */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCardClick}
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${isHovered 
                    ? 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-100' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title="View details"
              >
                {isHovered ? <EyeSolid className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleChatClick}
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${isHovered 
                    ? 'bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-100' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title="Start chat"
              >
                {isHovered ? <ChatSolid className="w-5 h-5" /> : <ChatBubbleLeftIcon className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAudioClick}
                className={`
                  p-3 rounded-xl transition-all duration-300
                  ${isHovered 
                    ? 'bg-purple-100 text-purple-600 shadow-lg shadow-purple-100' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title="Start audio call"
              >
                {isHovered ? <MicSolid className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMenuToggle}
                className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 transition-all duration-200"
                title="More actions"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-48 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm py-2 shadow-2xl z-50"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (onAgentStatusChange) {
                          const currentStatus = (agent.status || '').toLowerCase();
                          const newStatus = currentStatus === 'sleeping' ? 'active' : 'sleeping';
                          onAgentStatusChange(agent.id, newStatus);
                        }
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      {agent.status === 'sleeping' ? 'Wake Agent' : 'Sleep Agent'}
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (onRequestProtectedAction) {
                          onRequestProtectedAction('Delete', agent);
                        } else if (onDeleteAgent) {
                          onDeleteAgent(agent.id);
                        }
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                      Delete Agent
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default UltraModernAgentCard;
