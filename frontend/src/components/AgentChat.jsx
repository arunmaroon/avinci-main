import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PaperAirplaneIcon, 
    UserIcon, 
    PhotoIcon,
    XMarkIcon,
    TrashIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Toaster, toast } from 'react-hot-toast';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';

const AgentChat = ({ agentId, agentName, onClose }) => {
    const { 
        chatHistory, 
        isLoading, 
        error: storeError,
        uiContext,
        sendMessage,
        uploadUI,
        clearHistory,
        setCurrentAgent,
        clearError
    } = useChatStore();

    const [inputMessage, setInputMessage] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (agentId) {
            setCurrentAgent(agentId);
            fetchAgent(agentId);
        }
    }, [agentId]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchAgent = async (id) => {
        try {
            const response = await api.get(`/enhanced-chat/personas/${id}`);
            setSelectedAgent(response.data.agent);
        } catch (error) {
            console.error('Error fetching agent:', error);
            toast.error('Failed to load agent');
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading || !selectedAgent) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        clearError();

        await sendMessage(userMessage, uiContext);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PNG or JPG images only.');
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
            await uploadUI(file);
            toast.success('UI image uploaded successfully!');
        } catch (error) {
            toast.error(storeError || 'Failed to upload image');
            setImagePreview(null);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    const handleClearHistory = () => {
        clearHistory();
        setImagePreview(null);
        toast.success('Chat history cleared');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster position="top-right" />
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header with Controls */}
                <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">{selectedAgent?.name || agentName}</h2>
                                <p className="text-xs text-gray-500">{selectedAgent?.occupation || 'AI Agent'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClearHistory}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            aria-label="Clear chat history"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Clear</span>
                        </button>
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-500 py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SparklesIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                            <p className="text-sm">Chat with {selectedAgent?.name || agentName} or upload a UI for feedback</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {chatHistory.map((message, index) => (
                            <motion.div
                                key={message.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                                        message.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                            : message.role === 'error'
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    {message.ui_path && (
                                        <div className="mb-2">
                                            <img 
                                                src={message.ui_path} 
                                                alt="Uploaded UI" 
                                                className="rounded-lg max-w-xs border border-gray-300"
                                            />
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-900 max-w-xl px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex space-x-2 items-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                    <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                    <div className="px-6 pb-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                <div className="flex items-center space-x-2 text-sm">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700 font-medium">UI uploaded and ready for feedback</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setImagePreview(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
                    <div className="flex space-x-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={handleImageUpload}
                            className="hidden"
                            aria-label="Upload UI image"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-gray-300"
                            disabled={isLoading}
                            aria-label="Upload image"
                        >
                            <PhotoIcon className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask for UI feedback or chat with the agent..."
                            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                            aria-label="Chat input"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            aria-label="Send message"
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