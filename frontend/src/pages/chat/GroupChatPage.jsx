/**
 * Group Chat Page - Messenger Style UI
 * Clean, modern messenger interface with three-column layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
    MagnifyingGlassIcon,
    PlusIcon,
    EllipsisVerticalIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    FaceSmileIcon,
    PaperClipIcon,
    CheckIcon,
    InboxIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    ArchiveBoxIcon,
    TrashIcon,
    XMarkIcon,
    UserGroupIcon,
    PhoneIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';
import { PhoneIcon as PhoneSolid } from '@heroicons/react/24/solid';
import api from '../../utils/api';
import EnhancedNewChatModal from '../../components/EnhancedNewChatModal';

const GroupChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [allAgents, setAllAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isInCall, setIsInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [callType, setCallType] = useState(null); // 'audio' or 'video'
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const callIntervalRef = useRef(null);

    useEffect(() => {
        loadConversations();
        loadAgents();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const loadConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadAgents = async () => {
        try {
            const response = await api.get('/agents/v5');
            setAllAgents(response.data || []);
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    };

    const handleFileUpload = async (file, type) => {
        const fileId = Date.now();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const currentProgress = prev[fileId] || 0;
                    if (currentProgress >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return { ...prev, [fileId]: currentProgress + 10 };
                });
            }, 200);

            // Upload file
            const response = await api.post('/ai/upload-ui', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(progressInterval);
            setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

            // Add attachment
            const attachment = {
                id: fileId,
                type: type,
                name: file.name,
                size: file.size,
                url: response.data.ui_path || URL.createObjectURL(file),
                preview: type.startsWith('image') ? URL.createObjectURL(file) : null
            };

            setAttachments(prev => [...prev, attachment]);
            toast.success('Attachment uploaded successfully');

            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[fileId];
                    return newProgress;
                });
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
            setUploadProgress(prev => {
                const newProgress = { ...prev };
                delete newProgress[fileId];
                return newProgress;
            });
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size should be less than 10MB');
                return;
            }
            handleFileUpload(file, 'image');
        }
    };

    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                toast.error('Video size should be less than 50MB');
                return;
            }
            handleFileUpload(file, 'video');
        }
    };

    const handleLinkAttachment = (type) => {
        const linkUrl = prompt(`Enter ${type} URL:`);
        if (linkUrl && linkUrl.trim()) {
            const attachment = {
                id: Date.now(),
                type: type,
                url: linkUrl.trim(),
                name: linkUrl.trim(),
                icon: type === 'figma' ? '🎨' : '🌐'
            };
            setAttachments(prev => [...prev, attachment]);
            toast.success(`${type} link added`);
        }
    };

    const removeAttachment = (id) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    const startCall = (type) => {
        if (!selectedConversation) {
            toast.error('Please select a conversation first');
            return;
        }

        setIsInCall(true);
        setCallType(type);
        setCallDuration(0);
        
        // Start call timer
        callIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);

        // Add system message
        const systemMessage = {
            id: Date.now(),
            text: `${type === 'audio' ? '📞' : '📹'} ${type === 'audio' ? 'Audio' : 'Video'} call started with ${selectedConversation.name}`,
            sender: 'System',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);

        toast.success(`${type === 'audio' ? 'Audio' : 'Video'} call started`);

        // Initialize audio call API
        initializeCall(selectedConversation.id, type);
    };

    const endCall = () => {
        if (callIntervalRef.current) {
            clearInterval(callIntervalRef.current);
        }

        const duration = formatCallDuration(callDuration);
        
        // Add system message
        const systemMessage = {
            id: Date.now(),
            text: `${callType === 'audio' ? '📞' : '📹'} Call ended. Duration: ${duration}`,
            sender: 'System',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        };
        setMessages(prev => [...prev, systemMessage]);

        setIsInCall(false);
        setCallDuration(0);
        setCallType(null);
        setIsMuted(false);

        toast.success('Call ended');
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        toast.success(isMuted ? 'Unmuted' : 'Muted');
    };

    const formatCallDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeCall = async (conversationId, type) => {
        try {
            // Call the audio API endpoint
            const response = await api.post('/voice/start-call', {
                conversationId: conversationId,
                callType: type,
                agentIds: selectedConversation.members?.map(m => m.id) || [conversationId]
            });

            console.log('Call initialized:', response.data);
        } catch (error) {
            console.error('Failed to initialize call:', error);
            // Don't show error to user as we have fallback
        }
    };

    const sendMessage = async () => {
        if ((!message.trim() && attachments.length === 0) || !selectedConversation) return;

        const userMessage = {
            id: Date.now(),
            text: message,
            sender: 'You',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isUser: true,
            attachments: [...attachments]
        };

        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setAttachments([]);
        setLoading(true);

        try {
            // Call API with attachments
            const response = await api.post('/ai/generate', {
                agentId: selectedConversation.id,
                query: message,
                attachments: attachments,
                chat_history: messages
            });

            const aiResponse = {
                id: Date.now() + 1,
                text: response.data.response || "I've analyzed your attachments and message. Here's my feedback based on my expertise.",
                sender: selectedConversation.name,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                isUser: false,
                avatar: selectedConversation.avatar
            };
            setMessages(prev => [...prev, aiResponse]);
            setLoading(false);
        } catch (error) {
            console.error('Send error:', error);
            toast.error('Failed to send message');
            setLoading(false);
        }
    };

    const createNewChat = () => {
        if (selectedAgents.length === 0) return;

        const newConversation = {
            id: Date.now(),
            name: selectedAgents.length === 1 ? selectedAgents[0].name : `${selectedAgents[0].name} + ${selectedAgents.length - 1} more`,
            lastMessage: 'Start a conversation',
            timestamp: 'Just now',
            unread: 0,
            avatar: selectedAgents[0].avatar_url,
            members: selectedAgents,
            isGroup: selectedAgents.length > 1
        };

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setMessages([]);
        setShowNewChat(false);
        setSelectedAgents([]);
    };

    // Mock conversations data
    const mockConversations = [
        {
            id: 1,
            name: 'Marketing department',
            lastMessage: 'Keep everyone aligned with a platform they will enjoy using...',
            timestamp: '20m',
            unread: 2,
            avatar: 'https://ui-avatars.com/api/?name=Marketing&background=144835&color=fff',
            isGroup: true,
            members: 11,
            isPinned: true
        },
        {
            id: 2,
            name: 'Managing department',
            lastMessage: 'There are many ways to manage a single project.',
            timestamp: '20m',
            unread: 0,
            avatar: 'https://ui-avatars.com/api/?name=Managing&background=374151&color=fff',
            isGroup: true,
            members: 8
        },
        {
            id: 3,
            name: 'Visualization',
            lastMessage: 'Set project timeline, milestones and dependencies...',
            timestamp: '20m',
            unread: 0,
            avatar: 'https://ui-avatars.com/api/?name=Viz&background=DE5E2B&color=fff',
            isGroup: true,
            members: 5
        },
        {
            id: 4,
            name: 'Good mood',
            lastMessage: 'Shape your workflow the way that works for your team...',
            timestamp: '1h 30m',
            unread: 0,
            avatar: 'https://ui-avatars.com/api/?name=Good&background=9769B2&color=fff',
            isGroup: true,
            members: 12
        }
    ];

    const allConversations = conversations.length > 0 ? conversations : mockConversations;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Sidebar - Navigation */}
            <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 flex flex-col items-center space-y-4">
                    <button className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors">
                        <InboxIcon className="w-6 h-6 text-green-600" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
                    </button>
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ClockIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <ArchiveBoxIcon className="w-6 h-6 text-gray-400" />
                    </button>
                    <button className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <TrashIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">AM</span>
                    </button>
                </div>
            </div>

            {/* Middle Section - Conversations List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Messenger</h1>
                        <button 
                            onClick={() => setShowNewChat(true)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {/* Pinned Section */}
                    <div className="px-4 py-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pinned</h3>
                        {allConversations.filter(conv => conv.isPinned).map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedConversation?.id === conv.id}
                                onClick={() => {
                                    setSelectedConversation(conv);
                                    setMessages([]);
                                }}
                            />
                        ))}
                    </div>

                    {/* All Conversations */}
                    <div className="px-4 py-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">All</h3>
                        {allConversations.filter(conv => !conv.isPinned).map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedConversation?.id === conv.id}
                                onClick={() => {
                                    setSelectedConversation(conv);
                                    setMessages([]);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Contacts Section */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Contacts</h3>
                        <button className="p-1 rounded hover:bg-gray-100">
                            <PlusIcon className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Section - Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {selectedConversation.isGroup ? (
                                        <>
                                            <img
                                                src={selectedConversation.avatar}
                                                alt="Group"
                                                className="w-10 h-10 rounded-full border-2 border-white"
                                            />
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                                                <span className="text-xs text-gray-600">+{selectedConversation.members - 1}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={selectedConversation.avatar}
                                            alt={selectedConversation.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">{selectedConversation.name}</h2>
                                    <p className="text-xs text-gray-500">
                                        {isInCall ? (
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                {callType === 'audio' ? 'Audio call' : 'Video call'} - {formatCallDuration(callDuration)}
                                            </span>
                                        ) : (
                                            <span>{selectedConversation.isGroup ? `${selectedConversation.members} members` : 'Online'}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Audio Call Button */}
                                <button 
                                    onClick={() => startCall('audio')}
                                    disabled={isInCall}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isInCall 
                                            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                                            : 'hover:bg-green-50 hover:text-green-600'
                                    }`}
                                    title="Start audio call"
                                >
                                    <PhoneIcon className="w-5 h-5" />
                                </button>

                                {/* Video Call Button */}
                                <button 
                                    onClick={() => startCall('video')}
                                    disabled={isInCall}
                                    className={`p-2 rounded-lg transition-colors ${
                                        isInCall 
                                            ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                                            : 'hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                    title="Start video call"
                                >
                                    <VideoCameraIcon className="w-5 h-5" />
                                </button>

                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <UserGroupIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button className="p-2 rounded-lg hover:bg-gray-100">
                                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Active Call Banner */}
                        {isInCall && (
                            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                        {callType === 'audio' ? (
                                            <PhoneSolid className="w-5 h-5 text-white" />
                                        ) : (
                                            <VideoCameraIcon className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">
                                            {callType === 'audio' ? 'Audio Call' : 'Video Call'} in Progress
                                        </p>
                                        <p className="text-white text-sm opacity-90">
                                            {formatCallDuration(callDuration)} • {selectedConversation.isGroup ? `${selectedConversation.members} participants` : '1 participant'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Mute Button */}
                                    <button
                                        onClick={toggleMute}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            isMuted
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                                        }`}
                                    >
                                        {isMuted ? '🔇 Unmute' : '🎤 Mute'}
                                    </button>

                                    {/* End Call Button */}
                                    <button
                                        onClick={endCall}
                                        className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                    >
                                        End Call
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Start a conversation with {selectedConversation.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Send a message to begin your chat
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Date Divider */}
                                    <div className="flex items-center justify-center">
                                        <div className="bg-gray-100 px-4 py-1 rounded-full">
                                            <span className="text-xs font-medium text-gray-600">10 June, 2022</span>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    {messages.map((msg) => (
                                        <MessageBubble key={msg.id} message={msg} />
                                    ))}
                                    {loading && (
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={selectedConversation.avatar}
                                                alt="AI"
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 px-6 py-4">
                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id} className="relative group">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                                {attachment.preview ? (
                                                    <img src={attachment.preview} alt="Preview" className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    <span className="text-2xl">{attachment.icon || '📎'}</span>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                                                        {attachment.name}
                                                    </span>
                                                    {attachment.size && (
                                                        <span className="text-xs text-gray-500">
                                                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeAttachment(attachment.id)}
                                                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                                                >
                                                    <XMarkIcon className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                            {uploadProgress[attachment.id] !== undefined && uploadProgress[attachment.id] < 100 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary-500 transition-all duration-300"
                                                        style={{ width: `${uploadProgress[attachment.id]}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="flex items-end gap-3">
                                {/* Hidden file inputs */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    className="hidden"
                                />

                                {/* Attachment Button with Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <PaperClipIcon className="w-6 h-6 text-gray-400" />
                                    </button>

                                    {showAttachmentMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10">
                                            <button
                                                onClick={() => {
                                                    fileInputRef.current.click();
                                                    setShowAttachmentMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <PhotoIcon className="w-5 h-5 text-blue-500" />
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">Upload Image</div>
                                                    <div className="text-xs text-gray-500">PNG, JPG up to 10MB</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    videoInputRef.current.click();
                                                    setShowAttachmentMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">Upload Video</div>
                                                    <div className="text-xs text-gray-500">MP4, MOV up to 50MB</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleLinkAttachment('figma');
                                                    setShowAttachmentMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-xl">🎨</span>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">Figma Link</div>
                                                    <div className="text-xs text-gray-500">Share design file</div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleLinkAttachment('website');
                                                    setShowAttachmentMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-xl">🌐</span>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">Website Link</div>
                                                    <div className="text-xs text-gray-500">Share URL for review</div>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <FaceSmileIcon className="w-6 h-6 text-gray-400" />
                                </button>

                                <div className="flex-1">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type something..."
                                        rows={1}
                                        className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={(!message.trim() && attachments.length === 0) || loading}
                                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                            <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Modal */}
            {showNewChat && (
                <EnhancedNewChatModal
                    agents={allAgents}
                    selectedAgents={selectedAgents}
                    onSelect={setSelectedAgents}
                    onClose={() => setShowNewChat(false)}
                    onCreate={createNewChat}
                />
            )}
        </div>
    );
};

// Conversation Item Component
const ConversationItem = ({ conversation, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors mb-1 ${
                isSelected ? 'bg-primary-50 hover:bg-primary-50' : ''
            }`}
        >
            <div className="relative flex-shrink-0">
                <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full"
                />
                {conversation.unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-[10px] font-bold text-white">{conversation.unread}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{conversation.timestamp}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
            </div>
        </button>
    );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-2 space-y-2">
                {attachments.map((attachment) => (
                    <div key={attachment.id}>
                        {attachment.type === 'image' && attachment.preview && (
                            <img
                                src={attachment.preview}
                                alt={attachment.name}
                                className="max-w-xs rounded-lg border border-gray-200"
                            />
                        )}
                        {attachment.type === 'video' && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                                <span className="text-xs">{attachment.name}</span>
                            </div>
                        )}
                        {(attachment.type === 'figma' || attachment.type === 'website') && (
                            <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                            >
                                <span className="text-lg">{attachment.icon}</span>
                                <span className="text-xs truncate max-w-xs">{attachment.url}</span>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    if (message.isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-md bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                    {message.text && <p className="text-sm">{message.text}</p>}
                    {renderAttachments(message.attachments)}
                    <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-300">{message.timestamp}</span>
                        <CheckIcon className="w-3 h-3 text-green-400" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="max-w-md bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                {message.text && <p className="text-sm text-gray-900">{message.text}</p>}
                {renderAttachments(message.attachments)}
                <span className="text-xs text-gray-500 mt-1 block">{message.timestamp}</span>
            </div>
        </div>
    );
};

// New Chat Modal Component
const NewChatModal = ({ agents, selectedAgents, onSelect, onClose, onCreate }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">New Conversation</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                    {agents.map((agent) => (
                        <button
                            key={agent.id}
                            onClick={() => {
                                if (selectedAgents.find(a => a.id === agent.id)) {
                                    onSelect(selectedAgents.filter(a => a.id !== agent.id));
                                } else {
                                    onSelect([...selectedAgents, agent]);
                                }
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${
                                selectedAgents.find(a => a.id === agent.id) ? 'bg-primary-50' : ''
                            }`}
                        >
                            <img
                                src={agent.avatar_url || `https://ui-avatars.com/api/?name=${agent.name}`}
                                alt={agent.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 text-left">
                                <h3 className="font-medium">{agent.name}</h3>
                                <p className="text-sm text-gray-500">{agent.occupation}</p>
                            </div>
                            {selectedAgents.find(a => a.id === agent.id) && (
                                <CheckIcon className="w-5 h-5 text-primary-600" />
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onCreate}
                    disabled={selectedAgents.length === 0}
                    className="w-full px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Start Chat ({selectedAgents.length})
                </button>
            </div>
        </div>
    );
};

export default GroupChatPage;
