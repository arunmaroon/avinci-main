import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ChartBarIcon, 
    ChatBubbleLeftRightIcon, 
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    SparklesIcon,
    PlusCircleIcon,
    DocumentTextIcon,
    EyeIcon,
    PlayIcon
} from '@heroicons/react/24/outline';
import { PlusIcon as PlusSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

const UberDashboard = () => {
    const [stats, setStats] = useState({
        totalAgents: 0,
        activeChats: 0,
        designTests: 0,
        avgResponseTime: 0
    });
    const [recentAgents, setRecentAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [agentsResponse, analyticsResponse] = await Promise.all([
                api.get('/agent/generate'),
                api.get('/analytics/insights')
            ]);
            
            setRecentAgents(agentsResponse.data.agents?.slice(0, 4) || []);
            setStats({
                totalAgents: agentsResponse.data.agents?.length || 0,
                activeChats: 24,
                designTests: 156,
                avgResponseTime: 2.3
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="card p-6 hover:shadow-lg transition-all duration-200"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                    color === 'primary' ? 'bg-primary' : 
                    color === 'accent' ? 'bg-accent' : 
                    color === 'blue' ? 'bg-blue' : 'bg-yellow'
                }`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm ${
                        trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                        <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-1">{value}</h3>
                <p className="text-neutral-600 text-sm">{title}</p>
            </div>
        </motion.div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, href, color = 'primary' }) => (
        <motion.a
            href={href}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="card p-6 hover:shadow-lg transition-all duration-200 block"
        >
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                    color === 'primary' ? 'bg-primary' : 
                    color === 'accent' ? 'bg-accent' : 
                    color === 'blue' ? 'bg-blue' : 'bg-yellow'
                }`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
                    <p className="text-sm text-neutral-600">{description}</p>
                </div>
                <ArrowTrendingUpIcon className="w-5 h-5 text-neutral-400" />
            </div>
        </motion.a>
    );

    const AgentCard = ({ agent }) => (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="card p-4 hover:shadow-lg transition-all duration-200"
        >
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                        {agent.name?.charAt(0) || 'A'}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 truncate">{agent.name}</h4>
                    <p className="text-sm text-neutral-500 truncate">{agent.role_title}</p>
                </div>
                <button
                    onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                    className="btn btn-sm btn-primary"
                >
                    Chat
                </button>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-neutral-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-1">Welcome to AVINCI</h1>
                <p className="text-neutral-600">Your AI Agent Platform for Design Testing and User Research</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Agents"
                    value={stats.totalAgents}
                    icon={UserGroupIcon}
                    trend={12}
                    color="primary"
                />
                <StatCard
                    title="Active Chats"
                    value={stats.activeChats}
                    icon={ChatBubbleLeftRightIcon}
                    trend={8}
                    color="accent"
                />
                <StatCard
                    title="Design Tests"
                    value={stats.designTests}
                    icon={EyeIcon}
                    trend={-3}
                    color="blue"
                />
                <StatCard
                    title="Avg. Response Time"
                    value={`${stats.avgResponseTime}s`}
                    icon={ClockIcon}
                    trend={-15}
                    color="yellow"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <QuickActionCard
                            title="Generate New Agent"
                            description="Create AI agents from transcripts"
                            icon={PlusSolidIcon}
                            href="/generate"
                            color="primary"
                        />
                        <QuickActionCard
                            title="Browse Agent Library"
                            description="View all available agents"
                            icon={UserGroupIcon}
                            href="/agents"
                            color="accent"
                        />
                        <QuickActionCard
                            title="Start Chat Session"
                            description="Talk to your AI agents"
                            icon={ChatBubbleLeftRightIcon}
                            href="/chat"
                            color="blue"
                        />
                        <QuickActionCard
                            title="Research Studio"
                            description="Upload transcripts and test designs"
                            icon={DocumentTextIcon}
                            href="/research-studio"
                            color="yellow"
                        />
                    </div>
                </div>

                {/* Recent Agents */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900">Recent Agents</h2>
                        <a
                            href="/agents"
                            className="text-sm font-medium text-primary hover:text-primary-700 transition-colors"
                        >
                            View all
                        </a>
                    </div>
                    
                    {recentAgents.length === 0 ? (
                        <div className="card p-8 text-center">
                            <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <UserGroupIcon className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Agents Yet</h3>
                            <p className="text-neutral-600 mb-6">Create your first AI agent to get started</p>
                            <a
                                href="/generate"
                                className="btn btn-primary inline-flex items-center space-x-2"
                            >
                                <PlusSolidIcon className="w-5 h-5" />
                                <span>Create Agent</span>
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentAgents.map((agent) => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h2>
                <div className="card p-6">
                    <div className="space-y-4">
                        {[
                            { id: 1, action: 'New agent "Priya" created from transcript', time: '2 minutes ago', type: 'agent' },
                            { id: 2, action: 'Chat session started with "Rajesh"', time: '5 minutes ago', type: 'chat' },
                            { id: 3, action: 'Design feedback received from "Maria"', time: '12 minutes ago', type: 'feedback' },
                            { id: 4, action: 'Agent "David" persona updated', time: '1 hour ago', type: 'update' }
                        ].map((activity) => (
                            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                                <div className={`w-2 h-2 rounded-full ${
                                    activity.type === 'agent' ? 'bg-primary' :
                                    activity.type === 'chat' ? 'bg-accent' :
                                    activity.type === 'feedback' ? 'bg-blue' : 'bg-yellow'
                                }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-neutral-900">{activity.action}</p>
                                    <p className="text-xs text-neutral-500">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UberDashboard;
