import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HomeIcon,
    PlusCircleIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    DocumentTextIcon,
    UserCircleIcon,
    SparklesIcon,
    CommandLineIcon,
    BellIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const UberLayout = ({ children, user, onLogout }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navigation = [
        { 
            name: 'Dashboard', 
            href: '/', 
            icon: HomeIcon,
            description: 'Overview & Analytics'
        },
        { 
            name: 'Generate Agents', 
            href: '/generate', 
            icon: PlusCircleIcon,
            description: 'Create New AI Agents'
        },
        { 
            name: 'Agent Library', 
            href: '/agents', 
            icon: UserGroupIcon,
            description: 'Browse All Agents'
        },
        { 
            name: 'Detailed Personas', 
            href: '/detailed-personas', 
            icon: UserCircleIcon,
            description: 'In-depth User Profiles'
        },
        { 
            name: 'Research Studio', 
            href: '/research-studio', 
            icon: DocumentTextIcon,
            description: 'AI Agents from Research'
        },
        { 
            name: 'Chat Interface', 
            href: '/chat', 
            icon: ChatBubbleLeftRightIcon,
            description: 'Talk to Agents'
        }
    ];

    const isActive = (href) => location.pathname === href;

    if (!mounted) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{ x: sidebarOpen ? 0 : '-100%' }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:translate-x-0 lg:static lg:inset-0"
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <CommandLineIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">AVINCI</h1>
                            <p className="text-xs text-neutral-500">AI Agent Platform</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-neutral-200">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search agents, transcripts..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navigation.map((item, index) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={item.href}
                                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive(item.href)
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${
                                    isActive(item.href) ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-500'
                                }`} />
                                <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className={`text-xs ${
                                        isActive(item.href) ? 'text-white/70' : 'text-neutral-500'
                                    }`}>
                                        {item.description}
                                    </div>
                                </div>
                                {isActive(item.href) && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-3 border-t border-neutral-200">
                    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white border-b border-neutral-200">
                    <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                                <Bars3Icon className="w-5 h-5" />
                            </button>
                            
                            <div className="ml-4 lg:ml-0">
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    {navigation.find(item => isActive(item.href))?.description || ''}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                                <BellIcon className="w-5 h-5" />
                            </button>
                            
                            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                                <Cog6ToothIcon className="w-5 h-5" />
                            </button>
                            
                            <div className="flex items-center space-x-2 px-3 py-2 bg-accent-light rounded-lg">
                                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-neutral-700">System Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default UberLayout;
