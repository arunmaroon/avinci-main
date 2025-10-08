import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DocumentTextIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    SparklesIcon,
    PlusIcon,
    ArrowUpTrayIcon,
    PlayIcon,
    ChartBarIcon,
    CommandLineIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { PlusIcon as PlusSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

const UberResearchStudio = () => {
    const [activeTab, setActiveTab] = useState('agents');
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUsabilityTest, setShowUsabilityTest] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);

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
        } finally {
            setLoading(false);
        }
    };

    const handleUsabilityTest = async (agentId, uiPath, task) => {
        try {
            setLoading(true);
            const response = await api.post('/enhanced-agent/usability', {
                agentId: agentId,
                uiPath: uiPath,
                task: task,
                uiType: 'image'
            });
            return response.data.results;
        } catch (error) {
            console.error('Error running usability test:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const AgentCard = ({ agent }) => (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-6 hover:shadow-lg transition-all duration-200"
        >
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                        {agent.name?.charAt(0) || 'A'}
                    </span>
                </div>
                
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{agent.name}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{agent.role_title || 'AI Agent'}</p>
                    <p className="text-xs text-neutral-500 mb-3">{agent.location || 'Unknown'} • {agent.age || 'Unknown'} years old</p>
                    
                    {agent.objectives && agent.objectives.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {agent.objectives.slice(0, 3).map((objective, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded-full"
                                >
                                    {objective}
                            </span>
                            ))}
                        </div>
                    )}

                    {agent.quote && (
                        <div className="mb-4 p-3 bg-neutral-50 rounded-lg border-l-4 border-l-primary">
                            <p className="text-sm text-neutral-700 italic">"{agent.quote}"</p>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                            className="btn btn-sm btn-primary"
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                            Chat
                        </button>
                        
                        <button
                            onClick={() => {
                                setSelectedAgent(agent);
                                setShowUsabilityTest(true);
                            }}
                            className="btn btn-sm btn-secondary"
                        >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Test UI
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const UsabilityTestModal = () => (
        <AnimatePresence>
            {showUsabilityTest && selectedAgent && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-neutral-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-neutral-900">
                                    Usability Test with {selectedAgent.name}
                                </h2>
                                <button
                                    onClick={() => setShowUsabilityTest(false)}
                                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Upload UI Design
                                </label>
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <ArrowUpTrayIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-600">Drag and drop your design file here</p>
                                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG, PDF supported</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Test Task
                                </label>
                                <select className="w-full input">
                                    <option>Navigate to product page</option>
                                    <option>Complete checkout process</option>
                                    <option>Find specific information</option>
                                    <option>Custom task...</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowUsabilityTest(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // Handle test execution
                                        setShowUsabilityTest(false);
                                    }}
                                    className="btn btn-primary"
                                >
                                    <PlayIcon className="w-4 h-4 mr-2" />
                                    Start Test
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-neutral-600">Loading research studio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Research Studio
                </h1>
                <p className="text-neutral-600">
                    Test your designs with AI agents that mimic real users from your research
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-neutral-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('agents')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'agents'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        <UserGroupIcon className="w-4 h-4 mr-2 inline" />
                        Available Agents
                    </button>
                </div>
            </div>

            {/* Content */}
            <div>
                {activeTab === 'agents' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-neutral-900">
                                Available Agents ({agents.length})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button className="btn btn-sm btn-secondary">
                                    <ChartBarIcon className="w-4 h-4 mr-2" />
                                    Analytics
                                </button>
                            </div>
                        </div>

                        {agents.length === 0 ? (
                            <div className="card p-12 text-center">
                                <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                    <UserGroupIcon className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Agents Available</h3>
                                <p className="text-neutral-600 mb-6">Create some agents first to use them in research</p>
                                <a
                                    href="/generate"
                                    className="btn btn-primary inline-flex items-center space-x-2"
                                >
                                    <PlusSolidIcon className="w-5 h-5" />
                                    <span>Create Agent</span>
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {agents.map((agent) => (
                                    <AgentCard key={agent.id} agent={agent} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            <UsabilityTestModal />
        </div>
    );
};

export default UberResearchStudio;