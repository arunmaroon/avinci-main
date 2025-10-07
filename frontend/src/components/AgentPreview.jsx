import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatPanel from './ChatPanel';
import { useAgentChat } from '../hooks/useAgentChat';
import useAgentStore from '../stores/agentStore';

const AgentPreview = ({ onClose }) => {
  const [selectedAgents, setSelectedAgents] = useState({
    left: null,
    right: null
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState({
    left: false,
    right: false
  });
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);

  const { agents, loading: agentsLoading } = useAgentStore();
  const { 
    sendMessage, 
    conversations, 
    clearConversation,
    isGenerating 
  } = useAgentChat();

  const handleAgentSelect = (side: 'left' | 'right', agentId: string) => {
    setSelectedAgents(prev => ({
      ...prev,
      [side]: agentId
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachedImage) return;

    const message = {
      text: inputValue,
      image: attachedImage,
      timestamp: new Date().toISOString()
    };

    // Send to both agents if selected
    const promises = [];
    
    if (selectedAgents.left) {
      promises.push(sendMessage(selectedAgents.left, message, 'left'));
    }
    
    if (selectedAgents.right) {
      promises.push(sendMessage(selectedAgents.right, message, 'right'));
    }

    // Simulate typing indicators
    if (selectedAgents.left) {
      setIsTyping(prev => ({ ...prev, left: true }));
    }
    if (selectedAgents.right) {
      setIsTyping(prev => ({ ...prev, right: true }));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending messages:', error);
    } finally {
      // Clear typing indicators after a delay
      setTimeout(() => {
        setIsTyping({ left: false, right: false });
      }, 2000);
    }

    setInputValue('');
    setAttachedImage(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAttachedImage(file);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const leftAgent = selectedAgents.left ? agents.find(a => a.id === selectedAgents.left) : null;
  const rightAgent = selectedAgents.right ? agents.find(a => a.id === selectedAgents.right) : null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-gray-900">Agent Preview</h2>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => clearConversation()}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
            >
              Clear
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Compact Agent Selection */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Left Agent</label>
            <select
              value={selectedAgents.left || ''}
              onChange={(e) => handleAgentSelect('left', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Select agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Right Agent</label>
            <select
              value={selectedAgents.right || ''}
              onChange={(e) => handleAgentSelect('right', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Select agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compact Chat Panels */}
      <div className="flex-1 flex flex-col space-y-2 p-2">
        {/* Left Chat Panel */}
        <div className="flex-1 min-h-0">
          <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
            <ChatPanel
              agent={leftAgent}
              conversation={conversations.left || []}
              isTyping={isTyping.left}
              isGenerating={isGenerating.left}
              side="left"
              compact={true}
            />
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="flex-1 min-h-0">
          <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
            <ChatPanel
              agent={rightAgent}
              conversation={conversations.right || []}
              isTyping={isTyping.right}
              isGenerating={isGenerating.right}
              side="right"
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Compact Shared Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end space-x-2">
          {/* Image Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            title="Upload image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="flex items-center space-x-2 bg-gray-50 rounded-md p-2">
              <img
                src={URL.createObjectURL(attachedImage)}
                alt="Attached"
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-sm text-gray-600">{attachedImage.name}</span>
              <button
                onClick={() => setAttachedImage(null)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Compact Text Input */}
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type message..."
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              rows={2}
            />
          </div>

          {/* Compact Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !attachedImage) || isGenerating.left || isGenerating.right}
            className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating.left || isGenerating.right ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentPreview;
