import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AgentPreview from '../AgentPreview';
import {
    HomeIcon,
    PlusCircleIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    EyeIcon,
    DocumentTextIcon,
    UserCircleIcon,
    SparklesIcon,
    CommandLineIcon,
    BellIcon,
    Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children, user, onLogout }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAgentPreview, setShowAgentPreview] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navigation = [
        { 
            name: 'Dashboard', 
            href: '/', 
            icon: HomeIcon,
            description: 'Overview & Analytics',
            gradient: 'from-blue-500 to-cyan-500',
            color: 'blue'
        },
        { 
            name: 'Generate Agents', 
            href: '/generate', 
            icon: PlusCircleIcon,
            description: 'Create New AI Agents',
            gradient: 'from-emerald-500 to-teal-500',
            color: 'emerald'
        },
        { 
            name: 'Agent Library', 
            href: '/agents', 
            icon: UserGroupIcon,
            description: 'Browse All Agents',
            gradient: 'from-purple-500 to-pink-500',
            color: 'purple'
        },
        { 
            name: 'Detailed Personas', 
            href: '/detailed-personas', 
            icon: UserCircleIcon,
            description: 'In-depth User Profiles',
            gradient: 'from-orange-500 to-red-500',
            color: 'orange'
        },
        { 
            name: 'Research Studio', 
            href: '/research-studio', 
            icon: DocumentTextIcon,
            description: 'AI Agents from Research',
            gradient: 'from-amber-500 to-orange-500',
            color: 'amber'
        },
        { 
            name: 'Chat Interface', 
            href: '/chat', 
            icon: ChatBubbleLeftRightIcon,
            description: 'Talk to Agents',
            gradient: 'from-indigo-500 to-blue-500',
            color: 'indigo'
        },
        { 
            name: 'Design Feedback', 
            href: '/design-feedback', 
            icon: DocumentTextIcon,
            description: 'Get Design Insights',
            gradient: 'from-green-500 to-emerald-500',
            color: 'green'
        },
    ];

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-pulse-slow">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                        onClick={() => setSidebarOpen(false)}
                    />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 glass transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg animate-float bg-gradient-primary">
                            <CommandLineIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gradient">AVINCI</h1>
                            <p className="text-xs text-slate-600">AI Agent Platform</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/10 transition-all duration-200"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {navigation.map((item, index) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 ${
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 shadow-lg border border-blue-200/50'
                                            : 'text-slate-600 hover:text-slate-800 hover:bg-white/20'
                                    }`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-gradient-primary text-white shadow-lg' 
                                            : 'text-slate-400 group-hover:text-slate-600 group-hover:bg-white/10'
                                    }`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-slate-500 group-hover:text-slate-600">
                                            {item.description}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 w-full p-6 border-t border-white/20">
                    <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-primary">
                            <span className="text-sm font-bold text-white">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-500">AI Agent Creator</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200"
                            title="Sign out"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="glass border-b border-white/20">
                    <div className="flex items-center justify-between h-20 px-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/10 transition-all duration-200"
                            >
                                <Bars3Icon className="w-5 h-5" />
                            </button>
                            
                            <div className="hidden lg:block">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {navigation.find(item => item.href === location.pathname)?.description || 'Welcome to AVINCI'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowAgentPreview(true)}
                                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
                                title="Agent Preview"
                            >
                                <EyeIcon className="w-5 h-5" />
                            </button>
                            
                            <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110">
                                <BellIcon className="w-5 h-5" />
                            </button>
                            
                            <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110">
                                <Cog6ToothIcon className="w-5 h-5" />
                            </button>
                            
                            <div className="w-px h-8 bg-slate-300" />
                            
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl border bg-primary-50 border-primary-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-slate-700">System Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Agent Preview Modal */}
            {showAgentPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="animate-scale-in">
                        <AgentPreview onClose={() => setShowAgentPreview(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;