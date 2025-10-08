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
    CommandLineIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { PlusIcon as PlusSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

const UberAgentLibrary = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
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

    const AgentCard = ({ agent }) => (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 hover:shadow-lg transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                            {agent.name?.charAt(0) || 'A'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <p className="text-sm text-gray-500">{agent.role_title}</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {agent.quote && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-l-primary">
                    <p className="text-sm text-gray-700 italic">"{agent.quote}"</p>
                </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{agent.location}</span>
                <span>{agent.age} years old</span>
            </div>

            {agent.objectives && agent.objectives.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {agent.objectives.slice(0, 3).map((goal, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded-full"
                            >
                                {goal}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                        className="btn btn-sm btn-primary"
                    >
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                        Chat
                    </button>
                    <button
                        onClick={() => window.location.href = `/detailed-personas`}
                        className="btn btn-sm btn-secondary"
                    >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                    </button>
                </div>
                
                <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <SparklesIcon
                            key={i}
                            className={`w-4 h-4 ${
                                i < 4 ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const AgentListItem = ({ agent }) => (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
            className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                        {agent.name?.charAt(0) || 'A'}
                    </span>
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.role_title} • {agent.location}</p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                    {new Date(agent.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                        className="btn btn-sm btn-primary"
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => window.location.href = `/detailed-personas`}
                        className="btn btn-sm btn-secondary"
                    >
                        View
                    </button>
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agent Library</h1>
                    <p className="text-gray-600">Manage and interact with your AI agents</p>
                </div>
                
                <button className="btn btn-primary">
                    <PlusSolidIcon className="w-5 h-5 mr-2" />
                    Create Agent
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search agents by name, role, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="input"
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
                            className="input"
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                        </select>

                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'grid' 
                                        ? 'bg-white text-primary shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${
                                    viewMode === 'list' 
                                        ? 'bg-white text-primary shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <ListBulletIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{sortedAgents.length}</span> agents found
                </div>
                
                {selectedAgents.size > 0 && (
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                            <span className="font-medium text-primary">{selectedAgents.size}</span> selected
                        </span>
                        <button className="btn btn-sm btn-secondary">Bulk Actions</button>
                    </div>
                )}
            </div>

            {/* Agents Grid/List */}
            {error ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <CommandLineIcon className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Agents</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={fetchAgents} className="btn btn-primary">
                        Try Again
                    </button>
                </div>
            ) : sortedAgents.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <UserGroupIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || filterStatus !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Create your first AI agent to get started'
                        }
                    </p>
                    <button className="btn btn-primary">
                        <PlusSolidIcon className="w-5 h-5 mr-2" />
                        Create Your First Agent
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAgents.map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {sortedAgents.map((agent) => (
                        <AgentListItem key={agent.id} agent={agent} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UberAgentLibrary;
