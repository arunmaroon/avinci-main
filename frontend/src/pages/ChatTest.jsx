import React, { useState } from 'react';
import api from '../utils/api';

const ChatTest = () => {
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const testChat = async () => {
        setLoading(true);
        try {
            console.log('Testing chat with message:', message);
            const result = await api.post('/ai/generate', {
                agentId: 'df6ea324-ec31-40bb-b9e5-04690b25f696',
                query: message,
                chat_history: []
            });
            console.log('Chat response:', result.data);
            setResponse(JSON.stringify(result.data, null, 2));
        } catch (error) {
            console.error('Chat error:', error);
            setResponse(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Chat Test</h1>
            <div className="space-y-4">
                <div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <button
                    onClick={testChat}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    {loading ? 'Testing...' : 'Test Chat'}
                </button>
                <div>
                    <h3 className="font-bold">Response:</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                        {response}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ChatTest;





