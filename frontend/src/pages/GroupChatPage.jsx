import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import GroupChat from '../components/GroupChat';
import { Card, Button } from '../design-system';
import { 
    UserGroupIcon, 
    PlusIcon, 
    XMarkIcon,
    CheckIcon,
    ArrowLeftIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';

const GroupChatPage = () => {
    const navigate = useNavigate();
    const [allAgents, setAllAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const { generateSummary, getAllSessions } = useChatStore();

    useEffect(() => {
        fetchAllAgents();
    }, []);

    const fetchAllAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enhanced-chat/personas');
            setAllAgents(response.data.personas);
        } catch (err) {
            console.error('Error fetching agents:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAgentSelection = (agent) => {
        setSelectedAgents(prev => {
            const isSelected = prev.find(a => a.id === agent.id);
            if (isSelected) {
                return prev.filter(a => a.id !== agent.id);
            } else {
                return [...prev, agent];
            }
        });
    };

    const startGroupChat = () => {
        if (selectedAgents.length < 2) {
            alert('Please select at least 2 agents for group chat');
            return;
        }
        setShowAgentSelector(false);
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const result = await generateSummary();
            if (result.error) {
                toast.error(result.error);
            } else {
                setSummary(result);
                setShowSummary(true);
                toast.success('Summary generated successfully');
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.error('Failed to generate summary');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const sessions = getAllSessions();

    const removeAgent = (agentId) => {
        setSelectedAgents(prev => prev.filter(a => a.id !== agentId));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Toaster position="top-right" />
                
                {/* Compact Toolbar */}
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/agents')}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <UserGroupIcon className="h-5 w-5 text-blue-600" />
                                <h1 className="text-lg font-bold text-gray-900">Group Chat</h1>
                                {selectedAgents.length > 0 && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                        {selectedAgents.length} participants
                                    </span>
                                )}
                            </div>
                        </div>
                        
                            <div className="flex items-center space-x-3">
                                {/* Summary Button */}
                                {sessions.length > 0 && (
                                    <Button
                                        onClick={handleGenerateSummary}
                                        disabled={isGeneratingSummary}
                                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        <DocumentTextIcon className="h-4 w-4" />
                                        <span>{isGeneratingSummary ? 'Generating...' : 'Summary'}</span>
                                    </Button>
                                )}

                                {selectedAgents.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        {/* Selected Agents Pills */}
                                    <div className="flex items-center space-x-1 max-w-md overflow-x-auto">
                                        {selectedAgents.slice(0, 3).map((agent) => (
                                            <div
                                                key={agent.id}
                                                className="flex items-center space-x-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm"
                                            >
                                                <img
                                                    src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`}
                                                    alt={agent.name}
                                                    className="w-5 h-5 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                                                    }}
                                                />
                                                <span className="text-gray-700 font-medium">{agent.name}</span>
                                                <button
                                                    onClick={() => removeAgent(agent.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedAgents.length > 3 && (
                                            <div className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-600">
                                                +{selectedAgents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Add/Manage Agents Button */}
                                    <Button
                                        onClick={() => setShowAgentSelector(true)}
                                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        <span>Manage</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Full Height Chat Area */}
                <div className="flex-1">
                    {selectedAgents.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-12">
                            <Card className="p-12 text-center max-w-md">
                                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agents Selected</h2>
                                <p className="text-gray-600 mb-6">
                                    Select at least 2 agents to start a group chat and get diverse perspectives.
                                </p>
                                <Button
                                    onClick={() => setShowAgentSelector(true)}
                                    className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Select Agents</span>
                                </Button>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full p-4">
                            <div className="h-full max-w-none">
                                <Card className="h-full">
                                    <GroupChat 
                                        agents={selectedAgents}
                                        onAddAgents={() => setShowAgentSelector(true)}
                                    />
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Selector Modal */}
            {showAgentSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Select Agents for Group Chat</h2>
                                <button
                                    onClick={() => setShowAgentSelector(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Choose 2 or more agents to participate in the group chat
                            </p>
                        </div>
                        
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allAgents.map((agent) => {
                                    const isSelected = selectedAgents.find(a => a.id === agent.id);
                                    return (
                                        <button
                                            key={agent.id}
                                            onClick={() => toggleAgentSelection(agent)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={agent.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`}
                                                    alt={agent.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=random&color=fff&size=200`;
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 truncate">{agent.name}</div>
                                                    <div className="text-sm text-gray-500 truncate">
                                                        {agent.occupation || agent.role_title}
                                                    </div>
                                                    <div className="text-xs text-gray-400 truncate">
                                                        {agent.location}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <CheckIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAgentSelector(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={startGroupChat}
                                        disabled={selectedAgents.length < 2}
                                    >
                                        Start Group Chat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummary && summary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Design Feedback Summary</h2>
                                <button
                                    onClick={() => setShowSummary(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Based on {summary.sessionCount} chat sessions with {summary.messageCount} total messages
                            </p>
                        </div>
                        
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="prose max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                    {summary.summary}
                                </pre>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Generated on {new Date(summary.timestamp).toLocaleString()}
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowSummary(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(summary.summary);
                                            toast.success('Summary copied to clipboard');
                                        }}
                                    >
                                        Copy Summary
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupChatPage;
