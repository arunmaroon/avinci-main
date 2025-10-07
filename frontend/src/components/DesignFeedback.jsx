import React, { useState, useEffect } from 'react';
import { 
    CloudArrowUpIcon, 
    EyeIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

const DesignFeedback = () => {
    const [artifacts, setArtifacts] = useState([]);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunningFeedback, setIsRunningFeedback] = useState(false);
    const [agents, setAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [taskContext, setTaskContext] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [uploadData, setUploadData] = useState({
        name: '',
        description: '',
        image: null
    });

    useEffect(() => {
        fetchArtifacts();
        fetchAgents();
    }, []);

    const fetchArtifacts = async () => {
        try {
            const response = await api.get('/design-feedback/artifacts');
            setArtifacts(response.data.artifacts);
        } catch (error) {
            console.error('Failed to fetch artifacts:', error);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await api.get('/agents/v3');
            setAgents(response.data.agents);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadData.image) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', uploadData.image);
            formData.append('type', 'image');
            formData.append('name', uploadData.name);
            formData.append('description', uploadData.description);

            const response = await api.post('/design-feedback/artifacts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setArtifacts(prev => [response.data.artifact, ...prev]);
            setShowUpload(false);
            setUploadData({ name: '', description: '', image: null });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const runFeedback = async () => {
        if (!selectedArtifact || selectedAgents.length === 0) return;

        setIsRunningFeedback(true);
        try {
            const response = await api.post('/design-feedback/run', {
                artifact_id: selectedArtifact.id,
                agent_ids: selectedAgents,
                task_context: {
                    description: taskContext,
                    timestamp: new Date().toISOString()
                }
            });

            setFeedback(response.data.feedback);
        } catch (error) {
            console.error('Feedback failed:', error);
        } finally {
            setIsRunningFeedback(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Feedback</h1>
                <p className="text-gray-600">
                    Upload design artifacts and get multi-agent feedback using transcript-grounded personas
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Design Artifacts</h2>
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showUpload ? 'Cancel' : 'Upload Design'}
                    </button>
                </div>

                {showUpload && (
                    <form onSubmit={handleUploadSubmit} className="mb-6 p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Design Name
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.name}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter design name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Design Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Uploading...' : 'Upload Design'}
                        </button>
                    </form>
                )}

                {/* Artifacts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artifacts.map(artifact => (
                        <div
                            key={artifact.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                selectedArtifact?.id === artifact.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedArtifact(artifact)}
                        >
                            <div className="flex items-center mb-2">
                                <PhotoIcon className="w-5 h-5 text-gray-400 mr-2" />
                                <h3 className="font-medium text-gray-900 truncate">{artifact.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{artifact.description}</p>
                            <div className="text-xs text-gray-500">
                                {new Date(artifact.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Section */}
            {selectedArtifact && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Run Multi-Agent Feedback</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Agent Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Agents ({selectedAgents.length} selected)
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                                {agents.map(agent => (
                                    <label key={agent.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedAgents.includes(agent.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAgents(prev => [...prev, agent.id]);
                                                } else {
                                                    setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">{agent.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Task Context */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Task Context (Optional)
                            </label>
                            <textarea
                                value={taskContext}
                                onChange={(e) => setTaskContext(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Describe what you want the agents to focus on..."
                            />
                        </div>
                    </div>

                    <button
                        onClick={runFeedback}
                        disabled={selectedAgents.length === 0 || isRunningFeedback}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunningFeedback ? 'Running Feedback...' : 'Run Multi-Agent Feedback'}
                    </button>
                </div>
            )}

            {/* Feedback Results */}
            {feedback && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedback Results</h2>
                    
                    {/* Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                        <p className="text-gray-700">{feedback.summary}</p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{feedback.statistics?.totalAgents || 0}</div>
                            <div className="text-sm text-blue-600">Agents</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{feedback.critical_issues?.length || 0}</div>
                            <div className="text-sm text-red-600">Critical Issues</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{feedback.disagreements?.length || 0}</div>
                            <div className="text-sm text-yellow-600">Disagreements</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{feedback.consensus?.length || 0}</div>
                            <div className="text-sm text-green-600">Consensus</div>
                        </div>
                    </div>

                    {/* Critical Issues */}
                    {feedback.critical_issues?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                                Critical Issues
                            </h3>
                            <div className="space-y-3">
                                {feedback.critical_issues.map((issue, index) => (
                                    <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50">
                                        <div className="font-medium text-red-900 mb-2">{issue.issue}</div>
                                        <div className="text-sm text-red-700 mb-2">{issue.evidence}</div>
                                        <div className="text-xs text-red-600">
                                            Agents: {issue.agents?.map(a => a.agent_name).join(', ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disagreements */}
                    {feedback.disagreements?.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-500 mr-2" />
                                Areas of Disagreement
                            </h3>
                            <div className="space-y-3">
                                {feedback.disagreements.map((disagreement, index) => (
                                    <div key={index} className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                                        <div className="font-medium text-yellow-900 mb-2">{disagreement.issue}</div>
                                        <div className="text-sm text-yellow-700">
                                            Disagreement Level: {Math.round(disagreement.disagreementLevel * 100)}%
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {disagreement.conflictingViews?.map((view, viewIndex) => (
                                                <div key={viewIndex} className="text-xs text-yellow-600">
                                                    {view.agent_name}: {view.severity} - {view.fix}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Consensus */}
                    {feedback.consensus?.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                Consensus Points
                            </h3>
                            <div className="space-y-3">
                                {feedback.consensus.map((consensus, index) => (
                                    <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
                                        <div className="font-medium text-green-900 mb-2">{consensus.issue}</div>
                                        <div className="text-sm text-green-700 mb-2">{consensus.evidence}</div>
                                        <div className="text-xs text-green-600">
                                            Consensus: {Math.round(consensus.consensus * 100)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DesignFeedback;
