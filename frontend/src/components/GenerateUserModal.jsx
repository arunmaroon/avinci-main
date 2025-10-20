import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  XMarkIcon, 
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const GenerateUserModal = ({ isOpen, onClose, onGenerateFromPaste }) => {
  const [transcriptText, setTranscriptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);

  // Socket.IO connection
  useEffect(() => {
    if (isOpen) {
      const newSocket = io('http://localhost:9001');
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen]);

  // Listen for generation status updates
  useEffect(() => {
    if (socket && requestId) {
      const eventName = `persona-generation:${requestId}`;
      
      socket.on(eventName, (data) => {
        console.log('📡 Received generation status:', data);
        setGenerationStatus(data);
        
        if (data.step === 'done' || data.step === 'error') {
          setIsGenerating(false);
          if (data.step === 'done') {
            setTimeout(() => {
              setGenerationStatus(null);
              setRequestId(null);
            }, 2000);
          }
        }
      });

      return () => {
        socket.off(eventName);
      };
    }
  }, [socket, requestId]);

  const handlePasteGenerate = async () => {
    if (!transcriptText.trim()) {
      alert('Please enter transcript text');
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationStatus({ step: 'starting', message: 'Initializing generation...' });
      
      // Generate unique request ID for tracking
      const newRequestId = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setRequestId(newRequestId);
      
      // Pass the text and requestId to the parent handler
      await onGenerateFromPaste(transcriptText, newRequestId);
      
      // Clear the text and close after successful generation
      setTranscriptText('');
      onClose();
    } catch (error) {
      console.error('Error generating from paste:', error);
      setGenerationStatus({ step: 'error', message: error.message || 'Error generating users from transcript' });
      alert('Error generating users from transcript');
    } finally {
      setIsGenerating(false);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Generate AI Users</h3>
                  <p className="text-sm text-gray-600">Create realistic user personas from transcripts</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>


          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Live Status Display */}
            {generationStatus && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {generationStatus.step === 'error' ? (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  ) : generationStatus.step === 'done' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {generationStatus.message}
                    </p>
                    {generationStatus.data && (
                      <p className="text-xs text-gray-600 mt-1">
                        {generationStatus.data.agentId && `Agent ID: ${generationStatus.data.agentId}`}
                        {generationStatus.data.imageUrl && ` • Image fetched`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Paste Transcript Text</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Copy and paste your user research transcript using the Moderator/Respondent format below
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript Content
                  </label>
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Paste your transcript here... 

Example format:
Moderator: Hi, thanks for joining us today. Can you tell us about your role?
Respondent: Hi! I'm Sarah, a product manager at TechCorp in Mumbai...
Moderator: What are your main pain points with current tools?
Respondent: The biggest issue is that our tools don't integrate well..."
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>{transcriptText.length} characters</span>
                    <span>Minimum 100 characters recommended</span>
                  </div>
                </div>

                {/* Sample Transcript Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTranscriptText(`User Research Interview - Product Manager

Moderator: Hi, thanks for joining us today. Can you tell us about your role?

Respondent: Hi! I'm Sarah Chen, a product manager at TechCorp in Mumbai. I've been here for about 3 years and I'm 32 years old. I work primarily on our mobile app and web platform.

Moderator: What are your main pain points with current tools?

Respondent: Well, the biggest issue is that our current project management tools don't integrate well with our design tools. We're constantly switching between different platforms, and it's really inefficient. Also, the reporting features are quite basic - I need more detailed analytics to make data-driven decisions.

Moderator: How do you currently handle user feedback?

Respondent: We use a combination of in-app surveys, user interviews, and analytics tools. But it's scattered across different platforms, and it's hard to get a unified view of what users really want.

Moderator: What would your ideal solution look like?

Respondent: Something that brings everything together - project management, design collaboration, user feedback, and analytics all in one place. And it needs to be mobile-friendly since I'm often on the go.`)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Load Sample Transcript</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Paste transcript text to generate AI users with 50+ persona fields
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasteGenerate}
                  disabled={!transcriptText.trim() || isGenerating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Generate Users</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GenerateUserModal;
