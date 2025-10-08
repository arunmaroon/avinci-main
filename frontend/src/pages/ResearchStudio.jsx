import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DocumentTextIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    SparklesIcon,
    PlusIcon,
    ArrowUpTrayIcon,
    PlayIcon,
    ChartBarIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { PlusIcon as PlusSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ResearchStudio = () => {
    const [activeTab, setActiveTab] = useState('transcripts');
    const [transcripts, setTranscripts] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showUsabilityTest, setShowUsabilityTest] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enhanced-agent/agents');
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Error fetching enhanced agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTranscriptUpload = async (transcriptText, demographics) => {
        try {
            setLoading(true);
            const response = await api.post('/enhanced-agent/generate', {
                transcript: transcriptText,
                demographics: demographics
            });

            if (response.data.success) {
                await fetchAgents();
                setShowUploadModal(false);
                // Show success message
            }
        } catch (error) {
            console.error('Error creating agent from transcript:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUsabilityTest = async (agentId, uiPath, task) => {
        try {
            setLoading(true);
            const response = await api.post('/enhanced-agent/usability', {
                agentId: agentId,
                uiPath: uiPath,
                task: task,
                uiType: 'image'
            });

            return response.data.results;
        } catch (error) {
            console.error('Error running usability test:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                // Handle file content based on type
                if (file.type === 'application/pdf') {
                    // Handle PDF
                    console.log('PDF uploaded:', file.name);
                } else if (file.type.startsWith('image/')) {
                    // Handle image
                    console.log('Image uploaded:', file.name);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const TranscriptUploadModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Upload Research Transcript</h2>
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                        >
                            <CommandLineIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Transcript Text
                            </label>
                            <textarea
                                placeholder="Paste your research transcript here. Focus on R: (Respondent) responses for better persona extraction..."
                                className="w-full h-64 px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Participant Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Abdul Yasser"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g., 28"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Occupation
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Self-employed, Business Owner"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-6 py-3 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleTranscriptUpload('Sample transcript', {})}
                            className="px-6 py-3 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 bg-gradient-primary"
                            >
                                Generate Agent
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    const UsabilityTestModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Usability Testing</h2>
                        <button
                            onClick={() => setShowUsabilityTest(false)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                        >
                            <CommandLineIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Test Configuration</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select Agent
                                    </label>
                                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
                                        {agents.map(agent => (
                                            <option key={agent.id} value={agent.id}>
                                                {agent.name} - {agent.persona?.occupation}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Upload UI Design
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileUpload}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Test Task
                                    </label>
                                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-300 focus:ring-2 focus:ring-primary-100">
                                        <option value="loan_application">Apply for a Personal Loan</option>
                                        <option value="check_balance">Check Account Balance</option>
                                        <option value="setup_upi">Set up UPI Payment</option>
                                        <option value="investment">Make an Investment</option>
                                    </select>
                                </div>

                                <button
                                    onClick={() => handleUsabilityTest('agent-id', 'ui-path', 'loan_application')}
                                className="w-full px-6 py-3 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 bg-gradient-primary"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    <span>Run Usability Test</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Test Results</h3>
                            <div className="bg-slate-50 rounded-xl p-6">
                                <p className="text-slate-600 text-center">
                                    Upload a UI design and select an agent to run usability testing
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    const AgentCard = ({ agent }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            className="card-interactive p-6"
        >
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-primary">
                    {agent.name?.charAt(0) || 'A'}
                </div>
                
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{agent.name}</h3>
                    <p className="text-slate-600 text-sm mb-2">{agent.persona?.occupation}</p>
                    <p className="text-slate-500 text-xs mb-3">{agent.persona?.age} years old • {agent.persona?.location}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {agent.persona?.personality?.slice(0, 3).map((trait, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)', color: '#144835' }}
                            >
                                {trait}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-200 hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}
                        >
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1 inline" />
                            Chat
                        </button>
                        
                        <button
                            onClick={() => setSelectedAgent(agent)}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
                        >
                            <EyeIcon className="w-4 h-4 mr-1 inline" />
                            View
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="glass border-b border-white/20 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Research Studio</h1>
                            <p className="text-slate-600">Create AI agents from user research and test your designs</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowUsabilityTest(true)}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <PlayIcon className="w-5 h-5" />
                                <span>Usability Test</span>
                            </button>
                            
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="btn-primary flex items-center space-x-2"
                            >
                                <PlusSolidIcon className="w-5 h-5" />
                                <span>Upload Transcript</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex space-x-1 mb-8 bg-slate-100 rounded-xl p-1 w-fit">
                    {[
                        { id: 'transcripts', label: 'Transcripts', icon: DocumentTextIcon },
                        { id: 'agents', label: 'Generated Agents', icon: UserGroupIcon },
                        { id: 'testing', label: 'Usability Testing', icon: EyeIcon },
                        { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                                activeTab === tab.id
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'agents' && (
                    <div>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="large" message="Loading agents..." variant="logo" />
                            </div>
                        ) : agents.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}>
                                    <UserGroupIcon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Agents Generated Yet</h3>
                                <p className="text-slate-600 mb-6">Upload research transcripts to create AI agents that mimic real users</p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="btn-primary flex items-center space-x-2 mx-auto"
                                >
                                    <PlusSolidIcon className="w-5 h-5" />
                                    <span>Upload Your First Transcript</span>
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {agents.map((agent) => (
                                    <AgentCard key={agent.id} agent={agent} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'transcripts' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}>
                            <DocumentTextIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Transcript Management</h3>
                        <p className="text-slate-600 mb-6">Upload and manage your research transcripts</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary flex items-center space-x-2 mx-auto"
                        >
                            <ArrowUpTrayIcon className="w-5 h-5" />
                            <span>Upload Transcript</span>
                        </button>
                    </div>
                )}

                {activeTab === 'testing' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}>
                            <EyeIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Usability Testing</h3>
                        <p className="text-slate-600 mb-6">Test your UI designs with AI agents that mimic real users</p>
                        <button
                            onClick={() => setShowUsabilityTest(true)}
                            className="btn-primary flex items-center space-x-2 mx-auto"
                        >
                            <PlayIcon className="w-5 h-5" />
                            <span>Start Usability Test</span>
                        </button>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}>
                            <ChartBarIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Analytics Dashboard</h3>
                        <p className="text-slate-600 mb-6">View insights from your research and testing</p>
                        <div className="text-sm text-slate-500">Coming soon...</div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showUploadModal && <TranscriptUploadModal />}
                {showUsabilityTest && <UsabilityTestModal />}
            </AnimatePresence>
        </div>
    );
};

export default ResearchStudio;
