import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PaperAirplaneIcon, 
    UserIcon, 
    ChatBubbleLeftRightIcon,
    PhotoIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const AgentChat = ({ agentId, agentName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [availableAgents, setAvailableAgents] = useState([]);
    const [chatThemes, setChatThemes] = useState([]);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (agentId) {
            fetchAgent(agentId);
        }
        fetchAvailableAgents();
    }, [agentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchAgent = async (id) => {
        try {
            const response = await api.get(`/agent/generate/${id}`);
            setSelectedAgent(response.data.agent);
        } catch (error) {
            console.error('Error fetching agent:', error);
        }
    };

    const fetchAvailableAgents = async () => {
        try {
            const response = await api.get('/agent/generate');
            setAvailableAgents(response.data.agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || !selectedAgent) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/ai/generate', {
                agentId: selectedAgent.id,
                message: inputMessage
            });

            const agentMessage = {
                id: Date.now() + 1,
                type: 'agent',
                content: response.data.response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, agentMessage]);
            
            // Extract themes from the conversation
            extractThemes(inputMessage, response.data.response);
            
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const extractThemes = (userMessage, agentResponse) => {
        const themes = [];
        
        // Simple theme extraction based on keywords
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

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('agentId', selectedAgent.id);

            const response = await api.post('/api/agent/feedback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const feedbackMessage = {
                id: Date.now(),
                type: 'agent',
                content: response.data.feedback,
                timestamp: new Date().toISOString(),
                isImageFeedback: true
            };

            setMessages(prev => [...prev, feedbackMessage]);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {selectedAgent && (
                                <>
                                    <img
                                        src={selectedAgent.avatar_url}
                                        alt={selectedAgent.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            {selectedAgent.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {selectedAgent.persona?.occupation || 'AI Agent'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowAgentSelector(!showAgentSelector)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                title="Select Agent"
                            >
                                <UserIcon className="w-5 h-5" />
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Agent Selector Dropdown */}
                {showAgentSelector && (
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableAgents.map(agent => (
                                <button
                                    key={agent.id}
                                    onClick={() => {
                                        fetchAgent(agent.id);
                                        setShowAgentSelector(false);
                                    }}
                                    className={`p-3 rounded-lg border text-left transition-colors ${
                                        selectedAgent?.id === agent.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={agent.avatar_url}
                                            alt={agent.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">{agent.name}</p>
                                            <p className="text-sm text-gray-500">{agent.occupation}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.type === 'user'
                                            ? 'bg-blue-500 text-white'
                                            : message.type === 'error'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    {message.isImageFeedback && (
                                        <p className="text-xs mt-1 text-gray-500 italic">
                                            (Image feedback)
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-2">
                        <div className="flex-1">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={1}
                                disabled={!selectedAgent || isLoading}
                            />
                        </div>
                        <div className="flex items-center space-x-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                                disabled={!selectedAgent || isLoading}
                            />
                            <label
                                htmlFor="image-upload"
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50"
                                title="Upload Image"
                            >
                                <PhotoIcon className="w-5 h-5" />
                            </label>
                            <button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || !selectedAgent || isLoading}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Sidebar */}
            <div className="w-64 bg-white border-l border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Themes</h3>
                <div className="space-y-2">
                    {chatThemes.length > 0 ? (
                        chatThemes.map((theme, index) => (
                            <div
                                key={index}
                                className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
                            >
                                {theme}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No themes detected yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentChat;
