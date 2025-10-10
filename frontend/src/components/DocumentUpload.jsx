import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const DocumentUpload = ({ onGenerateAgents }) => {
  const [numberOfAgents, setNumberOfAgents] = useState(5);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const supportedTypes = {
    pdf: { icon: '📄', color: 'text-red-500' },
    doc: { icon: '📝', color: 'text-blue-500' },
    docx: { icon: '📝', color: 'text-blue-500' },
    txt: { icon: '📄', color: 'text-gray-500' },
    rtf: { icon: '📄', color: 'text-gray-500' },
    odt: { icon: '📄', color: 'text-orange-500' },
    xls: { icon: '📊', color: 'text-green-500' },
    xlsx: { icon: '📊', color: 'text-green-500' },
    ppt: { icon: '📊', color: 'text-orange-500' },
    pptx: { icon: '📊', color: 'text-orange-500' },
    csv: { icon: '📊', color: 'text-green-500' },
    json: { icon: '🔧', color: 'text-yellow-500' },
    xml: { icon: '🔧', color: 'text-yellow-500' },
    md: { icon: '📝', color: 'text-gray-500' },
    html: { icon: '🌐', color: 'text-orange-500' },
    htm: { icon: '🌐', color: 'text-orange-500' },
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return supportedTypes[extension] || { icon: '📄', color: 'text-gray-500' };
  };

  const validateFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!supportedTypes[extension]) {
      return { valid: false, error: `Unsupported file type: .${extension}` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    return { valid: true };
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Upload at least one document before generating agents.');
      return;
    }

    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('transcript', file);

        const response = await api.post('/transcript-upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
      });

      const results = await Promise.all(uploadPromises);
      toast.success('Transcript uploaded successfully! Generating agents…');

      if (onGenerateAgents) {
        onGenerateAgents({
          numberOfAgents,
          files: uploadedFiles,
          uploadResults: results,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error.response?.data?.error || 'Error uploading files. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
      {/* Upload Area */}
      <div>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload').click()}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500">PDF, DOCX, TXT, CSV and more (Max 10MB each)</p>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.csv,.json,.xml,.md,.html,.htm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready</h4>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => {
                const fileInfo = getFileIcon(file.name);
                return (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className={`text-xl ${fileInfo.color}`}>{fileInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Number of Agents */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Number of Agents to Generate: <span className="text-blue-600">{numberOfAgents}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={numberOfAgents}
          onChange={(e) => setNumberOfAgents(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={uploadedFiles.length === 0}
        className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>Generate {numberOfAgents} AI Agent{numberOfAgents > 1 ? 's' : ''}</span>
      </button>
    </div>
  );
};

export default DocumentUpload;
