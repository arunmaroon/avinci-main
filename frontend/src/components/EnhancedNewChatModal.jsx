import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  CheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const EnhancedNewChatModal = ({ agents, selectedAgents, onSelect, onClose, onCreate, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    occupation: '',
    location: '',
    techLevel: '',
    englishLevel: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter agents based on search and filters
  const filteredAgents = useMemo(() => {
    console.log('EnhancedNewChatModal: agents prop:', agents);
    console.log('EnhancedNewChatModal: filteredAgents count:', agents?.length || 0);
    return agents.filter(agent => {
      // Search filter
      const matchesSearch = !searchTerm || 
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.location?.toLowerCase().includes(searchTerm.toLowerCase());

      // Occupation filter
      const matchesOccupation = !selectedFilters.occupation || 
        agent.occupation?.toLowerCase().includes(selectedFilters.occupation.toLowerCase());

      // Location filter
      const matchesLocation = !selectedFilters.location || 
        agent.location?.toLowerCase().includes(selectedFilters.location.toLowerCase());

      // Tech level filter
      const matchesTechLevel = !selectedFilters.techLevel || 
        agent.tech_savviness?.toLowerCase().includes(selectedFilters.techLevel.toLowerCase());

      // English level filter
      const matchesEnglishLevel = !selectedFilters.englishLevel || 
        agent.english_savvy?.toLowerCase().includes(selectedFilters.englishLevel.toLowerCase());

      return matchesSearch && matchesOccupation && matchesLocation && matchesTechLevel && matchesEnglishLevel;
    });
  }, [agents, searchTerm, selectedFilters]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const occupations = [...new Set(agents.map(a => a.occupation).filter(Boolean))];
    const locations = [...new Set(agents.map(a => a.location).filter(Boolean))];
    const techLevels = [...new Set(agents.map(a => a.tech_savviness).filter(Boolean))];
    const englishLevels = [...new Set(agents.map(a => a.english_savvy).filter(Boolean))];

    return { occupations, locations, techLevels, englishLevels };
  }, [agents]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      occupation: '',
      location: '',
      techLevel: '',
      englishLevel: ''
    });
    setSearchTerm('');
  };

  const getTechLevelColor = (level) => {
    const normalized = (level || '').toLowerCase();
    if (['high', 'advanced', 'expert'].includes(normalized)) return 'text-emerald-800 border-emerald-200';
    if (['medium', 'intermediate'].includes(normalized)) return 'text-blue-800 border-blue-200';
    if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'text-amber-800 border-amber-200';
    return 'text-gray-800 border-gray-200';
  };

  const getEnglishLevelColor = (level) => {
    const normalized = (level || '').toLowerCase();
    if (['advanced', 'expert', 'fluent'].includes(normalized)) return 'text-emerald-800 border-emerald-200';
    if (['intermediate', 'medium'].includes(normalized)) return 'text-blue-800 border-blue-200';
    if (['basic', 'elementary', 'beginner'].includes(normalized)) return 'text-amber-800 border-amber-200';
    return 'text-gray-800 border-gray-200';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">New Chat</h3>
                <p className="text-gray-500 mt-1">Select AI agents to start a conversation</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="mt-4 flex gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name, occupation, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Occupation Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                      <select
                        value={selectedFilters.occupation}
                        onChange={(e) => handleFilterChange('occupation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Occupations</option>
                        {filterOptions.occupations.map(occupation => (
                          <option key={occupation} value={occupation}>{occupation}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <select
                        value={selectedFilters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Locations</option>
                        {filterOptions.locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tech Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tech Level</label>
                      <select
                        value={selectedFilters.techLevel}
                        onChange={(e) => handleFilterChange('techLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Tech Levels</option>
                        {filterOptions.techLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    {/* English Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">English Level</label>
                      <select
                        value={selectedFilters.englishLevel}
                        onChange={(e) => handleFilterChange('englishLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All English Levels</option>
                        {filterOptions.englishLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agent Grid */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => {
                const isSelected = selectedAgents.find(a => a.id === agent.id);
                return (
                  <motion.button
                    key={agent.id}
                    onClick={() => {
                      if (isSelected) {
                        onSelect(selectedAgents.filter(a => a.id !== agent.id));
                      } else {
                        onSelect([...selectedAgents, agent]);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Agent Avatar */}
                      <div className="relative">
                        <img
                          src={getAvatarSrc(agent.avatar_url, agent.name, { size: 200 })}
                          alt={agent.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => handleAvatarError(e, agent.name, { size: 200 })}
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Agent Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{agent.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{agent.occupation}</p>
                        
                        {/* Location */}
                        {agent.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPinIcon className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{agent.location}</span>
                          </div>
                        )}

                        {/* Skill Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agent.tech_savviness && (
                            <span 
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTechLevelColor(agent.tech_savviness)}`}
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                            >
                              Tech: {agent.tech_savviness}
                            </span>
                          )}
                          {agent.english_savvy && (
                            <span 
                              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEnglishLevelColor(agent.english_savvy)}`}
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                            >
                              Eng: {agent.english_savvy}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mt-2">
                          <StarIcon className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">4.8</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading agents...</h3>
                <p className="text-gray-500">Please wait while we fetch the available agents</p>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {/* Topic Input */}
            <div className="mb-4">
              <label htmlFor="chat-topic" className="block text-sm font-medium text-gray-700 mb-2">
                Chat Topic (Optional)
              </label>
              <input
                id="chat-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic for this conversation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onCreate(topic)}
                  disabled={selectedAgents.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Create Chat ({selectedAgents.length})
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedNewChatModal;
