/**
 * Airbnb-Style Group Chat Page
 * Features: Clean design, efficient layout, more chat visibility, better UX
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    UserGroupIcon, 
    PlusIcon, 
    XMarkIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    ArrowLeftIcon,
    EllipsisVerticalIcon,
    CheckIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';
import { 
    AirbnbButton, 
    AirbnbCard, 
    AirbnbInput, 
    AirbnbTextarea, 
    AirbnbBadge, 
    AirbnbSpinner
} from '../design-system/airbnb-components';

const AirbnbGroupChatPage = () => {
    const [allAgents, setAllAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chatPurpose, setChatPurpose] = useState('');
    const [isChatActive, setIsChatActive] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentRespondingAgent, setCurrentRespondingAgent] = useState(null);
    const [uploadedImagePath, setUploadedImagePath] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOccupation, setFilterOccupation] = useState('');
    const [filterTechSavvy, setFilterTechSavvy] = useState('');
    const [filterEnglishSavvy] = useState('');
    
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);

    // Chat store selectors
    const activeGroupId = useChatStore((state) => state.activeGroupId);
    const groupChatHistory = useChatStore((state) => state.groupChatHistory);
    const startGroupChatSession = useChatStore((state) => state.startGroupChatSession);
    const appendGroupMessage = useChatStore((state) => state.appendGroupMessage);
    const loadGroupChatHistory = useChatStore((state) => state.loadGroupChatHistory);
    const endGroupChatSession = useChatStore((state) => state.endGroupChatSession);
    const loadLastActiveGroupChat = useChatStore((state) => state.loadLastActiveGroupChat);

    useEffect(() => {
        fetchAllAgents();
        const loadedGroupId = loadLastActiveGroupChat();
        if (loadedGroupId) {
            setIsChatActive(true);
            toast.success('Restored previous group chat session');
        }
    }, [loadLastActiveGroupChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groupChatHistory]);

    useEffect(() => {
        if (activeGroupId) {
            loadGroupChatHistory(activeGroupId);
        }
    }, [activeGroupId, loadGroupChatHistory]);

    useEffect(() => {
        if (isChatActive && !activeGroupId && !hasInitialized.current) {
            hasInitialized.current = true;
            const newGroupId = startGroupChatSession(selectedAgents, chatPurpose);
            loadGroupChatHistory(newGroupId);
        }
    }, [isChatActive, selectedAgents, chatPurpose, startGroupChatSession, loadGroupChatHistory]);

    const fetchAllAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/agents/v5?_t=${Date.now()}`);
            const agents = response.data || [];
            setAllAgents(agents);
        } catch (err) {
            console.error('Error fetching agents:', err);
            toast.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    };

    const toggleAgentSelection = (agent) => {
        setSelectedAgents((prev) => {
            const isSelected = prev.find((a) => a.id === agent.id);
            if (isSelected) {
                return prev.filter((a) => a.id !== agent.id);
            }
            return [...prev, agent];
        });
    };

    const startGroupChat = () => {
        if (selectedAgents.length < 2) {
            toast.error('Please select at least 2 agents for group chat');
            return;
        }
        if (!chatPurpose.trim()) {
            toast.error('Please enter the purpose of the chat');
            return;
        }
        setIsChatActive(true);
        toast.success(`Started group chat with ${selectedAgents.length} agents`);
    };

    const endGroupChat = () => {
        setIsChatActive(false);
        setMessage('');
        endGroupChatSession();
        toast.success('Group chat ended');
    };

    const sendMessage = async () => {
        if (!message.trim() || isLoading || !isChatActive) {
            if (!isChatActive) toast.error('Please start a group chat first');
            return;
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };

        appendGroupMessage(userMessage);
        setMessage('');
        setIsLoading(true);

        try {
            for (let i = 0; i < selectedAgents.length; i++) {
                const agent = selectedAgents[i];
                setCurrentRespondingAgent(agent);

                const agentHistory = groupChatHistory.filter(
                    (msg) => msg.type === 'user' || (msg.type === 'agent' && msg.agent?.id === agent.id)
                );

                try {
                    const response = await api.post('/ai/generate', {
                        agentId: agent.id,
                        query: userMessage.content,
                        chat_history: agentHistory,
                        chat_purpose: chatPurpose,
                        ui_path: uploadedImagePath,
                    });

                    appendGroupMessage({
                        id: Date.now() + i,
                        type: 'agent',
                        agent,
                        content: response.data?.response || '…',
                        timestamp: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error(`Error getting response from ${agent.name}:`, error);
                    const errorMessage = error.response?.data?.error || error.message || 'Sorry, I encountered an error. Please try again.';
                    appendGroupMessage({
                        id: Date.now() + i,
                        type: 'agent',
                        agent,
                        content: errorMessage,
                        timestamp: new Date().toISOString(),
                        isError: true,
                    });
                }
            }
        } catch (error) {
            console.error('Error in group chat:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
            setCurrentRespondingAgent(null);
        }
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post('/ai/upload-ui', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadedImagePath(response.data.path);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredAgents = allAgents.filter(agent => {
        const matchesSearch = !searchTerm || 
            agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.role_title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesOccupation = !filterOccupation || 
            agent.role_title?.toLowerCase().includes(filterOccupation.toLowerCase());
        
        const matchesTech = !filterTechSavvy || 
            agent.gauges?.tech?.toLowerCase() === filterTechSavvy.toLowerCase();
        
        const matchesEnglish = !filterEnglishSavvy || 
            agent.gauges?.english_literacy?.toLowerCase() === filterEnglishSavvy.toLowerCase();

        return matchesSearch && matchesOccupation && matchesTech && matchesEnglish;
    });

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary-500">
                                    <UserGroupIcon className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900">Group Chat</h1>
                                    <p className="text-xs text-gray-500">
                                        {isChatActive ? `${selectedAgents.length} agents` : 'Select agents to start'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {isChatActive && (
                                <AirbnbButton
                                    onClick={endGroupChat}
                                    variant="outline"
                                    size="sm"
                                >
                                    End
                                </AirbnbButton>
                            )}
                            <AirbnbButton
                                onClick={() => setShowAgentSelector(!showAgentSelector)}
                                variant="primary"
                                size="sm"
                            >
                                <PlusIcon className="h-3 w-3 mr-1" />
                                Add
                            </AirbnbButton>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Agent Selector Sidebar */}
                <AnimatePresence>
                    {showAgentSelector && (
                        <motion.div
                            initial={{ x: -400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -400, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="w-80 bg-white border-r border-neutral-200 flex flex-col"
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Select Agents</h2>
                                    <button
                                        onClick={() => setShowAgentSelector(false)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Search and Filters */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                        <AirbnbInput
                                            type="text"
                                            placeholder="Search agents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={filterOccupation}
                                            onChange={(e) => setFilterOccupation(e.target.value)}
                                            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">All Roles</option>
                                            <option value="engineer">Engineer</option>
                                            <option value="manager">Manager</option>
                                            <option value="analyst">Analyst</option>
                                            <option value="designer">Designer</option>
                                        </select>

                                        <select
                                            value={filterTechSavvy}
                                            onChange={(e) => setFilterTechSavvy(e.target.value)}
                                            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none"
                                        >
                                            <option value="">All Tech Levels</option>
                                            <option value="expert">Expert</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Agent List */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <AirbnbSpinner size="md" color="primary" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredAgents.map((agent) => {
                                            const isSelected = selectedAgents.find(a => a.id === agent.id);
                                            return (
                                                <motion.div
                                                    key={agent.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => toggleAgentSelection(agent)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                        isSelected 
                                                            ? 'border-primary-500 bg-primary-50' 
                                                            : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative">
                                                            <img
                                                                src={getAvatarSrc(agent.avatar_url, agent.name, { size: 40 })}
                                                                alt={agent.name}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                                onError={(e) => handleAvatarError(e, agent.name, { size: 40 })}
                                                            />
                                                            {isSelected && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                                                                    <CheckIcon className="h-3 w-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                {agent.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {agent.role_title}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Footer */}
                            <div className="p-4 border-t border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-900">
                                        {selectedAgents.length} selected
                                    </span>
                                    <button
                                        onClick={() => setSelectedAgents([])}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <AirbnbButton
                                    onClick={() => setShowAgentSelector(false)}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Done
                                </AirbnbButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {!isChatActive ? (
                        /* Setup Screen */
                        <div className="flex-1 flex items-center justify-center p-8">
                            <AirbnbCard className="max-w-md w-full text-center" padding="lg">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <UserGroupIcon className="h-8 w-8 text-neutral-400" />
                                </div>
                                <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                                    Start a Group Chat
                                </h2>
                                <p className="text-neutral-600 mb-8">
                                    Select agents and define the purpose to begin your multi-agent conversation.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Chat Purpose
                                        </label>
                                        <AirbnbTextarea
                                            value={chatPurpose}
                                            onChange={(e) => setChatPurpose(e.target.value)}
                                            placeholder="What should the agents discuss? (e.g., 'Plan a product launch strategy')"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <AirbnbBadge variant="default">
                                            {selectedAgents.length} agents selected
                                        </AirbnbBadge>
                                        <AirbnbButton
                                            onClick={startGroupChat}
                                            disabled={selectedAgents.length < 2 || !chatPurpose.trim()}
                                            variant="primary"
                                        >
                                            <SparklesIcon className="h-4 w-4 mr-2" />
                                            Start Chat
                                        </AirbnbButton>
                                    </div>
                                </div>
                            </AirbnbCard>
                        </div>
                    ) : (
                        /* Chat Interface */
                        <div className="flex-1 flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex -space-x-2">
                                            {selectedAgents.slice(0, 3).map((agent, index) => (
                                                <img
                                                    key={agent.id}
                                                    src={getAvatarSrc(agent.avatar_url, agent.name, { size: 32 })}
                                                    alt={agent.name}
                                                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                                    onError={(e) => handleAvatarError(e, agent.name, { size: 32 })}
                                                />
                                            ))}
                                            {selectedAgents.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    +{selectedAgents.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {selectedAgents.map(a => a.name).join(', ')}
                                            </h3>
                                            <p className="text-xs text-gray-500">{chatPurpose}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAgentSelector(true)}
                                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container - Takes remaining space */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 min-h-0 max-w-4xl mx-auto w-full">
                                {groupChatHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <SparklesIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Start the conversation
                                        </h3>
                                        <p className="text-gray-500">
                                            Send a message to begin chatting with your selected agents.
                                        </p>
                                    </div>
                                ) : (
                                    groupChatHistory.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`flex max-w-2xl lg:max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {message.type === 'agent' && (
                                                    <img
                                                        src={getAvatarSrc(message.agent?.avatar_url, message.agent?.name, { size: 40 })}
                                                        alt={message.agent?.name}
                                                        className="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0 shadow-sm"
                                                        onError={(e) => handleAvatarError(e, message.agent?.name, { size: 40 })}
                                                    />
                                                )}
                                                <div className={`px-6 py-4 rounded-2xl shadow-sm ${
                                                    message.type === 'user'
                                                        ? 'bg-primary-500 text-white'
                                                        : message.isError
                                                        ? 'bg-red-50 text-red-700 border border-red-200'
                                                        : 'bg-white text-neutral-900 border border-neutral-200'
                                                }`}>
                                                    {message.type === 'agent' && (
                                                        <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                                            <span>{message.agent?.name}</span>
                                                            <span className="ml-2 text-xs text-gray-400 font-normal">
                                                                {formatTime(message.timestamp)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                                        message.type === 'user' ? 'text-white' : 'text-gray-800'
                                                    }`}>
                                                        {message.content}
                                                    </div>
                                                    {message.type === 'user' && (
                                                        <div className="text-xs text-primary-100 mt-2 text-right">
                                                            {formatTime(message.timestamp)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                
                                {/* Loading indicator */}
                                {isLoading && currentRespondingAgent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex max-w-2xl lg:max-w-3xl">
                                            <img
                                                src={getAvatarSrc(currentRespondingAgent.avatar_url, currentRespondingAgent.name, { size: 40 })}
                                                alt={currentRespondingAgent.name}
                                                className="w-10 h-10 rounded-full object-cover mr-4 flex-shrink-0 shadow-sm"
                                                onError={(e) => handleAvatarError(e, currentRespondingAgent.name, { size: 40 })}
                                            />
                                            <div className="bg-white text-gray-900 border border-gray-200 px-6 py-4 rounded-2xl shadow-sm">
                                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                                    {currentRespondingAgent.name} is typing...
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input - Sticky at bottom */}
                            <div className="bg-white border-t border-neutral-200 p-4 flex-shrink-0 sticky bottom-0">
                                <div className="flex items-end space-x-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <AirbnbSpinner size="sm" color="gray" />
                                        ) : (
                                            <PhotoIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <AirbnbTextarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Type your message... (Shift+Enter for new line)"
                                            rows={1}
                                            style={{ minHeight: '48px', maxHeight: '120px' }}
                                        />
                                    </div>
                                    
                                    <AirbnbButton
                                        onClick={sendMessage}
                                        disabled={!message.trim() || isLoading}
                                        variant="primary"
                                        size="lg"
                                        className="p-3"
                                    >
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                    </AirbnbButton>
                                </div>
                                
                                {uploadedImagePath && (
                                    <div className="mt-3 flex items-center space-x-2">
                                        <img
                                            src={`http://localhost:9001/${uploadedImagePath}`}
                                            alt="Uploaded"
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <span className="text-sm text-gray-600">Image attached</span>
                                        <button
                                            onClick={() => setUploadedImagePath(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
};

export default AirbnbGroupChatPage;
