import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AirbnbHeader from '../components/AirbnbHeader';
import AirbnbFilters from '../components/AirbnbFilters';
import AirbnbAgentCard from '../components/AirbnbAgentCard';
import EnhancedDetailedPersonaCard from '../components/EnhancedDetailedPersonaCard';
import PasswordConfirmation from '../components/PasswordConfirmation';
import api from '../utils/api';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';

const formatTitleCase = (value = '') => {
  if (!value) return '';
  const clean = value.toString().replace(/_/g, ' ').toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const complexityToEnglishLevel = (complexity) => {
  if (complexity >= 8) return 'Advanced';
  if (complexity >= 6) return 'Intermediate';
  if (complexity >= 4) return 'Basic';
  if (complexity > 0) return 'Beginner';
  return 'Unknown';
};

const deriveEnglishLevel = (agent) => {
  if (agent.speech_patterns?.english_level) return agent.speech_patterns.english_level;
  if (agent.english_savvy) return agent.english_savvy;
  if (agent.communication_style?.english_proficiency) return agent.communication_style.english_proficiency;
  if (agent.communication_style?.english_level) return agent.communication_style.english_level;
  
  if (agent?.vocabulary_profile?.complexity) {
    return complexityToEnglishLevel(agent.vocabulary_profile.complexity);
  }
  const gauge = agent?.gauges?.english_literacy;
  if (!gauge) return 'Intermediate';
  const normalized = gauge.toLowerCase();
  switch (normalized) {
    case 'high':
      return 'Advanced';
    case 'medium':
      return 'Intermediate';
    case 'low':
      return 'Elementary';
    case 'basic':
      return 'Beginner';
    default:
      return formatTitleCase(gauge);
  }
};

const normalizeStatus = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'active' : 'archived';
  }
  if (typeof status === 'string') {
    return status.toLowerCase();
  }
  return 'active';
};

const normalizeLevel = (value, fallback = 'medium') => {
  if (!value) return fallback;
  return value.toString().toLowerCase();
};

