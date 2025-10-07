import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from './design-system';
import api from '../utils/api';

const TranscriptUpload = ({ onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      const formData = new FormData();
      formData.append('transcript', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.post('/transcript-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadResults(response.data);
      onUploadComplete && onUploadComplete(response.data);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadResults({
        message: 'Upload failed',
        successful: 0,
        failed: 1,
        errors: [{ error: error.response?.data?.error || 'Upload failed' }]
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Upload Transcript Documents
          </h2>
          <p className="text-gray-600 mb-6">
            Upload CSV, Excel, or text files containing transcript data to create multiple personas automatically.
          </p>

          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? 'Processing...' : 'Drop files here or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel (.xlsx), and text files
                </p>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.txt,.json"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Choose File
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Upload Results */}
      {uploadResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Results
            </h3>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResults.successful}
                </div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResults.failed}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResults.successful + uploadResults.failed}
                </div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
            </div>

            {/* Success Results */}
            {uploadResults.results && uploadResults.results.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Created Personas:</h4>
                <div className="space-y-2">
                  {uploadResults.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <span className="font-medium text-green-800">{result.name}</span>
                        <span className="text-sm text-green-600 ml-2">(ID: {result.agentId})</span>
                      </div>
                      <span className="text-sm text-green-600">✓ Success</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Results */}
            {uploadResults.errors && uploadResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Errors:</h4>
                <div className="space-y-2">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <span className="font-medium text-red-800">{error.name}</span>
                        <span className="text-sm text-red-600 ml-2">({error.error})</span>
                      </div>
                      <span className="text-sm text-red-600">✗ Failed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Sample File Download */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sample File Format
        </h3>
        <p className="text-gray-600 mb-4">
          Download this sample CSV file to see the expected format for transcript uploads:
        </p>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/sample_transcripts.csv';
              link.download = 'sample_transcripts.csv';
              link.click();
            }}
          >
            Download Sample CSV
          </Button>
          <div className="text-sm text-gray-500">
            <p>Required columns: name, transcript</p>
            <p>Optional columns: age, gender, role, company, location</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TranscriptUpload;
