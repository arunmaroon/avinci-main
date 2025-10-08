import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PaperAirplaneIcon, 
    UserIcon, 
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const AgentChat = ({ agentId, agentName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [chatThemes, setChatThemes] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (agentId) {
            fetchAgent(agentId);
        }
    }, [agentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchAgent = async (id) => {
        try {
            const response = await api.get(`/enhanced-chat/personas/${id}`);
            setSelectedAgent(response.data.agent);
        } catch (error) {
            console.error('Error fetching agent:', error);
            setError('Failed to load agent');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading || !selectedAgent) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setError(null);

        // Add user message
        setMessages(prev => [...prev, { 
            role: 'user', 
            content: userMessage, 
            timestamp: new Date() 
        }]);
        setIsLoading(true);

        try {
            const response = await api.post('/ai/generate', {
                agentId: selectedAgent.id,
                query: userMessage,
                chat_history: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            if (response.data && response.data.success && response.data.response) {
                const agentResponse = response.data.response;
                setMessages(prev => [...prev, { 
                    role: 'agent', 
                    content: agentResponse, 
                    timestamp: new Date() 
                }]);
                
                // Extract themes
                extractThemes(userMessage, agentResponse);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Sorry, I encountered an error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const extractThemes = (userMessage, agentResponse) => {
        const themes = [];
        
        const fintechKeywords = ['banking', 'payment', 'finance', 'money', 'transaction', 'account', 'card'];
        const techKeywords = ['app', 'software', 'technology', 'digital', 'online', 'mobile'];
        const painKeywords = ['problem', 'issue', 'difficult', 'frustrated', 'confused', 'stuck'];
        
        const combinedText = (userMessage + ' ' + agentResponse).toLowerCase();
        
        if (fintechKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Fintech');
        }
        if (techKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Technology');
        }
        if (painKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Pain Points');
        }
        
        setChatThemes(prev => [...new Set([...prev, ...themes])]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>Start a conversation with {selectedAgent?.name || agentName}</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg border border-gray-200">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Themes Sidebar */}
            <div className="w-64 bg-white border-l border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Themes</h3>
                {chatThemes.length > 0 ? (
                    <div className="space-y-2">
                        {chatThemes.map((theme, index) => (
                            <div
                                key={index}
                                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                            >
                                {theme}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No themes detected yet</p>
                )}
            </div>
        </div>
    );
};

export default AgentChat;