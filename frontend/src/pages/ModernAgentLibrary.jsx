import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserGroupIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    SparklesIcon,
    PlusIcon,
    ChatBubbleLeftRightIcon,
    FunnelIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    ViewColumnsIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';
import UltraModernAgentCard from '../components/UltraModernAgentCard';
import '../styles/modern-ui.css';

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

const ModernAgentLibrary = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');
    const [englishFilter, setEnglishFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [sortBy, setSortBy] = useState('name');

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

            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

            const age = agent.demographics?.age ?? agent.age;
            const matchesAge =
                ageFilter === 'all' ||
                (ageFilter === 'young' && age && age < 30) ||
                (ageFilter === 'adult' && age && age >= 30 && age < 50) ||
                (ageFilter === 'mature' && age && age >= 50);

            const matchesTech = techFilter === 'all' || agent.tech_savviness === techFilter;
            const matchesEnglish = englishFilter === 'all' || agent.englishLevel === englishFilter;
            const matchesLocation = locationFilter === 'all' || agent.locationLabel === locationFilter;

            return matchesSearch && matchesStatus && matchesAge && matchesTech && matchesEnglish && matchesLocation;
        });

        // Sort agents
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name?.localeCompare(b.name) || 0;
                case 'age':
                    return (a.demographics?.age || a.age || 0) - (b.demographics?.age || b.age || 0);
                case 'location':
                    return a.locationLabel?.localeCompare(b.locationLabel) || 0;
                case 'tech':
                    return a.tech_savviness?.localeCompare(b.tech_savviness) || 0;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [agents, searchTerm, statusFilter, ageFilter, techFilter, englishFilter, locationFilter, sortBy]);

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setAgeFilter('all');
        setTechFilter('all');
        setEnglishFilter('all');
        setLocationFilter('all');
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
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Modern Header */}
            <div className="relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5" />
                <div className="absolute inset-0 opacity-40" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
                
                <div className="relative px-6 py-12 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-7xl"
                    >
                        {/* Header Content */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <UserGroupIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-display gradient-text">Agent Library</h1>
                                        <p className="text-subtitle mt-2">
                                            Curate, explore, and chat with your research personas
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <motion.div 
                                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div variants={itemVariants} className="card-modern p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-small text-gray-500">Total Agents</p>
                                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                                <UserGroupIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="card-modern p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-small text-gray-500">Active</p>
                                                <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="card-modern p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-small text-gray-500">Sleeping</p>
                                                <p className="text-3xl font-bold text-amber-600">{stats.sleeping}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="card-modern p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-small text-gray-500">Archived</p>
                                                <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                                <div className="w-3 h-3 rounded-full bg-gray-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => window.location.href = '/group-chat'}
                                    className="btn-modern btn-outline"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    Group Chat
                                </button>
                                <button
                                    onClick={handleAddTestAgent}
                                    className="btn-modern btn-primary"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Test Agent
                                </button>
                                <button
                                    onClick={() => setShowEnhancedCreator(true)}
                                    className="btn-modern btn-secondary"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    Generate New Agent
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 lg:px-8 pb-12">
                <div className="mx-auto max-w-7xl">
                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="card-modern p-6 mb-8"
                    >
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search agents by name, occupation, or quote..."
                                className="input-modern pl-12 pr-4"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn-modern btn-ghost"
                            >
                                <FunnelIcon className="w-5 h-5" />
                                Filters
                                {showFilters && <XMarkIcon className="w-4 h-4" />}
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-small text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-modern w-auto"
                                >
                                    <option value="name">Name</option>
                                    <option value="age">Age</option>
                                    <option value="location">Location</option>
                                    <option value="tech">Tech Level</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-small text-gray-500">View:</span>
                                <div className="flex rounded-lg border border-gray-200 p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                    >
                                        <Squares2X2Icon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                    >
                                        <ViewColumnsIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={resetFilters}
                                className="btn-modern btn-outline ml-auto"
                            >
                                Clear Filters
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-6 pt-6 border-t border-gray-200"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="text-small text-gray-500 mb-2 block">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="input-modern"
                                            >
                                                <option value="all">All</option>
                                                <option value="active">Active</option>
                                                <option value="sleeping">Sleeping</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-small text-gray-500 mb-2 block">Age</label>
                                            <select
                                                value={ageFilter}
                                                onChange={(e) => setAgeFilter(e.target.value)}
                                                className="input-modern"
                                            >
                                                <option value="all">All Ages</option>
                                                <option value="young">Younger than 30</option>
                                                <option value="adult">30 to 49</option>
                                                <option value="mature">50 and above</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-small text-gray-500 mb-2 block">Tech Comfort</label>
                                            <select
                                                value={techFilter}
                                                onChange={(e) => setTechFilter(e.target.value)}
                                                className="input-modern"
                                            >
                                                <option value="all">All</option>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-small text-gray-500 mb-2 block">English</label>
                                            <select
                                                value={englishFilter}
                                                onChange={(e) => setEnglishFilter(e.target.value)}
                                                className="input-modern"
                                            >
                                                <option value="all">All</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Elementary">Elementary</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                                <option value="Expert">Expert</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-small text-gray-500 mb-2 block">Location</label>
                                            <select
                                                value={locationFilter}
                                                onChange={(e) => setLocationFilter(e.target.value)}
                                                className="input-modern"
                                            >
                                                <option value="all">All Locations</option>
                                                {locationOptions.map(location => (
                                                    <option key={location} value={location}>
                                                        {location}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Agents Grid/List */}
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-20">
                            <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="text-gray-500">Loading agents...</p>
                        </div>
                    ) : filteredAgents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="card-modern p-20 text-center"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <UserGroupIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-title mb-2">No agents match your filters</h3>
                            <p className="text-gray-500 mb-8">
                                {searchTerm ? 'Try a different search term or clear the filters.' : 'Generate a new persona to get started.'}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => setShowEnhancedCreator(true)}
                                    className="btn-modern btn-primary"
                                >
                                    <DocumentTextIcon className="w-5 h-5" />
                                    Generate Agent
                                </button>
                                <button
                                    onClick={handleAddTestAgent}
                                    className="btn-modern btn-outline"
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
                            className={`grid-modern ${
                                viewMode === 'grid' 
                                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                                    : 'grid-cols-1'
                            }`}
                        >
                            {filteredAgents.map((agent, index) => (
                                <UltraModernAgentCard
                                    key={agent.id}
                                    agent={agent}
                                    index={index}
                                    onSelectAgent={handleStartChat}
                                    onDeleteAgent={handleDeleteAgent}
                                    onAgentStatusChange={handleAgentStatusChange}
                                    onViewDetails={(agent) => {
                                        // Handle view details
                                        console.log('View details for:', agent.name);
                                    }}
                                    onStartChat={handleStartChat}
                                    onStartAudioCall={(agent) => {
                                        window.location.href = `/audio-call?agentId=${agent.id}`;
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Enhanced Creator Modal */}
            {showEnhancedCreator && (
                <EnhancedAgentCreator
                    onClose={() => setShowEnhancedCreator(false)}
                    onAgentCreated={handleAgentCreated}
                />
            )}
        </div>
    );
};

export default ModernAgentLibrary;
