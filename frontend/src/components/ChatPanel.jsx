import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPanel = ({ 
  agent, 
  conversation, 
  isTyping, 
  isGenerating,
  side,
  compact = false
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isTyping]);

  const getAgentColor = () => {
    if (!agent) return 'bg-gray-100';
    return side === 'left' ? 'bg-blue-50' : 'bg-green-50';
  };

  const getAgentBorderColor = () => {
    if (!agent) return 'border-gray-200';
    return side === 'left' ? 'border-blue-200' : 'border-green-200';
  };

  const getMessageColor = (isUser: boolean) => {
    if (isUser) return 'bg-blue-600 text-white';
    return side === 'left' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900';
  };

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className={`${compact ? 'w-8 h-8' : 'w-16 h-16'} bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2`}>
            <svg className={`${compact ? 'w-4 h-4' : 'w-8 h-8'} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium text-gray-900 mb-1`}>No Agent</h3>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>Select agent</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Agent Header */}
      <div className={`${compact ? 'p-2' : 'p-4'} border-b ${getAgentBorderColor()} ${getAgentColor()}`}>
        <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
          <div className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} rounded-full flex items-center justify-center ${
            side === 'left' ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            <span className={`text-white font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>{agent.name}</h3>
            <p className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>{agent.role_title || 'AI Persona'}</p>
            {!compact && (
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  side === 'left' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'
                }`}>
                  {agent.tech_savviness || 'medium'}
                </span>
                <span className="text-xs text-gray-500">
                  {agent.communication_style?.sentence_length || 'medium'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              isGenerating ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className="text-xs text-gray-500">
              {isGenerating ? 'Generating...' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto ${compact ? 'p-2 space-y-2' : 'p-4 space-y-4'}`}>
        <AnimatePresence>
          {conversation.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`${compact ? 'max-w-xs px-2 py-1' : 'max-w-xs lg:max-w-md px-4 py-2'} rounded-lg ${
                getMessageColor(message.isUser)
              }`}>
                {message.image && !compact && (
                  <div className="mb-2">
                    <img
                      src={message.image}
                      alt="Attached"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
                <p className={`${compact ? 'text-xs' : 'text-sm'} whitespace-pre-wrap`}>{message.text}</p>
                {!compact && (
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start"
          >
            <div className={`${compact ? 'px-2 py-1' : 'px-4 py-2'} rounded-lg ${getMessageColor(false)}`}>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className={`${compact ? 'w-1 h-1' : 'w-2 h-2'} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                  <div className={`${compact ? 'w-1 h-1' : 'w-2 h-2'} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                  <div className={`${compact ? 'w-1 h-1' : 'w-2 h-2'} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                </div>
                {!compact && <span className="text-xs ml-2">Agent is typing...</span>}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Agent Traits Display */}
      {!compact && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Tech:</span> {agent.tech_savviness || 'medium'}
              </div>
              <div>
                <span className="font-medium">Domain:</span> {agent.domain_literacy?.level || 'medium'}
              </div>
              <div>
                <span className="font-medium">Communication:</span> {agent.communication_style?.sentence_length || 'medium'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {agent.status || 'active'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
