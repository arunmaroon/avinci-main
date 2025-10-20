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
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftIcon as ChatSolid,
  EyeIcon as EyeSolid,
  MicrophoneIcon as MicSolid
} from '@heroicons/react/24/solid';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const formatTitleCase = (value, fallback = 'N/A') => {
  if (!value) return fallback;
  const str = value.toString().replace(/_/g, ' ').trim();
  if (!str) return fallback;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getLevelColor = (level) => {
  const normalized = (level || '').toLowerCase();
  if (['high', 'advanced', 'expert'].includes(normalized)) return 'from-emerald-500 to-teal-500';
  if (['medium', 'intermediate'].includes(normalized)) return 'from-blue-500 to-indigo-500';
  if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'from-amber-500 to-orange-500';
  if (['unknown', 'n/a'].includes(normalized)) return 'from-gray-400 to-gray-500';
  return 'from-gray-400 to-gray-500';
};

const getLevelTextColor = (level) => {
  const normalized = (level || '').toLowerCase();
  if (['high', 'advanced', 'expert'].includes(normalized)) return 'text-emerald-700';
  if (['medium', 'intermediate'].includes(normalized)) return 'text-blue-700';
  if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'text-amber-700';
  if (['unknown', 'n/a'].includes(normalized)) return 'text-gray-600';
  return 'text-gray-600';
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

const EnhancedAgentCard = ({ 
  agent, 
  index, 
  onSelectAgent, 
  onDeleteAgent, 
  onAgentStatusChange,
  onViewDetails,
  onStartChat,
  onStartAudioCall
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleSleepToggle = () => {
    setShowMenu(false);
    if (onAgentStatusChange) {
      const currentStatus = (agent.status || '').toLowerCase();
      const newStatus = currentStatus === 'sleeping' ? 'active' : 'sleeping';
      onAgentStatusChange(agent.id, newStatus);
    }
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDeleteAgent) {
      onDeleteAgent(agent.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className="group relative"
    >
      <div 
        className={`
          relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 cursor-pointer aspect-square
          ${isHovered ? 'shadow-2xl shadow-blue-500/10' : 'shadow-lg shadow-gray-500/5'}
          ${isPressed ? 'scale-95' : ''}
          border border-gray-100/50
        `}
        style={{ height: '10em', width: '100%' }}
        onClick={handleCardClick}
      >
        {/* Gradient Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 pointer-events-none" />
        
        {/* Status Indicator */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`
            w-3 h-3 rounded-full shadow-lg ${getStatusColor(agent.status)}
            ${isHovered ? 'scale-125' : ''}
            transition-transform duration-200
          `} />
        </div>

        {/* Header Section */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar with enhanced styling */}
            <div className="relative">
              <div className={`
                w-10 h-10 rounded-2xl overflow-hidden border-2 border-white shadow-lg
                ${isHovered ? 'scale-110' : ''}
                transition-transform duration-200
              `}>
                <img
                  src={getAvatarSrc(agent.avatar_url, agent.name, { size: 200 })}
                  alt={agent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => handleAvatarError(e, agent.name, { size: 200 })}
                />
              </div>
              {/* Online indicator */}
              <div className={`
                absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white
                ${getStatusColor(agent.status)}
                ${isHovered ? 'scale-110' : ''}
                transition-transform duration-200
              `} />
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {agent.name || 'Unnamed Agent'}
                </h3>
                <span className="text-xs font-medium text-gray-400 px-2 py-1 rounded-full bg-gray-100">
                  {statusLabel}
                </span>
              </div>
              
              <p className="text-sm font-medium text-blue-600 mb-1">
                {agent.occupation || agent.role_title || 'AI Persona'}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {age && (
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{age} yrs</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  <span className="truncate">{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            <div className={`
              px-3 py-1.5 rounded-full text-xs font-semibold
              bg-gradient-to-r ${getLevelColor(techLabel)}
              text-white shadow-sm
            `}>
              Tech: {techLabel}
            </div>
            <div className={`
              px-3 py-1.5 rounded-full text-xs font-semibold
              bg-gradient-to-r ${getLevelColor(domainLabel)}
              text-white shadow-sm
            `}>
              Domain: {domainLabel}
            </div>
            <div className={`
              px-3 py-1.5 rounded-full text-xs font-semibold
              bg-gradient-to-r ${getLevelColor(englishLabel)}
              text-white shadow-sm
            `}>
              English: {englishLabel}
            </div>
          </div>
        </div>

        {/* Quote Section */}
        {agent.quote && (
          <div className="px-6 pb-4">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4 border border-gray-100/50">
              <p className="text-sm leading-relaxed text-gray-700 line-clamp-2 italic">
                &ldquo;{agent.quote}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCardClick}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${isHovered 
                    ? 'bg-blue-100 text-blue-600 shadow-md' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title="View details"
              >
                {isHovered ? <EyeSolid className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleChatClick}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${isHovered 
                    ? 'bg-emerald-100 text-emerald-600 shadow-md' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title="Start chat"
              >
                {isHovered ? <ChatSolid className="w-5 h-5" /> : <ChatBubbleLeftIcon className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAudioClick}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${isHovered 
                    ? 'bg-purple-100 text-purple-600 shadow-md' 
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
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 transition-all duration-200"
                title="More actions"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-12 w-48 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50"
                  >
                    <button
                      onClick={handleSleepToggle}
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
                      onClick={handleDelete}
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
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default EnhancedAgentCard;
