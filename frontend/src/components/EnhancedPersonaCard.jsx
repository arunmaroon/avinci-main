/**
 * Enhanced Persona Card - Interactive persona display with 51 UXPressia fields
 * Features collapsible sections, rich interactions, and fintech-focused design
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  HomeIcon,
  AcademicCapIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { getAvatarSrc, handleAvatarError } from '../utils/avatarUtils';

const EnhancedPersonaCard = ({ 
  persona, 
  onStartChat, 
  onStartAudioCall, 
  onViewDetails, 
  onEdit,
  onDelete,
  isSelected = false,
  showActions = true 
}) => {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [isHovered, setIsHovered] = useState(false);

  if (!persona) return null;

  const {
    id,
    name,
    title,
    company,
    location,
    age,
    gender,
    avatar_url,
    demographics = {},
    personality_archetype,
    primary_goals = [],
    pain_points = [],
    tech_savviness,
    financial_goals = [],
    communication_style = {},
    emotional_profile = {},
    social_context = {},
    cultural_background = {},
    daily_routine = {},
    hobbies = [],
    values = [],
    created_at
  } = persona;

  const photo = getAvatarSrc(avatar_url, name, { size: 120 });

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const SectionHeader = ({ title, icon: Icon, count, isExpanded, onClick }) => (
    <motion.button
      className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-900">{title}</span>
        {count > 0 && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {count}
          </span>
        )}
      </div>
      {isExpanded ? (
        <ChevronUpIcon className="w-5 h-5 text-gray-500" />
      ) : (
        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
      )}
    </motion.button>
  );

  const BadgeList = ({ items, color = 'blue', maxItems = 3 }) => {
    if (!items || items.length === 0) return null;
    
    const displayItems = items.slice(0, maxItems);
    const remainingCount = items.length - maxItems;

    return (
      <div className="flex flex-wrap gap-2">
        {displayItems.map((item, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800`}
          >
            {item}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-1 text-xs text-gray-500">
            +{remainingCount} more
          </span>
        )}
      </div>
    );
  };

  const InfoField = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
    );
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
        isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'
      }`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={photo}
              alt={name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
              onError={(e) => handleAvatarError(e, name, { size: 120 })}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
            <p className="text-sm text-gray-600 truncate">{title}</p>
            <p className="text-xs text-gray-500 truncate">{company} • {location}</p>
            
            <div className="flex items-center space-x-4 mt-2">
              <InfoField label="Age" value={age} icon={UserGroupIcon} />
              <InfoField label="Tech" value={tech_savviness} icon={DevicePhoneMobileIcon} />
              <InfoField label="Archetype" value={personality_archetype} icon={StarIcon} />
            </div>
          </div>

          {showActions && (
            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => onEdit?.(persona)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit persona"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete?.(persona)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete persona"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="p-6 space-y-4">
        {/* Goals & Motivations */}
        <div>
          <SectionHeader
            title="Goals & Motivations"
            icon={LightBulbIcon}
            count={primary_goals.length}
            isExpanded={expandedSections.has('goals')}
            onClick={() => toggleSection('goals')}
          />
          <AnimatePresence>
            {expandedSections.has('goals') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Goals</h4>
                    <BadgeList items={primary_goals} color="blue" />
                  </div>
                  {financial_goals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Goals</h4>
                      <BadgeList items={financial_goals} color="green" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pain Points & Challenges */}
        <div>
          <SectionHeader
            title="Pain Points & Challenges"
            icon={ExclamationTriangleIcon}
            count={pain_points.length}
            isExpanded={expandedSections.has('pain_points')}
            onClick={() => toggleSection('pain_points')}
          />
          <AnimatePresence>
            {expandedSections.has('pain_points') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3">
                  <BadgeList items={pain_points} color="red" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Personality & Values */}
        <div>
          <SectionHeader
            title="Personality & Values"
            icon={StarIcon}
            count={values.length}
            isExpanded={expandedSections.has('personality')}
            onClick={() => toggleSection('personality')}
          />
          <AnimatePresence>
            {expandedSections.has('personality') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Values</h4>
                    <BadgeList items={values} color="purple" />
                  </div>
                  {communication_style && Object.keys(communication_style).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Communication Style</h4>
                      <div className="text-sm text-gray-600">
                        {Object.entries(communication_style).map(([key, value]) => (
                          <div key={key} className="capitalize">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Lifestyle & Interests */}
        <div>
          <SectionHeader
            title="Lifestyle & Interests"
            icon={HeartIcon}
            count={hobbies.length}
            isExpanded={expandedSections.has('lifestyle')}
            onClick={() => toggleSection('lifestyle')}
          />
          <AnimatePresence>
            {expandedSections.has('lifestyle') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Hobbies & Interests</h4>
                    <BadgeList items={hobbies} color="pink" />
                  </div>
                  {daily_routine && Object.keys(daily_routine).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Daily Routine</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {Object.entries(daily_routine).map(([time, activity]) => (
                          <div key={time} className="flex justify-between">
                            <span className="font-medium capitalize">{time}:</span>
                            <span>{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Social & Cultural Context */}
        <div>
          <SectionHeader
            title="Social & Cultural Context"
            icon={GlobeAltIcon}
            count={Object.keys(social_context).length + Object.keys(cultural_background).length}
            isExpanded={expandedSections.has('social')}
            onClick={() => toggleSection('social')}
          />
          <AnimatePresence>
            {expandedSections.has('social') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  {social_context && Object.keys(social_context).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Social Context</h4>
                      <div className="text-sm text-gray-600">
                        {Object.entries(social_context).map(([key, value]) => (
                          <div key={key} className="capitalize">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {cultural_background && Object.keys(cultural_background).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cultural Background</h4>
                      <div className="text-sm text-gray-600">
                        {Object.entries(cultural_background).map(([key, value]) => (
                          <div key={key} className="capitalize">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="px-6 pb-6">
          <div className="flex space-x-3">
            <motion.button
              onClick={() => onStartChat?.(persona)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Start Chat</span>
            </motion.button>
            
            <motion.button
              onClick={() => onStartAudioCall?.(persona)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Audio Call</span>
            </motion.button>
            
            <motion.button
              onClick={() => onViewDetails?.(persona)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EyeIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-2xl text-xs text-gray-500">
        Created {new Date(created_at).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default EnhancedPersonaCard;



