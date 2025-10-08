import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../design-system';
import api from '../utils/api';

const TestEnhancedChat = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/enhanced-chat/personas');
            setAgents(response.data.personas.slice(0, 3)); // Get first 3 agents for testing
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Sirius v0.2 - Enhanced Chat Testing
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Test the new chat memory, UI feedback, and usability testing features
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {agents.map((agent) => (
                            <Card key={agent.id} className="p-6">
                                <div className="text-center">
                                    <img
                                        src={agent.avatar_url}
                                        alt={agent.demographics?.name || agent.name}
                                        className="w-16 h-16 rounded-full mx-auto mb-4"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {agent.demographics?.name || agent.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {agent.demographics?.role_title || agent.role_title} at {agent.demographics?.company || agent.company}
                                    </p>
                                    <Link to={`/enhanced-chat/${agent.id}`}>
                                        <Button className="w-full">
                                            Test Enhanced Chat
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <Card className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                            New Features to Test
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    🧠 Chat Memory
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Conversations retain context across messages</li>
                                    <li>• Uploaded UI images are remembered</li>
                                    <li>• Agents reference previous conversations</li>
                                    <li>• History persists between sessions</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    🎨 UI Feedback
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Upload UI images for analysis</li>
                                    <li>• Get specific spacing critiques</li>
                                    <li>• Button size and alignment feedback</li>
                                    <li>• Actionable improvement suggestions</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    🧪 Usability Testing
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Run task-based usability tests</li>
                                    <li>• Get step-by-step analysis</li>
                                    <li>• Pain point identification</li>
                                    <li>• Usability ratings and fixes</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    🎯 Enhanced UI
                                </h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Airbnb/Uber style design system</li>
                                    <li>• Mobile-first responsive design</li>
                                    <li>• Accessibility features</li>
                                    <li>• Toast notifications</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                            <h4 className="text-lg font-semibold text-blue-900 mb-2">
                                How to Test:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-blue-800">
                                <li>Click "Test Enhanced Chat" on any agent above</li>
                                <li>Start a conversation with the agent</li>
                                <li>Upload a UI image using the "Upload UI" button</li>
                                <li>Ask "What's bad about this UI?" for detailed feedback</li>
                                <li>Run a usability test using the "Test" button</li>
                                <li>Notice how the agent remembers previous context</li>
                            </ol>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TestEnhancedChat;
