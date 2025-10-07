import React, { useState } from 'react';
import api from '../utils/api';

const EnhancedAgentCreator = ({ onAgentCreated }) => {
  const [transcript, setTranscript] = useState('');
  const [demographics, setDemographics] = useState({
    name: '',
    age: '',
    gender: '',
    occupation: '',
    location: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    if (!transcript.trim() || !demographics.name.trim()) {
      alert('Please provide transcript and agent name');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/agents/v3/from-transcript', {
        transcript,
        demographics
      });
      
      console.log('Agent created:', response.data);
      if (onAgentCreated) {
        onAgentCreated(response.data.agent);
      }
      
      // Reset form
      setTranscript('');
      setDemographics({ name: '', age: '', gender: '', occupation: '', location: '' });
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Create Agent from Transcript</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transcript
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your user research transcript here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
          />
        </div>

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
