import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  FunnelIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  MicrophoneIcon,
  BriefcaseIcon,
  UserGroupIcon,
  TruckIcon,
  ScissorsIcon,
  HomeModernIcon,
  CpuChipIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  PlayIcon,
  StopIcon,
  PhoneIcon,
  VideoCameraIcon,
  CheckIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { PhoneIcon as PhoneSolid } from '@heroicons/react/24/solid';
import AirbnbHeader from '../components/AirbnbHeader';
import { AirbnbButton, AirbnbCard, AirbnbInput, AirbnbBadge, AirbnbSpinner } from '../design-system/airbnb-components';
import { colors } from '../design-system/colors';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const formatTitleCase = (value = '') => {
  if (!value) return '';
  const clean = value.toString().replace(/_/g, ' ').toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const deriveEnglishLevel = (agent) => {
  if (agent.speech_patterns?.english_level) return agent.speech_patterns.english_level;
  if (agent.english_savvy) return agent.english_savvy;
  if (agent.communication_style?.english_proficiency) return agent.communication_style.english_proficiency;
  if (agent.communication_style?.english_level) return agent.communication_style.english_level;
  return 'Intermediate';
};

// Get profession-specific icon
const getProfessionIcon = (occupation) => {
  const occupationLower = (occupation || '').toLowerCase();
  
  if (occupationLower.includes('driver') || occupationLower.includes('delivery')) {
    return TruckIcon;
  }
  if (occupationLower.includes('manager') || occupationLower.includes('hr')) {
    return UserGroupIcon;
  }
  if (occupationLower.includes('analyst') || occupationLower.includes('consultant')) {
    return CpuChipIcon;
  }
  if (occupationLower.includes('designer') || occupationLower.includes('design')) {
    return AcademicCapIcon;
  }
  if (occupationLower.includes('tailor') || occupationLower.includes('craft')) {
    return ScissorsIcon;
  }
  if (occupationLower.includes('housekeeping') || occupationLower.includes('staff')) {
    return HomeModernIcon;
  }
  if (occupationLower.includes('restaurant') || occupationLower.includes('hotel')) {
    return ShoppingBagIcon;
  }
  if (occupationLower.includes('engineer') || occupationLower.includes('developer')) {
    return WrenchScrewdriverIcon;
  }
  if (occupationLower.includes('business') || occupationLower.includes('office')) {
    return BuildingOfficeIcon;
  }
  
  return BriefcaseIcon; // Default
};

// Vibrant color palette for session types
const sessionTypeColors = {
  group: { bg: 'from-blue-400 to-blue-300', badge: 'bg-blue-500/20 text-blue-900 border-blue-500/30' },
  '1on1': { bg: 'from-purple-400 to-purple-300', badge: 'bg-purple-500/20 text-purple-900 border-purple-500/30' },
};

const UserResearchModern = () => {
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState('group');
  const [topic, setTopic] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Agent selection dialog state
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced filters
  const [filterOccupation, setFilterOccupation] = useState('');
  const [filterTechSavvy, setFilterTechSavvy] = useState('');
  const [filterEnglishSavvy, setFilterEnglishSavvy] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const callIntervalRef = React.useRef(null);

  useEffect(() => {
    fetchAgents();
    fetchRecentSessions();
  }, []);

  useEffect(() => {
    if (agentDialogOpen) {
      setFilteredAgents(availableAgents);
    }
  }, [agentDialogOpen, availableAgents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents/v5?view=short');
      const agentsData = response.data.map(agent => ({
        ...agent,
        englishLevel: deriveEnglishLevel(agent),
      }));
      setAvailableAgents(agentsData);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const response = await api.get('/sessions/recent');
      setRecentSessions(response.data || []);
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
    }
  };

  const handleAgentToggle = (agent) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) {
        return prev.filter((a) => a.id !== agent.id);
      } else {
        if (sessionType === '1on1' && prev.length >= 1) {
          return [agent];
        }
        if (sessionType === 'group' && prev.length >= 5) {
          toast.error('Maximum 5 agents allowed for group sessions');
          return prev;
        }
        return [...prev, agent];
      }
    });
  };

  const handleCreateSession = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for discussion');
      return;
    }

    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      return;
    }

    if (sessionType === '1on1' && selectedAgents.length !== 1) {
      setError('1:1 interview requires exactly one agent');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/sessions/create', {
        type: sessionType,
        agentIds: selectedAgents.map((a) => a.id),
        topic: topic,
      });

      setSuccess('Session created successfully!');
      toast.success('Session created successfully!');
      setTimeout(() => {
        navigate(`/user-research/session/${response.data.sessionId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create session';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = (type) => {
    if (selectedAgents.length === 0) {
      toast.error('Please select agents first');
      return;
    }

    if (!topic.trim()) {
      toast.error('Please enter a research topic first');
      return;
    }

    // Navigate to AudioCall component with selected agents and topic
    navigate('/audio-call', {
      state: {
        agentIds: selectedAgents.map(agent => agent.id),
        topic: topic,
        type: sessionType
      }
    });
  };

  const handleEndCall = () => {
    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
    }

    const duration = formatCallDuration(callDuration);
    setIsInCall(false);
    setCallDuration(0);
    setCallType(null);
    setIsMuted(false);

    toast.success('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    toast.success(isMuted ? 'Unmuted' : 'Muted');
  };

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleViewSession = (sessionId) => {
    navigate(`/user-research/session/${sessionId}`);
  };

  // Filter agents for modal
  const filteredAgentsForModal = useMemo(() => {
    let filtered = availableAgents;
    
    if (searchQuery) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.occupation?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterOccupation) {
      filtered = filtered.filter(agent => agent.occupation === filterOccupation);
    }
    
    if (filterTechSavvy) {
      filtered = filtered.filter(agent => agent.tech_savviness === filterTechSavvy);
    }
    
    if (filterEnglishSavvy) {
      filtered = filtered.filter(agent => agent.englishLevel === filterEnglishSavvy);
    }
    
    if (filterLocation) {
      filtered = filtered.filter(agent => agent.location === filterLocation);
    }
    
    return filtered;
  }, [availableAgents, searchQuery, filterOccupation, filterTechSavvy, filterEnglishSavvy, filterLocation]);

  const stats = useMemo(() => {
    return {
      total: availableAgents.length,
      selected: selectedAgents.length,
      recent: recentSessions.length,
    };
  }, [availableAgents, selectedAgents, recentSessions]);

  if (loading && availableAgents.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AirbnbSpinner size="xl" />
          <p className="text-gray-600 font-medium">Loading user research tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AirbnbHeader
        onGenerateAgent={() => navigate('/generate')}
        onGroupChat={() => navigate('/group-chat')}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        stats={stats}
      />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 text-green-500 mr-3">✅</div>
                <p className="text-green-800">{success}</p>
                <button
                  onClick={() => setSuccess('')}
                  className="ml-auto text-green-500 hover:text-green-700"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session Setup Card */}
          <div className="lg:col-span-2">
            <AirbnbCard className="h-fit" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Session</h2>
                <div className="flex items-center gap-2">
                  <AirbnbBadge variant="primary">
                    {sessionType === 'group' ? 'Group Discussion' : '1:1 Interview'}
                  </AirbnbBadge>
                </div>
              </div>

              {/* Session Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => {
                    setSessionType('group');
                    if (selectedAgents.length > 5) {
                      setSelectedAgents(selectedAgents.slice(0, 5));
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sessionType === 'group'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="w-6 h-6 text-gray-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Group Discussion</h3>
                      <p className="text-sm text-gray-500">2-5 agents discussing</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSessionType('1on1');
                    if (selectedAgents.length > 1) {
                      setSelectedAgents(selectedAgents.slice(0, 1));
                    }
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    sessionType === '1on1'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">1:1 Interview</h3>
                      <p className="text-sm text-gray-500">In-depth interview</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Research Topic */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Research Topic
                </label>
                <AirbnbInput
                  placeholder="E.g., Mobile banking experience, Product feedback, Feature preferences"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-20 resize-none"
                />
              </div>

              {/* Selected Agents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Selected Agents ({selectedAgents.length}/{sessionType === '1on1' ? '1' : '5'})
                  </label>
                  <AirbnbButton
                    variant="outline"
                    size="sm"
                    onClick={() => setAgentDialogOpen(true)}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Agents
                  </AirbnbButton>
                </div>

                {selectedAgents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={agent.avatar_url}
                          alt={agent.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=32&background=37C893&color=fff&bold=true`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {agent.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {agent.occupation}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAgentToggle(agent)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No agents selected</p>
                    <p className="text-sm">Click "Add Agents" to select participants</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <AirbnbButton
                  onClick={handleCreateSession}
                  disabled={loading || !topic.trim() || selectedAgents.length === 0}
                  loading={loading}
                  className="flex-1"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Start Session
                </AirbnbButton>

                {selectedAgents.length > 0 && (
                  <>
                    <AirbnbButton
                      variant="secondary"
                      onClick={() => handleStartCall('audio')}
                      disabled={isInCall}
                      className="px-6"
                    >
                      <PhoneIcon className="w-5 h-5 mr-2" />
                      Audio Call
                    </AirbnbButton>

                    <AirbnbButton
                      variant="secondary"
                      onClick={() => handleStartCall('video')}
                      disabled={isInCall}
                      className="px-6"
                    >
                      <VideoCameraIcon className="w-5 h-5 mr-2" />
                      Video Call
                    </AirbnbButton>
                  </>
                )}
              </div>

              {/* Active Call Banner */}
              {isInCall && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        {callType === 'audio' ? (
                          <PhoneSolid className="w-5 h-5" />
                        ) : (
                          <VideoCameraIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {callType === 'audio' ? 'Audio Call' : 'Video Call'} in Progress
                        </p>
                        <p className="text-sm opacity-90">
                          {formatCallDuration(callDuration)} • {selectedAgents.length} participants
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isMuted
                            ? 'bg-red-500 text-white'
                            : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                        }`}
                      >
                        {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                      </button>
                      <button
                        onClick={handleEndCall}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        <StopIcon className="w-4 h-4 mr-2 inline" />
                        End Call
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AirbnbCard>
          </div>

          {/* Recent Sessions */}
          <div>
            <AirbnbCard className="h-fit" padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
              
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleViewSession(session.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {session.topic}
                        </h4>
                        <AirbnbBadge size="sm">
                          {session.type}
                        </AirbnbBadge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {session.agentCount} agents • {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent sessions</p>
                  <p className="text-sm">Create your first research session</p>
                </div>
              )}
            </AirbnbCard>
          </div>
        </div>
      </div>

      {/* Agent Selection Modal */}
      <AnimatePresence>
        {agentDialogOpen && (
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
              className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Select Agents ({selectedAgents.length}/{sessionType === '1on1' ? '1' : '5'})
                  </h3>
                  <button
                    onClick={() => setAgentDialogOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <AirbnbInput
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <AirbnbButton
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon className="w-4 h-4 mr-2" />
                    Filters
                  </AirbnbButton>
                </div>

                {/* Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <select
                        value={filterOccupation}
                        onChange={(e) => setFilterOccupation(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">All Occupations</option>
                        {[...new Set(availableAgents.map(a => a.occupation))].map(occ => (
                          <option key={occ} value={occ}>{occ}</option>
                        ))}
                      </select>
                      <select
                        value={filterTechSavvy}
                        onChange={(e) => setFilterTechSavvy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">All Tech Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <select
                        value={filterEnglishSavvy}
                        onChange={(e) => setFilterEnglishSavvy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">All English Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                      <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">All Locations</option>
                        {[...new Set(availableAgents.map(a => a.location))].map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent List */}
                            <div className="p-6 max-h-96 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredAgentsForModal.map((agent) => {
                    const isSelected = selectedAgents.find(a => a.id === agent.id);
                    const ProfessionIcon = getProfessionIcon(agent.occupation);
                    
                    return (
                      <div
                        key={agent.id}
                        onClick={() => handleAgentToggle(agent)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.avatar_url}
                            alt={agent.name}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=48&background=37C893&color=fff&bold=true`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {agent.name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {agent.occupation}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <AirbnbBadge size="sm">
                                {agent.tech_savviness || 'Medium'}
                              </AirbnbBadge>
                              <AirbnbBadge size="sm">
                                {agent.englishLevel}
                              </AirbnbBadge>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-3">
                  <AirbnbButton
                    variant="outline"
                    onClick={() => setAgentDialogOpen(false)}
                  >
                    Cancel
                  </AirbnbButton>
                  <AirbnbButton
                    onClick={() => setAgentDialogOpen(false)}
                    disabled={selectedAgents.length === 0}
                  >
                    Done
                  </AirbnbButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserResearchModern;
