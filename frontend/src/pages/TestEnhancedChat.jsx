import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TestEnhancedChat = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to Agent Library
        navigate('/agents', { replace: true });
    }, [navigate]);

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to Agent Library...</p>
            </div>
        </div>
    );
};

export default TestEnhancedChat;