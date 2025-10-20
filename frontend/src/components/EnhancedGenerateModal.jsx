/**
 * Enhanced Generate User Modal
 * Supports: File upload (TXT, PDF), Google Docs URLs, and pasted text
 * With Airbnb-style UI and live progress tracking
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  XMarkIcon, 
  DocumentTextIcon,
  LinkIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const EnhancedGenerateModal = ({ isOpen, onClose, onSuccess }) => {
  const [uploadMethod, setUploadMethod] = useState('paste'); // 'paste', 'file', 'url'
  const [transcriptText, setTranscriptText] = useState('');
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [progressMessages, setProgressMessages] = useState([]);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    // Validate file types
    const validFiles = acceptedFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['txt', 'pdf'].includes(ext);
    });

    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Only TXT and PDF files are supported');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addProgressMessage = (message, type = 'info') => {
    setProgressMessages(prev => [...prev, { message, type, timestamp: Date.now() }]);
  };

  const validateInputs = () => {
    switch (uploadMethod) {
      case 'paste':
        if (!transcriptText.trim()) {
          toast.error('Please enter transcript text');
          return false;
        }
        if (transcriptText.length < 10) {
          toast.error('Transcript is too short');
          return false;
        }
        if (transcriptText.length > 100000) {
          toast.error('Transcript is too long (max 100,000 characters)');
          return false;
        }
        break;
      
      case 'file':
        if (uploadedFiles.length === 0) {
          toast.error('Please upload at least one file');
          return false;
        }
        break;
      
      case 'url':
        if (!googleDocsUrl.trim()) {
          toast.error('Please enter a Google Docs URL');
          return false;
        }
        if (!googleDocsUrl.includes('docs.google.com')) {
          toast.error('Please enter a valid Google Docs URL');
          return false;
        }
        break;
      
      default:
        return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;

    setIsGenerating(true);
    setGenerationStatus({ step: 'starting', message: 'Starting persona generation...' });
    setProgressMessages([]);
    addProgressMessage('Initializing...', 'info');

    try {
      const formData = new FormData();

      // Prepare request based on upload method
      switch (uploadMethod) {
        case 'paste':
          formData.append('text', transcriptText);
          addProgressMessage('Processing pasted transcript...', 'info');
          break;
        
        case 'file':
          uploadedFiles.forEach((file, index) => {
            formData.append('files', file);
            addProgressMessage(`Adding file: ${file.name}`, 'info');
          });
          break;
        
        case 'url':
          formData.append('urls', googleDocsUrl);
          addProgressMessage('Fetching Google Docs...', 'info');
          break;
      }

      // Send to backend
      addProgressMessage('Sending to AI processing service...', 'info');
      setGenerationStatus({ step: 'processing', message: 'Extracting persona details...' });

      const response = await axios.post('/api/transcript-map/map', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutes
      });

      if (response.data.success) {
        const count = response.data.count || 0;
        addProgressMessage(`✅ Successfully generated ${count} persona(s)!`, 'success');
        setGenerationStatus({ step: 'done', message: `Generated ${count} persona(s)` });
        
        toast.success(`Successfully generated ${count} persona(s)!`, {
          duration: 4000,
          icon: '🎉'
        });

        // Clear form
        setTranscriptText('');
        setGoogleDocsUrl('');
        setUploadedFiles([]);
        
        // Notify parent and close
        if (onSuccess) {
          onSuccess(response.data.personas);
        }

        setTimeout(() => {
          onClose();
        }, 1500);
      }

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error.response?.data?.details || error.message || 'Failed to generate personas';
      addProgressMessage(`❌ Error: ${errorMessage}`, 'error');
      setGenerationStatus({ step: 'error', message: errorMessage });
      
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setTranscriptText('');
      setGoogleDocsUrl('');
      setUploadedFiles([]);
      setGenerationStatus(null);
      setProgressMessages([]);
      onClose();
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
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Generate AI Users</h2>
                <p className="text-sm text-gray-500">From transcripts, files, or Google Docs</p>
              </div>
            </div>
            {!isGenerating && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Upload Method Tabs */}
            <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setUploadMethod('paste')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  uploadMethod === 'paste'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Paste transcript"
              >
                <DocumentTextIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Paste Text</span>
              </button>
              <button
                onClick={() => setUploadMethod('file')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  uploadMethod === 'file'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Upload files"
              >
                <CloudArrowUpIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Files</span>
              </button>
              <button
                onClick={() => setUploadMethod('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  uploadMethod === 'url'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Google Docs URL"
              >
                <LinkIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Google Docs</span>
              </button>
            </div>

            {/* Content based on upload method */}
            <div className="mb-6">
              {uploadMethod === 'paste' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Paste Transcript
                  </label>
                  <textarea
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    placeholder="Moderator: Tell me about yourself?&#10;Respondent: I am Abdul, 24 years old, from Bangalore..."
                    className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 font-mono text-sm"
                    disabled={isGenerating}
                    aria-label="Transcript text area"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {transcriptText.length.toLocaleString()} / 100,000 characters
                  </p>
                </div>
              )}

              {uploadMethod === 'file' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Files (TXT, PDF)
                  </label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse (TXT, PDF up to 10MB)
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          {!isGenerating && (
                            <button
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              aria-label={`Remove ${file.name}`}
                            >
                              <XMarkIcon className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {uploadMethod === 'url' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Google Docs URL
                  </label>
                  <input
                    type="url"
                    value={googleDocsUrl}
                    onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    disabled={isGenerating}
                    aria-label="Google Docs URL input"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    💡 Make sure the document is publicly accessible or shared with view access
                  </p>
                </div>
              )}
            </div>

            {/* Progress Messages */}
            {progressMessages.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl max-h-40 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
                <div className="space-y-1">
                  {progressMessages.map((msg, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      {msg.type === 'error' ? (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : msg.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                      )}
                      <p className="text-xs text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white transition-all ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
              aria-label="Generate personas"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>Generate AI Users</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedGenerateModal;

