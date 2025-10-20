import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const OptimizedAgentHeader = ({ 
  onGenerateAgent, 
  showFilters,
  onToggleFilters,
  stats,
  searchTerm,
  onSearchChange,
  searchInputRef,
  selectedFilters,
  onFilterChange
}) => {
  // Removed unused showUserMenu state

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Search and Stats */}
            <div className="flex items-center gap-6">
            {/* Search Bar */}
            <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="relative">
              {/* Decoy input to trick browser autocomplete */}
              <input type="text" name="decoy" style={{ position: 'absolute', left: '-9999px' }} tabIndex={-1} autoComplete="off" />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                name="q"
                placeholder="Search users..."
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-80 pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                role="search"
                aria-label="Search users"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Stats - Compact Design */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-900">{stats?.total || 0}</span>
                <span className="text-xs font-medium text-gray-600">Users</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-bold text-green-700">{stats?.active || 0}</span>
                <span className="text-xs font-medium text-green-600">Active</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-bold text-amber-700">{stats?.sleeping || 0}</span>
                <span className="text-xs font-medium text-amber-600">Inactive</span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-sm font-bold text-gray-700">{stats?.archived || 0}</span>
                <span className="text-xs font-medium text-gray-600">Archived</span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Filters Button */}
            <button
              onClick={onToggleFilters}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                showFilters 
                  ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>

            {/* Generate Button - Primary */}
            <button
              onClick={onGenerateAgent}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm">Generate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OptimizedAgentHeader;
