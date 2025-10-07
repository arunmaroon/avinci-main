import React, { useState } from 'react';
import api from '../utils/api';

const EnhancedAgentCreator = ({ onAgentCreated, onClose }) => {
  const [transcript, setTranscript] = useState('');
  const [file, setFile] = useState(null);
  const [demographics, setDemographics] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    location: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text' or 'file'

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setUploadMethod('file');
    }
  };

  const handleCreateAgent = async () => {
    if (uploadMethod === 'text' && !transcript.trim()) {
      alert('Please provide transcript text');
      return;
    }
    if (uploadMethod === 'file' && !file) {
      alert('Please select a file');
      return;
    }

    setIsCreating(true);
    try {
      let response;
      
      if (uploadMethod === 'file') {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', file);
        
        if (file.type === 'application/pdf') {
          response = await api.post('/agents/v5/pdf-upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // For other file types, we'll need to add support
          alert('File type not supported yet. Please use PDF or paste text directly.');
          setIsCreating(false);
          return;
        }
      } else {
        // Handle text input
        response = await api.post('/agents/v5', {
          transcript: {
            raw_text: transcript,
            file_name: 'manual_transcript.txt'
          },
          demographics: demographics
        });
      }
      
      console.log('Agent created:', response.data);
      if (onAgentCreated) {
        onAgentCreated(response.data.agent || response.data.agents[0]);
      }
      
      // Reset form
      setTranscript('');
      setFile(null);
      setDemographics({ name: '', age: '', gender: '', occupation: '', location: '' });
      setUploadMethod('text');
      
      // Close modal after successful creation
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Create Agent from Transcript</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Upload Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="text"
                checked={uploadMethod === 'text'}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="mr-2"
              />
              Paste Text
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={(e) => setUploadMethod(e.target.value)}
                className="mr-2"
              />
              Upload File
            </label>
          </div>
        </div>

        {/* Text Input */}
        {uploadMethod === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcript Text
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Paste your transcript here..."
            />
          </div>
        )}

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Transcript File
            </label>
            <input
              type="file"
              accept=".pdf,.txt,.csv,.xlsx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, TXT, CSV, XLSX
            </p>
            {file && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {file.name}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={demographics.name}
              onChange={(e) => setDemographics({...demographics, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={demographics.age}
              onChange={(e) => setDemographics({...demographics, age: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={demographics.gender}
              onChange={(e) => setDemographics({...demographics, gender: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupation
            </label>
            <input
              type="text"
              value={demographics.occupation}
              onChange={(e) => setDemographics({...demographics, occupation: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Software Engineer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={demographics.location}
            onChange={(e) => setDemographics({...demographics, location: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="San Francisco, CA"
          />
        </div>

        <button
          onClick={handleCreateAgent}
          disabled={isCreating}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating Agent...' : 'Create Agent from Transcript'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedAgentCreator;
