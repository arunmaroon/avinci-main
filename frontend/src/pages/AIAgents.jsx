import React, { useState } from 'react';
import { 
    DocumentArrowUpIcon, 
    Cog6ToothIcon,
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import DocumentUpload from '../components/DocumentUpload';
import GenerationStatus from '../components/GenerationStatus';

const AIAgents = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [showGenerationStatus, setShowGenerationStatus] = useState(false);
  const [generationData, setGenerationData] = useState(null);

  const tabs = [
    { 
      id: 'upload', 
      label: 'Generate via Upload', 
      icon: DocumentArrowUpIcon,
      description: 'Upload transcripts to automatically generate rich AI personas'
    },
    { 
      id: 'config', 
      label: 'Generate via Config', 
      icon: Cog6ToothIcon,
      description: 'Manually configure persona details and generate agents'
    }
  ];

  const handleGenerateAgents = (data = null) => {
    if (data) {
      setGenerationData(data);
    }
    setShowGenerationStatus(true);
  };

  const handleGenerationComplete = () => {
    setShowGenerationStatus(false);
    setGenerationData(null);
  };

  return (
    <div className="space-y-6">
      {/* Generation Status Modal */}
      <GenerationStatus
        isVisible={showGenerationStatus}
        onComplete={handleGenerationComplete}
        onClose={() => setShowGenerationStatus(false)}
        generationType="documents"
        documents={generationData?.files}
        config={generationData}
      />

      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate AI Agents</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create realistic AI personas for user research and testing. Choose your preferred method below.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-3 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-500 font-normal">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Transcripts</h2>
                <p className="text-gray-600">
                  Upload interview transcripts, user research documents, or any text files. 
                  Our AI will analyze the content and create rich, realistic personas.
                </p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <DocumentUpload onGenerateAgents={handleGenerateAgents} />
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Automatic Analysis</h3>
                  <p className="text-sm text-gray-600">AI extracts personality traits, behaviors, and demographics</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Rich Personas</h3>
                  <p className="text-sm text-gray-600">Creates detailed personas with cultural backgrounds and motivations</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Ready to Chat</h3>
                  <p className="text-sm text-gray-600">Generated agents are immediately available for conversations</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Manual Configuration</h2>
                <p className="text-gray-600">
                  Manually configure persona details, demographics, and personality traits 
                  to create custom AI agents for your specific needs.
                </p>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-12">
                  <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Builder</h3>
                  <p className="text-gray-600 mb-6">
                    Manual configuration interface will be available in the next update.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                    Try Upload Instead
                  </button>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Demographics Builder</h3>
                  <p className="text-sm text-gray-600">Set age, location, occupation, and cultural background</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Personality Traits</h3>
                  <p className="text-sm text-gray-600">Configure communication style, decision-making patterns, and behaviors</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Goals & Pain Points</h3>
                  <p className="text-sm text-gray-600">Define objectives, challenges, and emotional triggers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Custom Scenarios</h3>
                  <p className="text-sm text-gray-600">Create specific use cases and interaction patterns</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAgents;