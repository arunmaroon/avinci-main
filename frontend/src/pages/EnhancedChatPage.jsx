import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EnhancedChat from '../components/EnhancedChat';
import { Card } from '../design-system';
import api from '../utils/api';

const EnhancedChatPage = () => {
    const { agentId } = useParams();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (agentId) {
            fetchAgent();
        }
    }, [agentId]);

    const fetchAgent = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/agents/${agentId}`);
            setAgent(response.data);
        } catch (err) {
            console.error('Error fetching agent:', err);
            setError('Failed to load agent');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agent...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </Card>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Agent Not Found</h2>
                    <p className="text-gray-500">The requested agent could not be found.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Enhanced Chat with {agent.demographics?.name || agent.name}
                        </h1>
                        <p className="text-gray-600">
                            {agent.demographics?.role_title || agent.role_title} at {agent.demographics?.company || agent.company}
                        </p>
                    </div>
                    
                    <Card className="h-[calc(100vh-200px)]">
                        <EnhancedChat 
                            agentId={agentId} 
                            agentName={agent.demographics?.name || agent.name}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EnhancedChatPage;
