import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LinkIcon,
  EyeIcon,
  CodeBracketIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useChatStore } from '../stores/chatStore';

const FigmaImportModal = ({ isOpen, onClose, onImport, loading }) => {
  const [fileKey, setFileKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [file, setFile] = useState(null);
  const [importMode, setImportMode] = useState('api'); // 'api' or 'upload'
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef(null);
  const { addFigmaData } = useChatStore();

  const validateFileKey = (key) => {
    const errors = {};
    
    if (!key.trim()) {
      errors.fileKey = 'Figma file key is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(key)) {
      errors.fileKey = 'Invalid file key format';
    }

    return errors;
  };

  const validateAccessToken = (token) => {
    const errors = {};
    
    if (!token.trim()) {
      errors.accessToken = 'Figma access token is required';
    } else if (!token.startsWith('figd_')) {
      errors.accessToken = 'Please enter a valid Figma access token (starts with figd_)';
    }

    return errors;
  };

  const validateFile = (file) => {
    const errors = {};
    
    if (!file) {
      errors.file = 'Please select a file';
      return errors;
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      errors.file = 'Only PNG and JPG files are allowed';
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      errors.file = 'File size must be less than 5MB';
    }

    return errors;
  };

  const handleFileKeyChange = (key) => {
    const keyErrors = validateFileKey(key);
    setErrors(prev => ({ ...prev, fileKey: keyErrors.fileKey }));
    setFileKey(key);
  };

  const handleAccessTokenChange = (token) => {
    const tokenErrors = validateAccessToken(token);
    setErrors(prev => ({ ...prev, accessToken: tokenErrors.accessToken }));
    setAccessToken(token);
  };

  const handleFileChange = (selectedFile) => {
    const fileErrors = validateFile(selectedFile);
    setErrors(prev => ({ ...prev, file: fileErrors.file }));
    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFigmaApiImport = async () => {
    try {
      setIsAnalyzing(true);
      const keyErrors = validateFileKey(fileKey);
      const tokenErrors = validateAccessToken(accessToken);
      const allErrors = { ...keyErrors, ...tokenErrors };
      
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        return;
      }

      // Fetch Figma file data
      const response = await api.post('/api/ai/figma-import', {
        fileKey,
        accessToken
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        
        // Add to chat store for future reference
        addFigmaData({
          fileKey,
          name: response.data.name,
          analysis: response.data.analysis,
          timestamp: new Date().toISOString()
        });

        toast.success('Figma design imported and analyzed successfully!');
        onImport(response.data);
      }
    } catch (error) {
      console.error('Figma API import error:', error);
      toast.error(error.response?.data?.error || 'Failed to import Figma design');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      setIsAnalyzing(true);
      const fileErrors = validateFile(file);
      const tokenErrors = validateAccessToken(accessToken);
      const allErrors = { ...fileErrors, ...tokenErrors };
      
      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);
        return;
      }

      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      // Send for vision analysis
      const response = await api.post('/api/ai/vision', {
        image: base64,
        prompt: 'Analyze this UI design and provide actionable feedback on layout, colors, typography, and usability. Focus on specific improvements like spacing, alignment, and design system consistency.'
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
        
        // Add to chat store
        addFigmaData({
          fileKey: 'uploaded-image',
          name: file.name,
          analysis: response.data.analysis,
          timestamp: new Date().toISOString()
        });

        toast.success('Image analyzed successfully!');
        onImport(response.data);
      }
    } catch (error) {
      console.error('File upload analysis error:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (importMode === 'api') {
      handleFigmaApiImport();
    } else {
      handleFileUpload();
    }
  };

  const resetForm = () => {
    setFileKey('');
    setAccessToken('');
    setFile(null);
    setAnalysis(null);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <CloudArrowUpIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Import Figma Design
                    </h3>
                    <p className="text-sm text-gray-500">
                      Import from Figma API or upload image for AI analysis
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Import Mode Toggle */}
                <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setImportMode('api')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      importMode === 'api'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Figma API
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('upload')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
                      importMode === 'upload'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <PhotoIcon className="w-4 h-4 mr-2" />
                    Upload Image
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {importMode === 'api' ? (
                    <>
                      {/* Figma File Key */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Figma File Key *
                        </label>
                        <input
                          type="text"
                          value={fileKey}
                          onChange={(e) => handleFileKeyChange(e.target.value)}
                          placeholder="e.g., abc123def456..."
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                            errors.fileKey
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                        {errors.fileKey && (
                          <div className="flex items-center mt-1 text-sm text-red-600">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            {errors.fileKey}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Find this in your Figma file URL: figma.com/file/[FILE_KEY]
                        </p>
                      </div>

                      {/* Access Token */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Figma Access Token *
                        </label>
                        <input
                          type="password"
                          value={accessToken}
                          onChange={(e) => handleAccessTokenChange(e.target.value)}
                          placeholder="figd_..."
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                            errors.accessToken
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                        {errors.accessToken && (
                          <div className="flex items-center mt-1 text-sm text-red-600">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            {errors.accessToken}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Get your token from Figma → Settings → Account → Personal Access Tokens
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* File Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Design Image *
                        </label>
                        <div
                          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                            dragActive
                              ? 'border-purple-400 bg-purple-50'
                              : errors.file
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          
                          {file ? (
                            <div className="space-y-2">
                              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Drop your design here
                                </p>
                                <p className="text-xs text-gray-500">
                                  or click to browse
                                </p>
                              </div>
                              <p className="text-xs text-gray-400">
                                PNG, JPG up to 5MB
                              </p>
                            </div>
                          )}
                        </div>
                        {errors.file && (
                          <div className="flex items-center mt-2 text-sm text-red-600">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            {errors.file}
                          </div>
                        )}
                      </div>

                      {/* OpenAI API Key for Vision */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OpenAI API Key *
                        </label>
                        <input
                          type="password"
                          value={accessToken}
                          onChange={(e) => handleAccessTokenChange(e.target.value)}
                          placeholder="sk-..."
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                            errors.accessToken
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 focus:border-purple-500'
                          }`}
                        />
                        {errors.accessToken && (
                          <div className="flex items-center mt-1 text-sm text-red-600">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            {errors.accessToken}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Required for GPT-4o vision analysis
                        </p>
                      </div>
                    </>
                  )}

                  {/* Analysis Results */}
                  {analysis && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">AI Analysis Results</h4>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        {analysis.suggestions?.map((suggestion, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || isAnalyzing}
                      className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading || isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isAnalyzing ? 'Analyzing...' : 'Importing...'}
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                          {importMode === 'api' ? 'Import from Figma' : 'Analyze Image'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FigmaImportModal;

