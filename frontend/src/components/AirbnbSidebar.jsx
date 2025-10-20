/**
 * Airbnb-Style Sidebar Component
 * Features: Modern design, smooth animations, proper spacing, clear hierarchy
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  UserGroupIcon as UserGroupSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  CogIcon as CogSolid,
  UserIcon as UserSolid,
  DocumentTextIcon as DocumentTextSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  CloudArrowUpIcon as CloudArrowUpSolid
} from '@heroicons/react/24/solid';
import usePermissions from '../hooks/usePermissions';
import useAuthStore from '../stores/authStore';

const AirbnbSidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const { canAccessAdmin } = usePermissions();
  const { user, logout } = useAuthStore();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeSolid,
      badge: null
    },
    {
      name: 'Users',
      href: '/agents',
      icon: UserGroupIcon,
      iconSolid: UserGroupSolid,
      badge: '28'
    },
    {
      name: 'Chat',
      href: '/group-chat',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatSolid,
      badge: '5'
    },
    {
      name: 'Research',
      href: '/user-research',
      icon: DocumentTextIcon,
      iconSolid: DocumentTextSolid,
      badge: '12'
    },
            // Admin Panel - only show if user has admin access
            ...(canAccessAdmin() ? [
              {
                name: 'Admin Panel',
                href: '/admin/roles',
                icon: ShieldCheckIcon,
                iconSolid: ShieldCheckSolid,
                badge: null
              },
              {
                name: 'Design Import',
                href: '/admin/design-import',
                icon: CloudArrowUpIcon,
                iconSolid: CloudArrowUpSolid,
                badge: null
              }
            ] : [])
  ];

  const bottomItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      iconSolid: CogSolid
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      iconSolid: UserSolid
    }
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 220 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-30"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-complementary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Avinci</h1>
                  <p className="text-xs text-gray-500">AI Agent Platform</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 bg-gradient-to-br from-primary-500 to-complementary-500 rounded-lg flex items-center justify-center mx-auto"
              >
                <span className="text-white font-bold text-sm">A</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            const hovered = hoveredItem === item.name;
            const IconComponent = active ? item.iconSolid : item.icon;

            return (
              <motion.div
                key={item.name}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <NavLink
                  to={item.href}
                  className={`
                    group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-500 rounded-r-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative">
                    <IconComponent className={`h-5 w-5 ${active ? 'text-primary-500' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  </div>

                  {/* Text content */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 flex-1 min-w-0"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-medium truncate ${active ? 'text-gray-900' : 'text-gray-900'}`}>
                            {item.name}
                          </span>
                          {/* Badge - subtle on right side */}
                          {item.badge && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hover tooltip for collapsed state */}
                  {isCollapsed && hovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute left-full ml-2 px-3 py-2 bg-primary-500 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap"
                    >
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary-500 rotate-45" />
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          {bottomItems.map((item) => {
            const active = isActive(item.href);
            const hovered = hoveredItem === item.name;
            const IconComponent = active ? item.iconSolid : item.icon;

            return (
              <motion.div
                key={item.name}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <NavLink
                  to={item.href}
                  className={`
                    group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200
                    ${active 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent className={`h-5 w-5 ${active ? 'text-primary-500' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 flex-1 min-w-0"
                      >
                        <span className="text-sm font-medium truncate">
                          {item.name}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hover tooltip for collapsed state */}
                  {isCollapsed && hovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute left-full ml-2 px-3 py-2 bg-primary-500 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap"
                    >
                      {item.name}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary-500 rotate-45" />
                    </motion.div>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-complementary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                  <p className="text-xs text-blue-600 truncate">
                    {user?.role?.toUpperCase() || 'USER'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default AirbnbSidebar;
