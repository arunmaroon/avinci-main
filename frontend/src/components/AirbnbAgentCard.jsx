import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon,
  StarIcon,
  MapPinIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  MicrophoneIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  StarIcon as StarSolid
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
  if (['high', 'advanced', 'expert'].includes(normalized)) return 'text-green-700 bg-green-50 border-green-200';
  if (['medium', 'intermediate'].includes(normalized)) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'text-amber-700 bg-amber-50 border-amber-200';
  if (['unknown', 'n/a'].includes(normalized)) return 'text-gray-700 bg-gray-50 border-gray-200';
  return 'text-gray-700 bg-gray-50 border-gray-200';
};

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'bg-green-500';
    case 'sleeping':
      return 'bg-amber-500';
    case 'archived':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
};

const AirbnbAgentCard = ({ 
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
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div 
        className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image Section - Reduced Height */}
        <div className="relative">
          <div className="overflow-hidden rounded-t-2xl" style={{ height: '120px' }}>
            <img
              src={getAvatarSrc(agent.avatar_url, agent.name, { size: 300 })}
              alt={agent.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => handleAvatarError(e, agent.name, { size: 300 })}
            />
            {/* Attribution */}
            {agent.avatar_url && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur text-[10px] text-white">
                {agent.avatar_url.includes('images.pexels.com') ? 'Via Pexels' : 'Via Unsplash'}
              </div>
            )}
          </div>
          
          {/* Like Button */}
          <button
            onClick={handleLikeClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white transition-colors duration-200"
          >
            {isLiked ? (
              <HeartSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Status Indicator */}
          <div className="absolute top-3 left-3">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
          </div>
        </div>

        {/* Content Section - Compact */}
        <div className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {agent.name || 'Unnamed Agent'}
              </h3>
              <p className="text-xs text-gray-600 truncate">
                {agent.occupation || agent.role_title || 'AI Persona'}
              </p>
            </div>
            <div className="flex items-center gap-0.5 ml-2">
              <StarSolid className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-medium text-gray-900">4.8</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-2">
            <MapPinIcon className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600 truncate">{location}</span>
            {age && (
              <>
                <span className="text-gray-300 mx-0.5">•</span>
                <span className="text-xs text-gray-600">{age} yrs</span>
              </>
            )}
          </div>

          {/* Skills Badges - Improved Contrast */}
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getLevelColor(techLabel)}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
              Tech: {techLabel}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getLevelColor(domainLabel)}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
              Domain: {domainLabel}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getLevelColor(englishLabel)}`} style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
              English: {englishLabel}
            </span>
          </div>

          {/* Persona Chips (Airbnb style) */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(() => {
              // Extract tone from communication_style or raw_persona
              const tone = agent.communication_style?.tone || 
                          agent.raw_persona?.communication_style?.tone || 
                          agent.tone || '';
              
              // Extract decision style from decision_making or raw_persona
              const decision = agent.decision_making?.style || 
                             agent.raw_persona?.decision_making?.style || '';
              
              // Extract first personality trait
              let trait = '';
              if (agent.personality_traits?.personality?.[0]) {
                trait = agent.personality_traits.personality[0];
              } else if (agent.personality_traits?.values?.[0]) {
                trait = agent.personality_traits.values[0];
              } else if (typeof agent.personality_traits === 'string') {
                trait = agent.personality_traits.split(',')[0]?.trim();
              } else if (agent.traits?.[0]) {
                trait = agent.traits[0];
              }
              
              return (
                <>
                  {tone && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 bg-gray-50">
                      Tone: {tone}
                    </span>
                  )}
                  {decision && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 bg-gray-50">
                      Decision: {decision}
                    </span>
                  )}
                  {trait && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-700 bg-gray-50">
                      Trait: {trait}
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handleCardClick}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title="View details"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleChatClick}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title="Start chat"
              >
                <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleAudioClick}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title="Start audio call"
              >
                <MicrophoneIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={handleMenuToggle}
                className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                title="More actions"
              >
                <EllipsisVerticalIcon className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 bottom-12 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onAgentStatusChange) {
                        const currentStatus = (agent.status || '').toLowerCase();
                        const newStatus = currentStatus === 'sleeping' ? 'active' : 'sleeping';
                        onAgentStatusChange(agent.id, newStatus);
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </div>
                    <span className="whitespace-nowrap">
                      {agent.status === 'sleeping' ? 'Wake Agent' : 'Sleep Agent'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onDeleteAgent) {
                        onDeleteAgent(agent.id);
                      }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="whitespace-nowrap">Delete Agent</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AirbnbAgentCard;
