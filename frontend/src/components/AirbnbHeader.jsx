import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  UserCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AirbnbHeader = ({ 
  onGenerateAgent, 
  onGroupChat,
  showFilters,
  onToggleFilters,
  stats
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Left: Stats Section - Modern Cards */}
          <div className="flex items-center gap-3">
            {/* Total */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="text-xs font-medium text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">{stats?.total || 0}</span>
            </div>
            
            {/* Active */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-green-700">Active</span>
              <span className="text-xl font-bold text-green-600">{stats?.active || 0}</span>
            </div>
            
            {/* Sleeping */}
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-amber-700">Sleeping</span>
              <span className="text-xl font-bold text-amber-600">{stats?.sleeping || 0}</span>
            </div>
            
            {/* Archived */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <span className="text-xs font-medium text-gray-600">Archived</span>
              <span className="text-xl font-bold text-gray-600">{stats?.archived || 0}</span>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Filters Button */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Bars3Icon className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>

            {/* Group Chat Button */}
            <button
              onClick={onGroupChat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span className="text-sm">Group Chat</span>
            </button>

            {/* Generate Button - Primary */}
            <button
              onClick={onGenerateAgent}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm">Generate</span>
            </button>

            {/* User Avatar */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-sm hover:shadow-md transition-all duration-200"
              >
                AM
              </button>

              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-48 rounded-xl border border-gray-200 bg-white py-2 shadow-xl z-50"
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
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150">
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
