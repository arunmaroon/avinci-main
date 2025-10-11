import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PaperAirplaneIcon, 
    UserIcon, 
    PhotoIcon,
    XMarkIcon,
    TrashIcon,
    SparklesIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Toaster, toast } from 'react-hot-toast';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const ParallelChat = ({ selectedAgents, onClose }) => {
    const {
        sendMessage,
        uploadUI,
        clearHistory,
        setCurrentAgent,
        clearError
    } = useChatStore();

    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responses, setResponses] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [uiContext, setUiContext] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingResponses, setStreamingResponses] = useState({});
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [responses, chatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading || selectedAgents.length === 0) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        clearError();

        // Add user message to chat history
        const newUserMessage = {
            id: Date.now(),
            type: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
            uiContext: uiContext
        };

        setChatHistory(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Send message to all selected agents in parallel
            const response = await api.post('/ai/parallel-chat', {
                agentIds: selectedAgents.map(agent => agent.id),
                message: userMessage,
                chatHistory: chatHistory
            });

            if (response.data.success) {
                const agentResponses = response.data.responses.map(resp => ({
                    id: Date.now() + Math.random(),
                    type: 'agent',
                    agentId: resp.agentId,
                    agentName: resp.agentName,
                    content: resp.response,
                    success: resp.success,
                    timestamp: resp.timestamp,
                    error: resp.error
                }));

                setResponses(prev => [...prev, ...agentResponses]);
                setChatHistory(prev => [...prev, ...agentResponses]);

                // Show success message
                const successCount = agentResponses.filter(r => r.success).length;
                toast.success(`${successCount}/${agentResponses.length} agents responded successfully`);
            } else {
                throw new Error('Failed to get responses from agents');
            }
        } catch (error) {
            console.error('Parallel chat error:', error);
            toast.error('Failed to send message to agents');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStreamingChat = async () => {
        if (!inputMessage.trim() || isStreaming || selectedAgents.length === 0) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        clearError();

        // Add user message to chat history
        const newUserMessage = {
            id: Date.now(),
            type: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
            uiContext: uiContext
        };

        setChatHistory(prev => [...prev, newUserMessage]);
        setIsStreaming(true);
        setStreamingResponses({});

        try {
            // Use Server-Sent Events for streaming responses
            const eventSource = new EventSource(
                `/api/ai/streaming-parallel-chat?agentIds=${selectedAgents.map(a => a.id).join(',')}&message=${encodeURIComponent(userMessage)}`
            );

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'start':
                            toast.info('Starting conversation with agents...');
                            break;
                            
                        case 'agents_loaded':
                            toast.success(`${data.validAgents} agents ready`);
                            break;
                            
                        case 'response':
                            setStreamingResponses(prev => ({
                                ...prev,
                                [data.agentId]: {
                                    id: Date.now() + Math.random(),
                                    type: 'agent',
                                    agentId: data.agentId,
                                    agentName: data.agentName,
                                    content: data.response,
                                    success: data.success,
                                    timestamp: data.timestamp,
                                    error: data.error
                                }
                            }));
                            break;
                            
                        case 'complete':
                            // Move streaming responses to main responses
                            const completedResponses = Object.values(streamingResponses);
                            setResponses(prev => [...prev, ...completedResponses]);
                            setChatHistory(prev => [...prev, ...completedResponses]);
                            
                            toast.success(`All agents responded! ${data.successfulResponses}/${data.successfulResponses + data.failedResponses} successful`);
                            eventSource.close();
                            setIsStreaming(false);
                            break;
                            
                        case 'error':
                            toast.error(data.message);
                            eventSource.close();
                            setIsStreaming(false);
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                toast.error('Connection error during streaming');
                eventSource.close();
                setIsStreaming(false);
            };

        } catch (error) {
            console.error('Streaming chat error:', error);
            toast.error('Failed to start streaming chat');
            setIsStreaming(false);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a PNG or JPG image');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File size exceeds 5MB limit.');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to backend
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('agentId', selectedAgents[0]?.id || 'parallel');

            const response = await api.post('/ai/upload-ui', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUiContext(response.data.ui_path);
            toast.success('UI image uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload image');
            setImagePreview(null);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearHistory = () => {
        setChatHistory([]);
        setResponses([]);
        setStreamingResponses({});
        setImagePreview(null);
        setUiContext(null);
        toast.success('Chat history cleared');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (isStreaming) {
                handleStreamingChat();
            } else {
                handleSendMessage();
            }
        }
    };

    const getAgentAvatar = (agentId) => {
        const agent = selectedAgents.find(a => a.id === agentId);
        return agent ? getAvatarSrc(agent) : `https://ui-avatars.com/api/?name=Agent&background=random&color=fff&size=200`;
    };

    const getAgentName = (agentId) => {
        const agent = selectedAgents.find(a => a.id === agentId);
        return agent ? agent.name : 'Unknown Agent';
    };

    return (
        <div className="flex h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster position="top-right" />
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Parallel Chat</h2>
                                <p className="text-xs text-gray-500">{selectedAgents.length} agents selected</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleClearHistory}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                aria-label="Clear chat history"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span>Clear</span>
                            </button>
                            <button
                                onClick={onClose}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                                aria-label="Close chat"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Close</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SparklesIcon className="w-10 h-10 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Parallel Conversation</h3>
                            <p className="text-sm">Send a message to all {selectedAgents.length} selected agents simultaneously</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chatHistory.map((message, index) => (
                                <motion.div
                                    key={message.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.type === 'user' ? (
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl px-6 py-3 max-w-xs lg:max-w-md">
                                            <p className="text-sm">{message.content}</p>
                                            {message.uiContext && (
                                                <div className="mt-2">
                                                    <img
                                                        src={`http://localhost:9001${message.uiContext}`}
                                                        alt="Uploaded UI"
                                                        className="rounded-lg max-w-full h-auto"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-start space-x-3 max-w-4xl">
                                            <img
                                                src={getAgentAvatar(message.agentId)}
                                                alt={message.agentName}
                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                onError={(e) => handleAvatarError(e, message.agentName)}
                                            />
                                            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-semibold text-gray-900">{message.agentName}</span>
                                                    {message.success === false && (
                                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                    )}
                                                    {message.success === true && (
                                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700">{message.content}</p>
                                                {message.error && (
                                                    <p className="text-xs text-red-500 mt-1">Error: {message.error}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            
                            {/* Streaming responses */}
                            {Object.values(streamingResponses).map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-start space-x-3 max-w-4xl">
                                        <img
                                            src={getAgentAvatar(message.agentId)}
                                            alt={message.agentName}
                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                            onError={(e) => handleAvatarError(e, message.agentName)}
                                        />
                                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900">{message.agentName}</span>
                                                <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />
                                            </div>
                                            <p className="text-sm text-gray-700">{message.content}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                            aria-label="Upload image"
                        >
                            <PhotoIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Send message to ${selectedAgents.length} agents...`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={1}
                                disabled={isLoading || isStreaming}
                            />
                            {imagePreview && (
                                <div className="absolute top-2 right-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-8 h-8 rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading || isStreaming}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleStreamingChat}
                                disabled={!inputMessage.trim() || isLoading || isStreaming}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                aria-label="Send streaming message"
                            >
                                <SparklesIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Parallel:</span> All agents respond simultaneously • 
                        <span className="font-medium"> Streaming:</span> Real-time responses as they arrive
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParallelChat;
