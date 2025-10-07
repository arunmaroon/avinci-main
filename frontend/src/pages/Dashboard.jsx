import React from 'react';
import { 
    ChartBarIcon, 
    CogIcon, 
    DocumentTextIcon,
    PresentationChartLineIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const features = [
        {
            icon: ChartBarIcon,
            title: 'Analytics Dashboard',
            description: 'Comprehensive insights into agent performance and user interactions'
        },
        {
            icon: CogIcon,
            title: 'System Configuration',
            description: 'Advanced settings and customization options for your AI agents'
        },
        {
            icon: DocumentTextIcon,
            title: 'Report Generation',
            description: 'Automated reports and documentation for your agent interactions'
        },
        {
            icon: PresentationChartLineIcon,
            title: 'Performance Metrics',
            description: 'Real-time monitoring and optimization of agent behaviors'
        },
        {
            icon: UserGroupIcon,
            title: 'Team Management',
            description: 'Collaborative features for managing multiple agent teams'
        },
        {
            icon: ChatBubbleLeftRightIcon,
            title: 'Advanced Chat',
            description: 'Enhanced conversation management and multi-agent coordination'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#144835' }}>
                        <ChartBarIcon className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Dashboard
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Advanced analytics and management tools for your AI agent ecosystem
                    </p>
                </div>

                {/* Coming Soon Badge */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-full text-lg shadow-lg" style={{ backgroundColor: '#144835' }}>
                        <span className="animate-pulse mr-2">🚀</span>
                        Coming Soon
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div 
                            key={index}
                            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: '#14483520' }}>
                                    <feature.icon className="w-6 h-6" style={{ color: '#144835' }} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {feature.title}
                                </h3>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                            <PlusCircleIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Generate Agents
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Create new AI agents from transcripts or documents
                            </p>
                            <button className="text-white px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#144835' }} onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}>
                                Get Started
                            </button>
                        </div>
                        
                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                            <UserGroupIcon className="w-12 h-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Agent Library
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Browse and manage your generated agents
                            </p>
                            <button className="text-white px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#144835' }} onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}>
                                View Library
                            </button>
                        </div>
                        
                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                            <ChatBubbleLeftRightIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Chat Interface
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Start conversations with your AI agents
                            </p>
                            <button className="text-white px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: '#144835' }} onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'} onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}>
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-16">
                    <p className="text-gray-500 text-sm">
                        Dashboard features are currently in development. 
                        <span className="font-medium" style={{ color: '#144835' }}> Stay tuned for updates!</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;