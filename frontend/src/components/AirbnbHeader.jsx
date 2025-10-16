import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  UserCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AirbnbHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onAddTestAgent, 
  onGenerateAgent, 
  onGroupChat,
  showFilters,
  onToggleFilters 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="airbnb-text-xl font-bold text-gray-900">Agentbnb</span>
          </motion.div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search agents by name, occupation, or quote..."
                className="airbnb-input airbnb-input-search w-full pl-10 pr-4 py-3"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={onToggleFilters}
              className={`airbnb-btn airbnb-btn-ghost airbnb-btn-sm ${
                showFilters ? 'bg-gray-100' : ''
              }`}
            >
              <Bars3Icon className="w-4 h-4" />
              Filters
            </button>

            {/* Group Chat Button */}
            <button
              onClick={onGroupChat}
              className="airbnb-btn airbnb-btn-ghost airbnb-btn-sm"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Group Chat
            </button>

            {/* Add Test Agent Button */}
            <button
              onClick={onAddTestAgent}
              className="airbnb-btn airbnb-btn-secondary airbnb-btn-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Test
            </button>

            {/* Generate Agent Button */}
            <button
              onClick={onGenerateAgent}
              className="airbnb-btn airbnb-btn-primary airbnb-btn-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              Generate
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <UserCircleIcon className="w-8 h-8 text-gray-600" />
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-50"
                >
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <UserCircleIcon className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <HeartIcon className="w-4 h-4" />
                    Favorites
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <GlobeAltIcon className="w-4 h-4" />
                    Language
                  </button>
                  <hr className="my-2" />
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    Sign out
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AirbnbHeader;
