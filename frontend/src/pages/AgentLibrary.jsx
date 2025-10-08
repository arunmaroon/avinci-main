import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlusIcon, 
    MagnifyingGlassIcon, 
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    UserGroupIcon,
    SparklesIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { PlusIcon as PlusSolidIcon } from '@heroicons/react/24/solid';
import AgentGrid from '../components/AgentGrid';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';
import BulkTranscriptUploader from '../components/BulkTranscriptUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const AgentLibrary = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState(new Set());

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/agent/generate');
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setError('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgent = async (agentData) => {
        try {
            const response = await api.post('/agents/v5', agentData);
            if (response.data.success) {
                setAgents(prev => [response.data.agent, ...prev]);
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    };

    const handleBulkUpload = async (transcripts) => {
        try {
            const response = await api.post('/agents/v5/bulk', { transcripts });
            if (response.data.success) {
                setAgents(prev => [...response.data.agents, ...prev]);
                setShowBulkUpload(false);
            }
        } catch (error) {
            console.error('Error bulk uploading:', error);
            throw error;
        }
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            await api.delete(`/agent/generate/${agentId}`);
            setAgents(prev => prev.filter(agent => agent.id !== agentId));
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    };

    const handleAgentStatusChange = async (agentId, newStatus) => {
        try {
            await api.patch(`/agent/generate/${agentId}`, { status: newStatus });
            setAgents(prev => prev.map(agent => 
                agent.id === agentId ? { ...agent, status: newStatus } : agent
            ));
        } catch (error) {
            console.error('Error updating agent status:', error);
        }
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agent.role_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            agent.location?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const sortedAgents = [...filteredAgents].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSelectAgent = (agentId) => {
        setSelectedAgents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(agentId)) {
                newSet.delete(agentId);
            } else {
                newSet.add(agentId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedAgents.size === sortedAgents.length) {
            setSelectedAgents(new Set());
        } else {
            setSelectedAgents(new Set(sortedAgents.map(agent => agent.id)));
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedAgents.size === 0) return;
        
        try {
            const promises = Array.from(selectedAgents).map(agentId => {
                switch (action) {
                    case 'delete':
                        return api.delete(`/agent/generate/${agentId}`);
                    case 'sleep':
                        return api.patch(`/agent/generate/${agentId}`, { status: 'sleeping' });
                    case 'activate':
                        return api.patch(`/agent/generate/${agentId}`, { status: 'active' });
                    default:
                        return Promise.resolve();
                }
            });
            
            await Promise.all(promises);
            await fetchAgents();
            setSelectedAgents(new Set());
        } catch (error) {
            console.error('Error performing bulk action:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <LoadingSpinner size="large" message="Loading agents..." variant="logo" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="glass border-b border-white/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Agent Library</h1>
                            <p className="text-slate-600">Manage and interact with your AI agents</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowBulkUpload(true)}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Squares2X2Icon className="w-5 h-5" />
                                <span>Bulk Upload</span>
                            </button>
                            
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <PlusSolidIcon className="w-5 h-5" />
                                <span>Create Agent</span>
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search agents by name, role, or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="sleeping">Sleeping</option>
                                <option value="archived">Archived</option>
                            </select>

                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                            >
                                <option value="created_at-desc">Newest First</option>
                                <option value="created_at-asc">Oldest First</option>
                                <option value="name-asc">Name A-Z</option>
                                <option value="name-desc">Name Z-A</option>
                                <option value="role_title-asc">Role A-Z</option>
                                <option value="role_title-desc">Role Z-A</option>
                            </select>

                            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        viewMode === 'grid' 
                                            ? 'bg-primary-100 text-primary-800' 
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <Squares2X2Icon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        viewMode === 'list' 
                                            ? 'bg-primary-100 text-primary-800' 
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <ListBulletIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                {/* Stats and Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-6">
                        <div className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">{sortedAgents.length}</span> agents found
                        </div>
                        {selectedAgents.size > 0 && (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-600">
                                    <span className="font-semibold text-primary-800">{selectedAgents.size}</span> selected
                                </span>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 text-xs font-medium rounded-lg bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors duration-200"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('sleep')}
                                        className="px-3 py-1 text-xs font-medium rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors duration-200"
                                    >
                                        Sleep
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200 transition-colors duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors duration-200"
                        >
                            {selectedAgents.size === sortedAgents.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                </div>

                {/* Agents Grid/List */}
                {error ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-red-100">
                            <CommandLineIcon className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Agents</h3>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <button
                            onClick={fetchAgents}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                    </div>
                ) : sortedAgents.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto bg-gradient-primary">
                            <UserGroupIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">No Agents Found</h3>
                        <p className="text-slate-600 mb-6">
                            {searchQuery || filterStatus !== 'all' 
                                ? 'Try adjusting your search or filters' 
                                : 'Create your first AI agent to get started'
                            }
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary flex items-center space-x-2 mx-auto"
                        >
                            <PlusSolidIcon className="w-5 h-5" />
                            <span>Create Your First Agent</span>
                        </button>
                    </div>
                ) : (
                    <AgentGrid
                        agents={sortedAgents}
                        onSelectAgent={handleSelectAgent}
                        onDeleteAgent={handleDeleteAgent}
                        onAgentStatusChange={handleAgentStatusChange}
                        selectedAgents={selectedAgents}
                        viewMode={viewMode}
                    />
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <EnhancedAgentCreator
                                onClose={() => setShowCreateModal(false)}
                                onSuccess={handleCreateAgent}
                            />
                        </motion.div>
                    </motion.div>
                )}

                {showBulkUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <BulkTranscriptUploader
                                onClose={() => setShowBulkUpload(false)}
                                onSuccess={handleBulkUpload}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AgentLibrary;