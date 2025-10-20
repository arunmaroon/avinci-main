import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  PhoneIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
  CameraIcon,
  VideoCameraSlashIcon,
  PhoneXMarkIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  FaceSmileIcon,
  PaperClipIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { PhoneIcon as PhoneSolid, VideoCameraIcon as VideoSolid } from '@heroicons/react/24/solid';
import api from '../utils/api';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const UnifiedChatCallInterface = () => {
  // State management
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    occupation: '',
    location: '',
    techLevel: '',
    englishLevel: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const callTimerRef = useRef(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isInCall) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        setCallDuration(0);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isInCall]);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents/v4?view=short');
      setAgents(Array.isArray(response.data) ? response.data : (response.data.agents || []));
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to load agents');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) {
        return prev.filter(a => a.id !== agent.id);
      } else {
        return [...prev, agent];
      }
    });
  };

  const startCall = (type) => {
    if (selectedAgents.length === 0) {
      toast.error('Please select at least one agent to start a call');
      return;
    }

    setCallType(type);
    setIsInCall(true);
    setCallParticipants(selectedAgents);
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    
    toast.success(`${type === 'audio' ? 'Audio' : 'Video'} call started with ${selectedAgents.length} agent(s)`);
  };

  const endCall = () => {
    setIsInCall(false);
    setCallType(null);
    setCallParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
    
    toast.success('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Unmuted' : 'Muted');
  };

  const toggleVideo = () => {
    if (callType === 'audio') return;
    setIsVideoOff(!isVideoOff);
    toast.success(isVideoOff ? 'Video on' : 'Video off');
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && !attachedImage) return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'You',
      timestamp: new Date().toLocaleTimeString(),
      avatar: 'https://ui-avatars.com/api/?name=You&background=3b82f6&color=fff',
      attachments: attachedImage ? [attachedImage] : []
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setAttachedImage(null);

    // Simulate agent responses
    if (selectedAgents.length > 0) {
      setIsTyping(true);
      setTimeout(() => {
        const randomAgent = selectedAgents[Math.floor(Math.random() * selectedAgents.length)];
        const agentMessage = {
          id: Date.now() + 1,
          text: `This is a response from ${randomAgent.name}. I understand your message about "${inputValue}".`,
          sender: randomAgent.name,
          timestamp: new Date().toLocaleTimeString(),
          avatar: getAvatarSrc(randomAgent.avatar_url, randomAgent.name),
          attachments: []
        };
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedImage({
          id: Date.now(),
          type: file.type.startsWith('image') ? 'image' : 'file',
          name: file.name,
          url: e.target.result,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !searchTerm || 
      agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOccupation = !selectedFilters.occupation || 
      agent.occupation?.toLowerCase().includes(selectedFilters.occupation.toLowerCase());

    const matchesLocation = !selectedFilters.location || 
      agent.location?.toLowerCase().includes(selectedFilters.location.toLowerCase());

    const matchesTechLevel = !selectedFilters.techLevel || 
      agent.tech_savviness?.toLowerCase().includes(selectedFilters.techLevel.toLowerCase());

    const matchesEnglishLevel = !selectedFilters.englishLevel || 
      agent.english_savvy?.toLowerCase().includes(selectedFilters.englishLevel.toLowerCase());

    return matchesSearch && matchesOccupation && matchesLocation && matchesTechLevel && matchesEnglishLevel;
  });

  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTechLevelColor = (level) => {
    const normalized = (level || '').toLowerCase();
    if (['high', 'advanced', 'expert'].includes(normalized)) return 'text-emerald-800 border-emerald-200';
    if (['medium', 'intermediate'].includes(normalized)) return 'text-blue-800 border-blue-200';
    if (['basic', 'low', 'beginner', 'elementary'].includes(normalized)) return 'text-amber-800 border-amber-200';
    return 'text-gray-800 border-gray-200';
  };

  const getEnglishLevelColor = (level) => {
    const normalized = (level || '').toLowerCase();
    if (['advanced', 'expert', 'fluent'].includes(normalized)) return 'text-emerald-800 border-emerald-200';
    if (['intermediate', 'medium'].includes(normalized)) return 'text-blue-800 border-blue-200';
    if (['basic', 'elementary', 'beginner'].includes(normalized)) return 'text-amber-800 border-amber-200';
    return 'text-gray-800 border-gray-200';
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Agent Selection */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Agents</h1>
            <button
              onClick={() => setShowAgentSelector(!showAgentSelector)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-300 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 inline mr-1" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedFilters.occupation}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Occupations</option>
                    {[...new Set(agents.map(a => a.occupation).filter(Boolean))].map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                  <select
                    value={selectedFilters.location}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Locations</option>
                    {[...new Set(agents.map(a => a.location).filter(Boolean))].map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Agents */}
        {selectedAgents.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Agents ({selectedAgents.length})</h3>
            <div className="space-y-2">
              {selectedAgents.map(agent => (
                <div key={agent.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={getAvatarSrc(agent.avatar_url, agent.name)}
                    alt={agent.name}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => handleAvatarError(e, agent.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{agent.name}</p>
                    <p className="text-xs text-gray-500 truncate">{agent.occupation}</p>
                  </div>
                  <button
                    onClick={() => handleAgentSelect(agent)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredAgents.map(agent => {
              const isSelected = selectedAgents.find(a => a.id === agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarSrc(agent.avatar_url, agent.name)}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => handleAvatarError(e, agent.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{agent.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{agent.occupation}</p>
                      {agent.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{agent.location}</span>
                        </div>
                      )}
                      <div className="flex gap-1 mt-1">
                        {agent.tech_savviness && (
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTechLevelColor(agent.tech_savviness)}`}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                          >
                            Tech: {agent.tech_savviness}
                          </span>
                        )}
                        {agent.english_savvy && (
                          <span 
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getEnglishLevelColor(agent.english_savvy)}`}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                          >
                            Eng: {agent.english_savvy}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isInCall ? `${callType === 'audio' ? 'Audio' : 'Video'} Call` : 'Chat & Call Interface'}
              </h2>
              {isInCall && (
                <p className="text-sm text-gray-500">
                  {callParticipants.length} participant(s) • {formatCallDuration(callDuration)}
                </p>
              )}
            </div>
            
            {/* Call Controls */}
            <div className="flex items-center gap-3">
              {!isInCall ? (
                <>
                  <button
                    onClick={() => startCall('audio')}
                    disabled={selectedAgents.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    Audio Call
                  </button>
                  <button
                    onClick={() => startCall('video')}
                    disabled={selectedAgents.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                    Video Call
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-colors ${
                      isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                  </button>
                  {callType === 'video' && (
                    <button
                      onClick={toggleVideo}
                      className={`p-3 rounded-full transition-colors ${
                        isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isVideoOff ? <VideoCameraSlashIcon className="w-5 h-5" /> : <VideoCameraIcon className="w-5 h-5" />}
                    </button>
                  )}
                  <button
                    onClick={endCall}
                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <PhoneXMarkIcon className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-500">Select agents and start chatting or calling</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div key={message.id} className="flex items-start gap-3">
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="max-w-md bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <p className="text-sm text-gray-900">{message.text}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        {message.attachments.map(attachment => (
                          <div key={attachment.id} className="mt-2">
                            {attachment.type === 'image' ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="max-w-xs rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                                <PaperClipIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{attachment.name}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 mt-1 block">{message.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
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
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <PhotoIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() && !attachedImage}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            {attachedImage && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={attachedImage.url}
                  alt={attachedImage.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="text-sm text-gray-600">{attachedImage.name}</span>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedChatCallInterface;
