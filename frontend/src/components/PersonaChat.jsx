import React, { useState, useEffect, useRef } from 'react';
import { 
    PaperAirplaneIcon,
    UserIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const PersonaChat = ({ agentId, agentName, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [eventSource, setEventSource] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        initializeChat();
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [agentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            // Create a new session
            const response = await api.post('/chat/v3/sessions', {
                agent_id: agentId
            });
            setSessionId(response.data.session_id);
            
            // Set up SSE connection
            const sseUrl = `http://localhost:9001/chat/v3/stream/${response.data.session_id}`;
            const es = new EventSource(sseUrl);
            
            es.onopen = () => {
                console.log('SSE connection opened');
            };
            
            es.addEventListener('typing_start', () => {
                setIsTyping(true);
            });
            
            es.addEventListener('typing_stop', () => {
                setIsTyping(false);
            });
            
            es.addEventListener('message', (event) => {
                const data = JSON.parse(event.data);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    role: data.role,
                    content: data.content,
                    timestamp: new Date().toISOString(),
                    delay_ms: data.delay_ms
                }]);
            });
            
            es.onerror = (error) => {
                console.error('SSE error:', error);
                setIsTyping(false);
            };
            
            setEventSource(es);
            
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || !sessionId) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        try {
            await api.post('/chat/v3/messages', {
                session_id: sessionId,
                user_text: inputValue
            });
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#144835' }}>
                        <span className="text-white font-semibold text-lg">
                            {agentName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agentName}</h3>
                        <p className="text-sm text-gray-500">AI Persona</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Start a conversation with {agentName}</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
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

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message ${agentName}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{ '--tw-ring-color': '#144835' }}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isTyping}
                        className="px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#144835' }}
                        onMouseOver={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0f3a2a')}
                        onMouseOut={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#144835')}
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PersonaChat;
