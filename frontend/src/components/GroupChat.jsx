import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../design-system';
import { toast } from 'react-hot-toast';
import { 
    PaperAirplaneIcon, 
    PhotoIcon, 
    PlayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const GroupChat = ({ agents, onAddAgents, chatPurpose, onEndChat, chatId }) => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRespondingAgent, setCurrentRespondingAgent] = useState(null);
    const [uiContext, setUiContext] = useState(null);
    const [showPurposeModal, setShowPurposeModal] = useState(false);
    const [showEndChatModal, setShowEndChatModal] = useState(false);
    const [purpose, setPurpose] = useState(chatPurpose || '');
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Load chat history from localStorage on component mount
    useEffect(() => {
        if (chatId) {
            const savedHistory = localStorage.getItem(`group_chat_${chatId}`);
            if (savedHistory) {
                try {
                    const parsedHistory = JSON.parse(savedHistory);
                    setChatHistory(parsedHistory);
                } catch (error) {
                    console.error('Error loading chat history:', error);
                }
            }
        }
    }, [chatId]);

    // Save chat history to localStorage whenever it changes
    useEffect(() => {
        if (chatId && chatHistory.length > 0) {
            localStorage.setItem(`group_chat_${chatId}`, JSON.stringify(chatHistory));
        }
    }, [chatHistory, chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            ui_path: uiContext
        };

        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            // Send message to all agents sequentially
            const agentResponses = [];
            
            for (let i = 0; i < agents.length; i++) {
                const agent = agents[i];
                setCurrentRespondingAgent(agent);
                
                try {
                    // Only pass user messages and this agent's own responses to maintain persona isolation
                    const agentSpecificHistory = chatHistory.filter(msg => 
                        msg.type === 'user' || (msg.type === 'agent' && msg.agent && msg.agent.id === agent.id)
                    );
                    
                    const response = await api.post('/ai/generate', {
                        agentId: agent.id,
                        query: message,
                        ui_path: uiContext,
                        chat_history: agentSpecificHistory,
                        chat_purpose: purpose
                    });

                    if (response.data && response.data.success && response.data.response) {
                        agentResponses.push({
                            id: Date.now() + i,
                            type: 'agent',
                            agent: agent,
                            content: response.data.response,
                            timestamp: new Date().toISOString(),
                            ui_path: uiContext
                        });
                    }
                } catch (error) {
                    console.error(`Error getting response from ${agent.name}:`, error);
                    agentResponses.push({
                        id: Date.now() + i,
                        type: 'agent',
                        agent: agent,
                        content: `Sorry, I encountered an error. Please try again.`,
                        timestamp: new Date().toISOString(),
                        ui_path: uiContext,
                        isError: true
                    });
                }
                
                // Add a small delay between agent responses for better UX
                if (i < agents.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            setChatHistory(prev => [...prev, ...agentResponses]);
            setCurrentRespondingAgent(null);
            setIsLoading(false);

        } catch (error) {
            console.error('Error in group chat:', error);
            setCurrentRespondingAgent(null);
            setIsLoading(false);
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const uploadUI = async (file) => {
        if (!file) return;

        if (agents.length === 0) {
            toast.error('No agents selected for UI upload');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('agentId', agents[0].id); // Use first agent for upload

            console.log('Uploading UI for group chat with agent:', agents[0].id);

            const response = await api.post('/ai/upload-ui', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Group chat UI upload response:', response.data);

            const ui_path = response.data.ui_path;
            setUiContext(ui_path);

            // Add UI upload message
            const uiMessage = {
                id: Date.now(),
                type: 'user',
                content: `Uploaded UI image: ${file.name}`,
                timestamp: new Date().toISOString(),
                ui_path
            };

            setChatHistory(prev => [...prev, uiMessage]);
            toast.success('UI uploaded successfully!');
            setIsLoading(false);

        } catch (error) {
            console.error('Error uploading UI:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to upload UI image';
            toast.error(`UI upload failed: ${errorMessage}`);
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        setChatHistory([]);
        setUiContext(null);
        toast.success('Chat history cleared');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadUI(file);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Group Discussion</h3>
                        <p className="text-gray-600 mb-6">
                            Ask a question and get responses from all {agents.length} selected agents
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {agents.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
                                >
                                    <img
                                        src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`}
                                        alt={agent.name}
                                        className="w-6 h-6 rounded-full object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                                        }}
                                    />
                                    <span className="text-sm font-medium text-gray-700">{agent.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-3xl ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                                {msg.type === 'agent' && (
                                    <div className="flex items-center space-x-2 mb-2">
                                        <img
                                            src={msg.agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.agent.name)}&background=random&color=fff&size=200`}
                                            alt={msg.agent.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.agent.name)}&background=random&color=fff&size=200`;
                                            }}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{msg.agent.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {msg.agent.occupation || msg.agent.role_title}
                                        </span>
                                    </div>
                                )}
                                <div
                                    className={`px-4 py-3 rounded-lg ${
                                        msg.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : msg.isError
                                            ? 'bg-red-50 border border-red-200 text-red-800'
                                            : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    {msg.ui_path && (
                                        <div className="mt-2">
                                            <img
                                                src={`http://localhost:9001/${msg.ui_path}`}
                                                alt="Uploaded UI"
                                                className="max-w-xs rounded-lg border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {/* Loading indicator for current responding agent */}
                {currentRespondingAgent && (
                    <div className="flex justify-start">
                        <div className="max-w-3xl">
                            <div className="flex items-center space-x-2 mb-2">
                                <img
                                    src={currentRespondingAgent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentRespondingAgent.name)}&background=random&color=fff&size=200`}
                                    alt={currentRespondingAgent.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentRespondingAgent.name)}&background=random&color=fff&size=200`;
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">{currentRespondingAgent.name}</span>
                                <span className="text-xs text-gray-500">is typing...</span>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mb-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Upload UI Image"
                    >
                        <PhotoIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setShowPurposeModal(true)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Set Chat Purpose"
                    >
                        <UserGroupIcon className="h-5 w-5" />
                    </button>
                    {onEndChat && (
                        <button
                            onClick={() => setShowEndChatModal(true)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="End Chat"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={clearHistory}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Clear Chat"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Message Input */}
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask all agents a question..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={sendMessage}
                        disabled={!message.trim() || isLoading}
                        className="px-6 py-3"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Purpose Modal */}
            {showPurposeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Set Chat Purpose</h2>
                            <p className="text-gray-600 mt-2">
                                Define the purpose of this group chat. Agents will read this before responding.
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="e.g., Review the new mobile app design for usability issues, accessibility concerns, and user experience improvements..."
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowPurposeModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowPurposeModal(false);
                                    toast.success('Chat purpose set successfully');
                                }}
                            >
                                Set Purpose
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* End Chat Modal */}
            {onEndChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">End Group Chat</h2>
                            <p className="text-gray-600 mt-2">
                                This will generate a designer feedback summary and save the chat session.
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Chat Purpose:</h3>
                                <p className="text-blue-800">{purpose || 'No purpose set'}</p>
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Participants:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {agents.map((agent) => (
                                        <div key={agent.id} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                                            <img
                                                src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`}
                                                alt={agent.name}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                            <span className="text-sm text-gray-700">{agent.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h3 className="font-semibold text-gray-900 mb-2">Messages:</h3>
                                <p className="text-gray-600">{chatHistory.length} total messages</p>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowEndChatModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    onEndChat({
                                        chatId,
                                        purpose,
                                        agents,
                                        chatHistory,
                                        messageCount: chatHistory.length,
                                        endedAt: new Date().toISOString()
                                    });
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                End Chat & Generate Summary
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChat;
