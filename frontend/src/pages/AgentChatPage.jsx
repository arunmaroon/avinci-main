import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import AgentChat from '../components/AgentChat';
import api from '../utils/api';

const AgentChatPage = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (agentId) {
            fetchAgentDetails();
        }
    }, [agentId]);

    const fetchAgentDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/personas/${agentId}`);
            setAgent(response.data.agent);
        } catch (error) {
            console.error('Error fetching agent details:', error);
            setError('Failed to load agent details');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/agents');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agent...</p>
                </div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Agent Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The requested agent could not be found.'}</p>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Agent Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBack}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Back to Agent Library"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <img
                                src={agent.avatar_url}
                                alt={agent.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                                }}
                            />
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Chat with {agent.name}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {agent.role_title || 'AI Agent'} • {agent.location}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                        </span>
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
                <AgentChat 
                    agentId={agentId}
                    agentName={agent.name}
                />
            </div>
        </div>
    );
};

export default AgentChatPage;
