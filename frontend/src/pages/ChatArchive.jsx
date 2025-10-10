import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArchiveBoxIcon, 
    UserGroupIcon, 
    ClockIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    TrashIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const ChatArchive = () => {
    const navigate = useNavigate();
    const [archivedChats, setArchivedChats] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        loadArchivedChats();
    }, []);

    const loadArchivedChats = () => {
        const archives = [];
        
        // Load all group_session_ items from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('group_session_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    
                    // Extract the session ID to find corresponding summary
                    const sessionId = key.replace('group_session_group_', '');
                    const summaryKey = `group_summary_group_${sessionId}`;
                    
                    console.log('Loading session:', key, 'Looking for summary:', summaryKey);
                    
                    const summaryData = localStorage.getItem(summaryKey);
                    const summary = summaryData ? JSON.parse(summaryData) : null;
                    
                    console.log('Found summary:', summary);
                    
                    archives.push({
                        ...sessionData,
                        summary: summary?.summary || 'No summary generated for this session.',
                        storageKey: key
                    });
                } catch (error) {
                    console.error('Error loading archived chat:', error, key);
                }
            }
        }
        
        console.log('Loaded archives:', archives);
        
        // Sort by endedAt date (newest first)
        archives.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));
        setArchivedChats(archives);
    };

    const deleteArchive = (storageKey, event) => {
        event.stopPropagation();
        
        if (window.confirm('Are you sure you want to delete this archived chat?')) {
            localStorage.removeItem(storageKey);
            const summaryKey = `group_summary_${storageKey.replace('group_session_', '')}`;
            localStorage.removeItem(summaryKey);
            
            setArchivedChats(prev => prev.filter(chat => chat.storageKey !== storageKey));
            setSelectedChat(null);
            toast.success('Archive deleted successfully');
        }
    };

    const filteredChats = archivedChats.filter(chat => 
        chat.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.agents?.some(agent => agent.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                            <ArchiveBoxIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Chat Archive</h1>
                            <p className="text-sm text-slate-600">Review past conversations and insights</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by purpose or participant name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200/80"
                        />
                    </div>
                </div>

                {filteredChats.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white/80 py-20 text-center shadow-sm">
                        <ArchiveBoxIcon className="mx-auto h-16 w-16 text-slate-300" />
                        <h3 className="mt-4 text-xl font-semibold text-slate-700">No archived chats yet</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Ended group chats will appear here with their summaries
                        </p>
                        <button
                            onClick={() => navigate('/group-chat')}
                            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700"
                        >
                            Start a Group Chat
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Chat List */}
                        <div className="lg:col-span-1 space-y-3">
                            {filteredChats.map((chat) => (
                                <div
                                    key={chat.storageKey}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`cursor-pointer rounded-2xl border p-5 transition-all hover:shadow-lg ${
                                        selectedChat?.storageKey === chat.storageKey
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                            : 'border-slate-200 bg-white hover:border-indigo-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                                                {chat.purpose || 'Untitled Discussion'}
                                            </h3>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                <ClockIcon className="h-3.5 w-3.5" />
                                                {formatDate(chat.endedAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => deleteArchive(chat.storageKey, e)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {chat.agents?.slice(0, 3).map((agent, idx) => (
                                            <div
                                                key={idx}
                                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                                            >
                                                <UserGroupIcon className="h-3 w-3" />
                                                {agent.name}
                                            </div>
                                        ))}
                                        {chat.agents?.length > 3 && (
                                            <div className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                                +{chat.agents.length - 3} more
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">
                                            {chat.chatHistory?.length || 0} messages
                                        </span>
                                        <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Detail */}
                        <div className="lg:col-span-2">
                            {selectedChat ? (
                                <div className="rounded-3xl border border-slate-200 bg-white shadow-lg">
                                    {/* Header */}
                                    <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                                            {selectedChat.purpose}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <ClockIcon className="h-4 w-4" />
                                                {formatDate(selectedChat.endedAt)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <UserGroupIcon className="h-4 w-4" />
                                                {selectedChat.agents?.length} participants
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DocumentTextIcon className="h-4 w-4" />
                                                {selectedChat.chatHistory?.length || 0} messages
                                            </div>
                                        </div>
                                    </div>

                                    {/* Participants */}
                                    <div className="border-b border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                                            Participants
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedChat.agents?.map((agent, idx) => (
                                                <div
                                                    key={idx}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {agent.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                                                        <p className="text-xs text-slate-500">{agent.occupation}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                                            <h3 className="text-lg font-bold text-slate-900">
                                                Designer Summary
                                            </h3>
                                        </div>
                                        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-6">
                                            <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
                                                {selectedChat.summary}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Chat Transcript */}
                                    <div className="border-t border-slate-200 p-6">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
                                            Full Transcript
                                        </h3>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {selectedChat.chatHistory?.map((msg, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {msg.type === 'user' ? 'U' : msg.agent?.name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold text-slate-900">
                                                            {msg.type === 'user' ? 'You' : msg.agent?.name}
                                                        </p>
                                                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                                                            {msg.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
                                    <div className="text-center">
                                        <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-300" />
                                        <p className="mt-4 text-sm text-slate-500">
                                            Select a chat to view details and summary
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatArchive;

