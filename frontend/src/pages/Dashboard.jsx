import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChartBarIcon, 
    ChatBubbleLeftRightIcon, 
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    HeartIcon,
    SparklesIcon,
    CommandLineIcon,
    EyeIcon,
    PlusCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import api from '../utils/api';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [agents, setAgents] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchAgents();
        fetchAnalytics();
        generateRecentActivity();
    }, [selectedAgent]);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/agent/generate');
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = selectedAgent ? { agentId: selectedAgent } : {};
            const response = await api.get('/analytics/insights', { params });
            setAnalytics(response.data.insights);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const generateRecentActivity = () => {
        const activities = [
            { id: 1, type: 'agent_created', message: 'New agent "Priya" created from transcript', time: '2 minutes ago', icon: PlusCircleIcon },
            { id: 2, type: 'chat_started', message: 'Chat session started with "Rajesh"', time: '5 minutes ago', icon: ChatBubbleLeftRightIcon },
            { id: 3, type: 'feedback_received', message: 'Design feedback received from "Maria"', time: '12 minutes ago', icon: EyeIcon },
            { id: 4, type: 'agent_updated', message: 'Agent "David" persona updated', time: '1 hour ago', icon: UserGroupIcon },
        ];
        setRecentActivity(activities);
    };

    const StatCard = ({ title, value, icon: Icon, color = 'primary', trend = null, subtitle = null }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-interactive p-6 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                <Icon className="w-full h-full" style={{ color: '#144835' }} />
            </div>
            
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)' }}>
                        <Icon className="w-6 h-6" style={{ color: '#144835' }} />
                    </div>
                    {trend && (
                        <div className="flex items-center text-sm" style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}>
                            <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
                    <p className="text-slate-600 text-sm">{title}</p>
                    {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
                </div>
            </div>
        </motion.div>
    );

    const QuickActionCard = ({ title, description, icon: Icon, href, color = 'primary' }) => (
        <motion.a
            href={href}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block card-interactive p-6 group"
        >
            <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl group-hover:scale-110 transition-transform duration-200" style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)' }}>
                    <Icon className="w-6 h-6" style={{ color: '#144835' }} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                    <p className="text-sm text-slate-600">{description}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-slate-400" />
                </div>
            </div>
        </motion.a>
    );

    const ActivityItem = ({ activity }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start space-x-3 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200"
        >
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)' }}>
                <activity.icon className="w-4 h-4" style={{ color: '#144835' }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800">{activity.message}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse-slow" style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}>
                        <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome to AVINCI</h1>
                            <p className="text-slate-600">Your AI Agent Platform for Design Testing</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl border" style={{ background: 'rgba(20, 72, 53, 0.1)', borderColor: 'rgba(20, 72, 53, 0.3)' }}>
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#144835' }} />
                                <span className="text-sm font-medium text-slate-700">System Online</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <StatCard
                        title="Total Agents"
                        value={agents.length}
                        icon={UserGroupIcon}
                        trend={12}
                        subtitle="Active personas"
                    />
                    <StatCard
                        title="Active Chats"
                        value="24"
                        icon={ChatBubbleLeftRightIcon}
                        trend={8}
                        subtitle="Ongoing conversations"
                    />
                    <StatCard
                        title="Design Tests"
                        value="156"
                        icon={EyeIcon}
                        trend={-3}
                        subtitle="This month"
                    />
                    <StatCard
                        title="Avg. Response Time"
                        value="2.3s"
                        icon={ClockIcon}
                        trend={-15}
                        subtitle="Faster than last week"
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-1"
                    >
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Actions</h2>
                        <div className="space-y-4">
                            <QuickActionCard
                                title="Generate New Agent"
                                description="Create AI agents from transcripts"
                                icon={PlusCircleIcon}
                                href="/generate"
                            />
                            <QuickActionCard
                                title="Browse Agent Library"
                                description="View all available agents"
                                icon={UserGroupIcon}
                                href="/agents"
                            />
                            <QuickActionCard
                                title="Start Chat Session"
                                description="Talk to your AI agents"
                                icon={ChatBubbleLeftRightIcon}
                                href="/chat"
                            />
                            <QuickActionCard
                                title="Design Feedback"
                                description="Get insights on your designs"
                                icon={EyeIcon}
                                href="/design-feedback"
                            />
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Recent Activity</h2>
                        <div className="card p-6">
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {recentActivity.map((activity) => (
                                        <ActivityItem key={activity.id} activity={activity} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Featured Agents */}
                {agents.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-8"
                    >
                        <h2 className="text-xl font-semibold text-slate-800 mb-6">Featured Agents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.slice(0, 3).map((agent, index) => (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 + index * 0.1 }}
                                    className="card-interactive p-6"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)' }}>
                                            {agent.name?.charAt(0) || 'A'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-800">{agent.name}</h3>
                                            <p className="text-sm text-slate-600 mb-2">{agent.role_title}</p>
                                            <p className="text-xs text-slate-500">{agent.location}</p>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = `/agent-chat/${agent.id}`}
                                            className="px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200"
                                            style={{ backgroundColor: 'rgba(20, 72, 53, 0.1)', color: '#144835' }}
                                        >
                                            Chat
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;