const AirbnbAgentLibrary = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [detailedPersona, setDetailedPersona] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingAgent, setPendingAgent] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    age: 'all',
    techLevel: 'all',
    englishLevel: 'all',
    location: 'all',
    sortBy: 'name'
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agents/v5?view=short');
      const normalized = (response.data || []).map(agent => {
        const status = normalizeStatus(agent.status);
        const techLevel = normalizeLevel(agent.tech_savviness || agent.gauges?.tech);
        const domainLevel = normalizeLevel(agent.domain_literacy?.level || agent.gauges?.domain);
        const englishLevel = deriveEnglishLevel(agent);
        const locationLabel = agent.location || 'Unknown';

        return {
          ...agent,
          status,
          statusLabel: formatTitleCase(status),
          tech_savviness: techLevel,
          techLabel: formatTitleCase(techLevel),
          domainLevel: formatTitleCase(domainLevel),
          englishLevel,
          locationLabel
        };
      });
      setAgents(normalized);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(agent => agent.status === 'active').length,
    sleeping: agents.filter(agent => agent.status === 'sleeping').length,
    archived: agents.filter(agent => agent.status === 'archived').length
  }), [agents]);

  const locationOptions = useMemo(() => {
    const set = new Set();
    agents.forEach(agent => {
      if (agent.locationLabel && agent.locationLabel !== 'Unknown') {
        set.add(agent.locationLabel);
      }
    });
    return Array.from(set).sort();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    let filtered = agents.filter(agent => {
      const searchValue = searchTerm.trim().toLowerCase();
      const matchesSearch = !searchValue ||
        agent.name?.toLowerCase().includes(searchValue) ||
        agent.occupation?.toLowerCase().includes(searchValue) ||
        agent.role_title?.toLowerCase().includes(searchValue) ||
        agent.quote?.toLowerCase().includes(searchValue);

      const matchesStatus = filters.status === 'all' || agent.status === filters.status;

      const age = agent.demographics?.age ?? agent.age;
      const matchesAge =
        filters.age === 'all' ||
        (filters.age === 'young' && age && age < 30) ||
        (filters.age === 'adult' && age && age >= 30 && age < 50) ||
        (filters.age === 'mature' && age && age >= 50);

      const matchesTech = filters.techLevel === 'all' || agent.tech_savviness === filters.techLevel;
      const matchesEnglish = filters.englishLevel === 'all' || agent.englishLevel === filters.englishLevel;
      const matchesLocation = filters.location === 'all' || agent.locationLabel === filters.location;

      return matchesSearch && matchesStatus && matchesAge && matchesTech && matchesEnglish && matchesLocation;
    });

    // Sort agents
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0;
        case 'age':
          return (a.demographics?.age || a.age || 0) - (b.demographics?.age || b.age || 0);
        case 'location':
          return a.locationLabel?.localeCompare(b.locationLabel) || 0;
        case 'tech':
          return a.tech_savviness?.localeCompare(b.tech_savviness) || 0;
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    return filtered;
  }, [agents, searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      age: 'all',
      techLevel: 'all',
      englishLevel: 'all',
      location: 'all',
      sortBy: 'name'
    });
  };

  const handleAddTestAgent = async () => {
    try {
      await api.post('/agents/v5', {
        transcript: {
          raw_text: 'This is a test transcript for creating a demo agent. The person is friendly and helpful, always willing to assist with questions and provide guidance. They love using mobile apps for banking and are eager to learn new features. They sometimes get confused by technical terms and are apprehensive about making mistakes. They prefer simple language and step-by-step instructions.',
          file_name: 'test_transcript.txt'
        },
        demographics: {}
      });
      fetchAgents();
    } catch (error) {
      console.error('Error creating test agent:', error);
    }
  };

  const handleAgentCreated = () => {
    fetchAgents();
    setShowEnhancedCreator(false);
  };

  const handleStartChat = (agent) => {
    window.location.href = `/enhanced-chat/${agent.id}`;
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await api.delete(`/agents/v5/${agentId}`);
      fetchAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleAgentStatusChange = (agentId, newStatus) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent.id === agentId
          ? { ...agent, status: newStatus, statusLabel: formatTitleCase(newStatus) }
          : agent
      )
    );
  };

  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    setLoadingPersona(true);
    setShowDetailView(true);

    try {
      const response = await api.get(`/personas/${agent.id}`);
      setDetailedPersona(response.data.agent);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Airbnb Header */}
      <AirbnbHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddTestAgent={handleAddTestAgent}
        onGenerateAgent={() => setShowEnhancedCreator(true)}
        onGroupChat={() => window.location.href = '/group-chat'}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Filters */}
      <AirbnbFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="airbnb-grid airbnb-grid-cols-2 airbnb-md:grid-cols-4 gap-4">
            <div className="airbnb-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="airbnb-text-sm text-gray-600">Total Agents</p>
                  <p className="airbnb-text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="airbnb-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="airbnb-text-sm text-gray-600">Active</p>
                  <p className="airbnb-text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
            </div>

            <div className="airbnb-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="airbnb-text-sm text-gray-600">Sleeping</p>
                  <p className="airbnb-text-2xl font-bold text-amber-600">{stats.sleeping}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
              </div>
            </div>

            <div className="airbnb-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="airbnb-text-sm text-gray-600">Archived</p>
                  <p className="airbnb-text-2xl font-bold text-gray-600">{stats.archived}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
            <p className="airbnb-text-base text-gray-600">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="airbnb-card p-20 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
            <h3 className="airbnb-text-2xl font-bold text-gray-900 mb-2">No agents found</h3>
            <p className="airbnb-text-base text-gray-600 mb-8">
              {searchTerm ? 'Try adjusting your search or filters.' : 'Get started by creating your first agent.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowEnhancedCreator(true)}
                className="airbnb-btn airbnb-btn-primary"
              >
                <SparklesIcon className="w-5 h-5" />
                Generate Agent
              </button>
              <button
                onClick={handleAddTestAgent}
                className="airbnb-btn airbnb-btn-secondary"
              >
                <PlusIcon className="w-5 h-5" />
                Add Test Agent
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="airbnb-grid airbnb-grid-cols-1 airbnb-sm:grid-cols-2 airbnb-lg:grid-cols-3 airbnb-xl:grid-cols-4"
          >
            {filteredAgents.map((agent, index) => (
              <motion.div key={agent.id} variants={itemVariants}>
                <AirbnbAgentCard
                  agent={agent}
                  index={index}
                  onSelectAgent={handleStartChat}
                  onDeleteAgent={handleDeleteAgent}
                  onAgentStatusChange={handleAgentStatusChange}
                  onViewDetails={handleViewDetails}
                  onStartChat={handleStartChat}
                  onStartAudioCall={(agent) => {
                    window.location.href = `/audio-call?agentId=${agent.id}`;
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailView && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="airbnb-text-xl font-semibold text-gray-900">Agent Details</h2>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {loadingPersona ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
                    <span className="airbnb-text-base">Loading details...</span>
                  </div>
                ) : detailedPersona ? (
                  <EnhancedDetailedPersonaCard persona={detailedPersona} />
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <p className="airbnb-text-base">Failed to load agent details.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Creator Modal */}
      {showEnhancedCreator && (
        <EnhancedAgentCreator
          onClose={() => setShowEnhancedCreator(false)}
          onAgentCreated={handleAgentCreated}
        />
      )}

      {/* Password Confirmation Modal */}
      <PasswordConfirmation
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={() => {
          // Handle password confirmation
          setShowPasswordConfirm(false);
        }}
        action={pendingAction}
        agentName={pendingAgent?.name}
      />
    </div>
  );
};

export default AirbnbAgentLibrary;
