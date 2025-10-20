import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentArrowUpIcon, 
  ClipboardDocumentIcon,
  XMarkIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../utils/api';

const EnhancedTranscriptUpload = ({ onSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [transcriptText, setTranscriptText] = useState('');
  const [googleDocsUrls, setGoogleDocsUrls] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [generatedAgents, setGeneratedAgents] = useState([]);

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'ready'
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Google Docs URL validation
  const validateGoogleDocsUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('docs.google.com') || 
             urlObj.hostname.includes('drive.google.com');
    } catch {
      return false;
    }
  };

  const addGoogleDocsUrl = () => {
    const urls = googleDocsUrls.split('\n').filter(url => url.trim());
    const validUrls = urls.filter(validateGoogleDocsUrl);
    const invalidUrls = urls.filter(url => !validateGoogleDocsUrl(url));
    
    if (invalidUrls.length > 0) {
      toast.error(`Invalid Google Docs URLs: ${invalidUrls.join(', ')}`);
      return;
    }
    
    if (validUrls.length > 0) {
      toast.success(`${validUrls.length} Google Docs URL(s) added`);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      
      // Add uploaded files
      uploadedFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Add Google Docs URLs
      if (googleDocsUrls.trim()) {
        const urls = googleDocsUrls.split('\n').filter(url => url.trim());
        formData.append('urls', JSON.stringify(urls));
      }
      
      // Add pasted text
      if (transcriptText.trim()) {
        formData.append('text', transcriptText.trim());
      }
      
      // Add context
      formData.append('context', JSON.stringify({
        source: 'enhanced_transcript_upload',
        timestamp: new Date().toISOString(),
        user_id: 'current_user'
      }));

      const response = await api.post('/transcript/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes
      });

      if (response.data.success) {
        setGeneratedAgents(response.data.data.agents);
        toast.success(`Successfully generated ${response.data.data.total_personas} AI personas!`);
        
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      } else {
        throw new Error(response.data.error || 'Generation failed');
      }

    } catch (error) {
      console.error('Error generating personas:', error);
      toast.error(`Generation failed: ${error.message}`);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit = uploadedFiles.length > 0 || googleDocsUrls.trim() || transcriptText.trim();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Generate AI Personas</h2>
        <p className="text-gray-600">Upload transcripts, paste text, or link Google Docs to create realistic AI personas</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DocumentArrowUpIcon className="w-5 h-5" />
          <span className="font-medium">Upload Files</span>
        </button>
        <button
          onClick={() => setActiveTab('paste')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'paste'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ClipboardDocumentIcon className="w-5 h-5" />
          <span className="font-medium">Paste Text</span>
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
            activeTab === 'google'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <DocumentArrowUpIcon className="w-5 h-5" />
          <span className="font-medium">Google Docs</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <DocumentArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-gray-600 mb-4">
                or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports TXT, PDF, DOC, DOCX, CSV, JSON (max 10MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Uploaded Files</h3>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transcript Text
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your transcript here...

Example:
Interviewer: Hi Abdul, thanks for joining us today. Can you tell us about yourself?
Abdul: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore. I work as a day trader..."
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
                onClick={() => setTranscriptText(`Interview with Abdul Yasser - Trader

Interviewer: Hi Abdul, thanks for joining us today. Can you tell us about yourself?

Abdul: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore. I work as a day trader, mostly dealing with stocks and crypto.

Interviewer: What financial apps do you use?

Abdul: I use PhonePe for payments, Zerodha for trading, and I have accounts with HDFC and ICICI banks. I also use Slice Pay sometimes, but the hidden charges are a big problem.

Interviewer: What are your main pain points with current financial tools?

Abdul: The biggest issue is hidden charges. You think you're getting a good deal, but then there are all these fees. Also, the UI is often confusing - too many buttons and options. I prefer simple, clean interfaces.

Interviewer: What motivates you in your work?

Abdul: I want to be financially independent by 30. My family has always struggled with money, so I'm determined to break that cycle. I also enjoy the challenge of trading - it's like a puzzle every day.`)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span>Load Sample Transcript</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Google Docs Tab */}
        {activeTab === 'google' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Docs URLs
              </label>
              <textarea
                value={googleDocsUrls}
                onChange={(e) => setGoogleDocsUrls(e.target.value)}
                placeholder="Paste Google Docs URLs here (one per line)...

Example:
https://docs.google.com/document/d/1VQFr1wzY7rZU7Ph_LoAacr1ECPyQelT9-qRk8a_L66Q/edit
https://docs.google.com/document/d/1ABC123def456GHI789jkl/edit"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {googleDocsUrls.split('\n').filter(url => url.trim()).length} URL(s)
                </span>
                <button
                  onClick={addGoogleDocsUrl}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Validate URLs
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generated Agents Preview */}
        {generatedAgents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Generated AI Personas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedAgents.map((agent, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {agent.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                      <p className="text-sm text-gray-600">{agent.occupation}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{agent.location}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {agent.age} years old
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {agent.gender}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-center pt-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isUploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-8 py-3 font-semibold transition-colors flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Personas...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                <span>Generate AI Personas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTranscriptUpload;
