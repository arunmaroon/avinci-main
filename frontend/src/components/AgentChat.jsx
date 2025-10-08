import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PaperAirplaneIcon, 
    UserIcon, 
    ChatBubbleLeftRightIcon,
    PhotoIcon,
    PlusIcon,
    SparklesIcon,
    HeartIcon,
    StarIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    CommandLineIcon,
    ArrowLeftIcon,
    MicrophoneIcon,
    StopIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const AgentChat = ({ agentId, agentName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [availableAgents, setAvailableAgents] = useState([]);
    const [chatThemes, setChatThemes] = useState([]);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [isRecording, setIsRecording] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

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
            setAvailableAgents(response.data.agents || []);
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
        setIsTyping(true);

        try {
            const response = await api.post('/ai/generate', {
                agentId: selectedAgent.id,
                message: inputMessage
            });

            // Simulate typing delay
            setTimeout(() => {
                const agentMessage = {
                    id: Date.now() + 1,
                    type: 'agent',
                    content: response.data.response,
                    timestamp: new Date().toISOString()
                };

                setMessages(prev => [...prev, agentMessage]);
                setIsTyping(false);
                extractThemes(inputMessage, response.data.response);
            }, 1000 + Math.random() * 2000);

        } catch (error) {
            console.error('Error sending message:', error);
            setIsTyping(false);
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
        if (userMessage.toLowerCase().includes('design')) themes.push('Design');
        if (userMessage.toLowerCase().includes('user')) themes.push('User Experience');
        if (userMessage.toLowerCase().includes('interface')) themes.push('Interface');
        if (userMessage.toLowerCase().includes('feedback')) themes.push('Feedback');
        
        if (themes.length > 0) {
            setChatThemes(prev => [...new Set([...prev, ...themes])]);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('agentId', selectedAgent.id);

            const response = await api.post('/ai/feedback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageMessage = {
                id: Date.now(),
                type: 'agent',
                content: response.data.feedback,
                timestamp: new Date().toISOString(),
                hasImage: true,
                imageUrl: URL.createObjectURL(file)
            };

            setMessages(prev => [...prev, imageMessage]);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const toggleFavorite = () => {
        if (selectedAgent) {
            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (newFavorites.has(selectedAgent.id)) {
                    newFavorites.delete(selectedAgent.id);
                } else {
                    newFavorites.add(selectedAgent.id);
                }
                return newFavorites;
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const MessageBubble = ({ message, isUser }) => (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
        >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg ${
                    isUser 
                        ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600' 
                        : 'bg-gradient-primary text-white'
                }`}>
                    {isUser ? <UserIcon className="w-5 h-5" /> : selectedAgent?.name?.charAt(0) || 'A'}
                </div>

                {/* Message content */}
                <div className={`px-6 py-4 rounded-3xl shadow-lg ${
                    isUser 
                        ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800' 
                        : 'bg-primary-50 text-slate-800'
                }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.hasImage && message.imageUrl && (
                        <div className="mt-4">
                            <img 
                                src={message.imageUrl} 
                                alt="Uploaded design" 
                                className="w-full max-w-xs rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                        </div>
                    )}
                    <p className="text-xs opacity-60 mt-3">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </motion.div>
    );

    const TypingIndicator = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-6"
        >
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg bg-gradient-primary">
                    {selectedAgent?.name?.charAt(0) || 'A'}
                </div>
                <div className="px-6 py-4 rounded-3xl shadow-lg bg-primary-50">
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: '#144835' }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const QuickReplies = () => {
        const suggestions = [
            'Tell me about yourself',
            'What are your goals?',
            'How can you help me?',
            'Share your experience'
        ];

        return (
            <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion, index) => (
                    <motion.button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 text-sm rounded-full border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                    >
                        {suggestion}
                    </motion.button>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="glass border-b border-white/20 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                        )}
                        
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg bg-gradient-primary">
                                {selectedAgent?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {selectedAgent?.name || 'Select an Agent'}
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {selectedAgent?.role_title || 'Choose an agent to start chatting'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowThemes(!showThemes)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={toggleFavorite}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200"
                        >
                            {favorites.has(selectedAgent?.id) ? (
                                <HeartSolidIcon className="w-5 h-5 text-red-500" />
                            ) : (
                                <HeartIcon className="w-5 h-5" />
                            )}
                        </button>
                        
                        <div className="relative">
                            <button
                                onClick={() => setShowAgentSelector(!showAgentSelector)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200"
                            >
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                            
                            {showAgentSelector && (
                                <div className="absolute right-0 top-12 w-64 glass rounded-2xl shadow-xl border border-white/20 p-2 z-10">
                                    <div className="space-y-1">
                                        {availableAgents.map((agent) => (
                                            <button
                                                key={agent.id}
                                                onClick={() => {
                                                    fetchAgent(agent.id);
                                                    setShowAgentSelector(false);
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/10 transition-colors duration-200"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold bg-gradient-primary">
                                                        {agent.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{agent.name}</p>
                                                        <p className="text-xs text-slate-600">{agent.role_title}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Themes Sidebar */}
            <AnimatePresence>
                {showThemes && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="glass border-b border-white/20 p-4"
                    >
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Chat Themes</h3>
                            <div className="flex flex-wrap gap-2">
                                {chatThemes.length > 0 ? (
                                    chatThemes.map((theme, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-xs font-medium rounded-full"
                                            style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)', color: '#144835' }}
                                        >
                                            {theme}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-500 italic">No themes identified yet</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {messages.length === 0 && !isTyping && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-lg bg-gradient-primary">
                                <SparklesIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Start a conversation</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto">
                                Ask questions, share designs, or get feedback from your AI agent. 
                                They're here to help you test and improve your designs.
                            </p>
                            <QuickReplies />
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isUser={message.type === 'user'}
                            />
                        ))}
                    </AnimatePresence>

                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="glass border-t border-white/20 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end space-x-3">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full px-6 py-4 pr-20 rounded-2xl border border-slate-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 resize-none transition-all duration-200 shadow-sm"
                                rows="1"
                                style={{ minHeight: '56px', maxHeight: '120px' }}
                            />
                            
                            <div className="absolute right-3 top-3 flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                    <PhotoIcon className="w-5 h-5" />
                                </label>
                                
                                <button
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                                >
                                    <MicrophoneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="p-4 rounded-2xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg bg-gradient-primary"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentChat;