import React, { useState, useEffect } from 'react';
import { 
    UserGroupIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    DocumentTextIcon,
    SparklesIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';
import PersonaChat from '../components/PersonaChat';
import BulkTranscriptUploader from '../components/BulkTranscriptUploader';
import AgentGrid from '../components/AgentGrid';

const AgentLibrary = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);
    const [showBulkUploader, setShowBulkUploader] = useState(false);
    const [selectedAgentForChat, setSelectedAgentForChat] = useState(null);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            console.log('Fetching agents from API...');
            const response = await api.get('/agents/v5?view=short');
            console.log('Agents response:', response.data);
            setAgents(response.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = !searchTerm || 
            agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.role_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.quote?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleAddTestAgent = async () => {
        try {
            console.log('Creating test agent...');
            const response = await api.post('/agents/v5', {
                transcript: {
                    raw_text: 'This is a test transcript for creating a demo agent. The person is friendly and helpful, always willing to assist with questions and provide guidance. They love using mobile apps for banking and are eager to learn new features. They sometimes get confused by technical terms and are apprehensive about making mistakes. They prefer simple language and step-by-step instructions.',
                    file_name: 'test_transcript.txt'
                },
                demographics: {
                    // Let the backend generate Indian demographics automatically
                }
            });
            console.log('Test agent created:', response.data);
            // Refresh the agents list
            fetchAgents();
        } catch (error) {
            console.error('Error creating test agent:', error);
            console.error('Error details:', error.response?.data);
        }
    };

    const handleAgentCreated = (newAgent) => {
        console.log('New agent created:', newAgent);
        fetchAgents(); // Refresh the list
        setShowEnhancedCreator(false); // Close the creator
    };

    const handleStartChat = (agent) => {
        setSelectedAgentForChat(agent);
        setShowChat(true);
    };

    const handleBulkAgentsCreated = (createdAgents) => {
        console.log('Bulk agents created:', createdAgents);
        fetchAgents(); // Refresh the list
        setShowBulkUploader(false); // Close the uploader
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            console.log('Deleting agent:', agentId);
            const response = await api.delete(`/agents/v5/${agentId}`);
            console.log('Agent deleted:', response.data);
            // Refresh the agents list
            fetchAgents();
        } catch (error) {
            console.error('Error deleting agent:', error);
            console.error('Error details:', error.response?.data);
        }
    };

    const handleAgentStatusChange = (agentId, newStatus) => {
        setAgents(prevAgents => 
            prevAgents.map(agent => 
                agent.id === agentId 
                    ? { ...agent, status: newStatus }
                    : agent
            )
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-h2 font-bold text-gray-900 flex items-center">
                    <UserGroupIcon className="h-8 w-8 mr-3 text-primary-600" />
                    Agent Library
                </h1>
                <div className="flex space-x-4">
                    <button
                        onClick={handleAddTestAgent}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Test Agent
                    </button>
                    <button
                        onClick={() => setShowEnhancedCreator(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <SparklesIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Generate New Agent
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search agents by name, role, or quote..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                                style={{ '--tw-ring-color': '#144835' }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent"
                                style={{ '--tw-ring-color': '#144835' }}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="sleeping">Sleeping</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agents Grid */}
            {loading ? (
                <div className="text-center py-10">
                    <svg className="animate-spin h-10 w-10 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg text-gray-600">Loading agents...</p>
                </div>
            ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your search or filter criteria'
                            : 'Get started by generating your first AI agent'
                        }
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => setShowBulkUploader(true)}
                                    className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2" 
                                    style={{ backgroundColor: '#144835' }} 
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} 
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    <span>Bulk Upload Transcripts</span>
                                </button>
                                <button 
                                    onClick={() => setShowEnhancedCreator(true)}
                                    className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2" 
                                    style={{ backgroundColor: '#144835' }} 
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} 
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                                >
                                    <DocumentTextIcon className="w-5 h-5" />
                                    <span>Single Transcript</span>
                                </button>
                                <button 
                                    onClick={handleAddTestAgent}
                                    className="text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2" 
                                    style={{ backgroundColor: '#144835' }} 
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} 
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Add Test Agent</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <AgentGrid 
                    agents={filteredAgents}
                    onSelectAgent={handleStartChat}
                    onDeleteAgent={handleDeleteAgent}
                    onAgentStatusChange={handleAgentStatusChange}
                />
            )}

            {/* Stats */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
                        <div className="text-sm text-gray-500">Total Agents</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {agents.filter(agent => agent.status === 'active').length}
                        </div>
                        <div className="text-sm text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {agents.filter(agent => agent.status === 'sleeping').length}
                        </div>
                        <div className="text-sm text-gray-500">Sleeping</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {agents.filter(agent => agent.status === 'archived').length}
                        </div>
                        <div className="text-sm text-gray-500">Archived</div>
                    </div>
                </div>
            </div>

            {/* Bulk Transcript Uploader */}
            <div className="mt-12">
                <h2 className="text-h3 font-bold text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="h-7 w-7 mr-2 text-primary-600" />
                    Bulk Transcript Uploader
                </h2>
                <p className="text-body-md text-gray-600 mb-6">
                    Upload CSV or Excel files containing multiple transcripts to generate agents in bulk.
                </p>
                <BulkTranscriptUploader onAgentsCreated={handleBulkAgentsCreated} />
            </div>

            {/* Agent Creator Modal */}
            {showEnhancedCreator && (
                <EnhancedAgentCreator 
                    onClose={() => setShowEnhancedCreator(false)} 
                    onAgentCreated={handleAgentCreated} 
                />
            )}

            {/* Persona Chat Modal */}
            {showChat && selectedAgentForChat && (
                <PersonaChat 
                    agent={selectedAgentForChat} 
                    onClose={() => setShowChat(false)} 
                />
            )}
        </div>
    );
};

export default AgentLibrary;