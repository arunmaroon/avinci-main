import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AgentChatPage = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to Enhanced Chat
        navigate(`/enhanced-chat/${agentId}`, { replace: true });
    }, [agentId, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to Enhanced Chat...</p>
            </div>
        </div>
    );
};

export default AgentChatPage;