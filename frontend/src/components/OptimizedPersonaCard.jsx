/**
 * Optimized Persona Card Component
 * Features: Reduced photo size (60% smaller), lazy loading, optimized rendering
 */

import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EllipsisVerticalIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import usePersonaStore from '../stores/personaStore';

const OptimizedPersonaCard = memo(({ 
  persona, 
  onStartChat, 
  onStartAudioCall, 
  onViewDetails, 
  onEdit,
  onDelete,
  onToggleFavorite,
  onSleep,
  onWake,
  onDeleteWithPasscode,
  isSelected = false,
  showActions = true 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { regenerateImage } = usePersonaStore();

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
    profile_image_url,
    image_metadata,
    primary_goals = [],
    tech_savviness,
    english_level,
    domain_savvy,
    financial_goals = [],
    personality_archetype,
    created_at,
    status = 'active' // Default to active if not specified
  } = persona;

  // Get the best available image URL
  const getImageUrl = useCallback(() => {
    return profile_image_url || avatar_url;
  }, [profile_image_url, avatar_url]);

  // Optimized photo handling with 60% size reduction
  const getOptimizedAvatar = useCallback((url, fallbackName) => {
    if (imageError || !url) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName || 'User')}&background=4f46e5&color=fff&size=120`;
    }
    
    // Reduce size by 60% - from 200px to 80px
    if (url.includes('ui-avatars.com')) {
      return url.replace('size=200', 'size=80');
    }
    
    if (url.includes('unsplash.com')) {
      return url.replace('w=200&h=200', 'w=80&h=80');
    }
    
    if (url.includes('dicebear.com')) {
      return url.replace('size=200', 'size=80');
    }
    
    return url;
  }, [imageError]);

  // Handle image regeneration
  const handleRegenerateImage = useCallback(async (e) => {
    e.stopPropagation();
    setIsRegenerating(true);
    
    try {
      await regenerateImage(id);
      toast.success('Image regenerated successfully!');
      setImageError(false);
      setImageLoaded(false);
    } catch (error) {
      console.error('Error regenerating image:', error);
      toast.error('Failed to regenerate image');
    } finally {
      setIsRegenerating(false);
    }
  }, [id, regenerateImage]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }, [showMenu]);

  const handleFavoriteToggle = useCallback((e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onToggleFavorite?.(persona, !isFavorite);
  }, [isFavorite, onToggleFavorite, persona]);

  const handleAction = useCallback((action) => {
    setShowMenu(false);
    action?.(persona);
  }, [persona]);

  const handleSleep = useCallback(() => {
    setShowMenu(false);
    onSleep?.(persona);
    toast.success(`${name} is now sleeping`);
  }, [onSleep, persona, name]);

  const handleWake = useCallback(() => {
    setShowMenu(false);
    onWake?.(persona);
    toast.success(`${name} is now awake`);
  }, [onWake, persona, name]);

  const handleDeleteClick = useCallback(() => {
    setShowMenu(false);
    setShowPasscodeModal(true);
  }, []);

  const handlePasscodeSubmit = useCallback(async () => {
    if (passcode !== '12345') {
      toast.error('Invalid passcode. Please try again.');
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteWithPasscode?.(persona);
      toast.success(`${name} has been deleted`);
      setShowPasscodeModal(false);
      setPasscode('');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  }, [passcode, onDeleteWithPasscode, persona, name]);

  const handlePasscodeCancel = useCallback(() => {
    setShowPasscodeModal(false);
    setPasscode('');
  }, []);

  // Memoized skill badges - Enhanced with domain_literacy support
  const skillBadges = React.useMemo(() => {
    const badges = [];
    
    // Tech Savviness - Most prominent
    if (tech_savviness) {
      const techLevel = tech_savviness === 'high' || tech_savviness === 'expert' ? 'HIGH' : 
                       tech_savviness === 'medium' || tech_savviness === 'intermediate' ? 'MEDIUM' : 
                       tech_savviness === 'low' || tech_savviness === 'beginner' ? 'LOW' : 'MEDIUM';
      badges.push({ label: 'TECH', level: techLevel, color: 'green', priority: 1 });
    }
    
    // Domain Literacy - Second most prominent
    if (domain_literacy || domain_savvy) {
      const domainLevel = (domain_literacy || domain_savvy) === 'expert' ? 'EXPERT' : 
                         (domain_literacy || domain_savvy) === 'advanced' ? 'ADVANCED' :
                         (domain_literacy || domain_savvy) === 'intermediate' ? 'INTERMEDIATE' : 
                         (domain_literacy || domain_savvy) === 'beginner' ? 'BEGINNER' : 'INTERMEDIATE';
      badges.push({ label: 'DOMAIN', level: domainLevel, color: 'purple', priority: 2 });
    }
    
    // English Level - Third most prominent
    if (english_level || english_proficiency) {
      const englishLevel = (english_level || english_proficiency) === 'fluent' || (english_level || english_proficiency) === 'native' ? 'FLUENT' : 
                          (english_level || english_proficiency) === 'intermediate' || (english_level || english_proficiency) === 'advanced' ? 'INTERMEDIATE' : 
                          (english_level || english_proficiency) === 'basic' ? 'BASIC' : 'INTERMEDIATE';
      badges.push({ label: 'ENGLISH', level: englishLevel, color: 'blue', priority: 3 });
    }
    
    // Sort by priority (1 = highest priority)
    return badges.sort((a, b) => a.priority - b.priority);
  }, [tech_savviness, domain_literacy, domain_savvy, english_level, english_proficiency]);

  return (
    <motion.div
      className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 aspect-square ${
        isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-xl'
      }`}
      style={{ height: '10em', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      layout
    >
      {/* Header with Avatar - 60% smaller */}
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Avatar - Further reduced to 12x12 (60% reduction from 20x20) */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
              {!imageLoaded && (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                </div>
              )}
              <img
                src={getOptimizedAvatar(getImageUrl(), name)}
                alt={name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
              />
              {/* Image attribution overlay */}
              {image_metadata?.attribution && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 text-center">
                  {image_metadata.attribution}
                </div>
              )}
            </div>
            {/* Online indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
            >
              {isFavorite ? (
                <HeartSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Regenerate image button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRegenerateImage}
              disabled={isRegenerating}
              className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
              title="Regenerate Image"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
            </motion.button>

            {/* Menu button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleMenuToggle}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </motion.button>

              {/* Dropdown menu - Fixed positioning */}
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-12 w-48 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50"
                  >
                    {/* Status indicator */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className="text-xs font-medium text-gray-600 uppercase">
                          {status === 'active' ? 'Active' : 'Sleeping'}
                        </span>
                      </div>
                    </div>

                    {/* Sleep/Wake button */}
                    {status === 'active' ? (
                      <button
                        onClick={handleSleep}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <MoonIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        Sleep
                      </button>
                    ) : (
                      <button
                        onClick={handleWake}
                        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <SunIcon className="w-4 h-4 text-yellow-600" />
                        </div>
                        Wake
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => handleAction(onEdit)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <PencilIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      Edit Persona
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={handleDeleteClick}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </div>
                      Delete Persona
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Persona Info */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{name || 'Unknown'}</h3>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-600">{title || 'Professional'}</span>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-600">4.8</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
            <span>{location || 'Location not specified'}</span>
            <span>•</span>
            <span>{age || 'Unknown'} yrs</span>
          </div>
        </div>
      </div>

      {/* Enhanced Skill Badges - More prominent display */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2 justify-center">
          {skillBadges.map((badge, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm ${
                badge.color === 'green' 
                  ? 'text-green-900 border-green-300 bg-green-50'
                  : badge.color === 'blue'
                  ? 'text-blue-900 border-blue-300 bg-blue-50'
                  : 'text-purple-900 border-purple-300 bg-purple-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-extrabold">{badge.label}:</span> {badge.level}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <motion.button
              onClick={() => handleAction(onStartChat)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>Chat</span>
            </motion.button>
            
            <motion.button
              onClick={() => handleAction(onStartAudioCall)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call</span>
            </motion.button>
            
            <motion.button
              onClick={() => handleAction(onViewDetails)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <EyeIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
        Created {new Date(created_at).toLocaleDateString()}
      </div>

      {/* Passcode Modal */}
      <AnimatePresence>
        {showPasscodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handlePasscodeCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to delete <span className="font-semibold">{name}</span>? 
                  This will permanently remove the user and all associated data.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter passcode to confirm:
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePasscodeCancel}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasscodeSubmit}
                  disabled={isDeleting || !passcode}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

OptimizedPersonaCard.displayName = 'OptimizedPersonaCard';

export default OptimizedPersonaCard;
