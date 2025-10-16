import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const AirbnbFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onClose
}) => {
  const {
    status,
    age,
    techLevel,
    englishLevel,
    location,
    sortBy
  } = filters;

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'sleeping', label: 'Sleeping' },
      { value: 'archived', label: 'Archived' }
    ],
    age: [
      { value: 'all', label: 'All Ages' },
      { value: 'young', label: 'Under 30' },
      { value: 'adult', label: '30-49' },
      { value: 'mature', label: '50+' }
    ],
    techLevel: [
      { value: 'all', label: 'All Tech Levels' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' }
    ],
    englishLevel: [
      { value: 'all', label: 'All English Levels' },
      { value: 'Beginner', label: 'Beginner' },
      { value: 'Elementary', label: 'Elementary' },
      { value: 'Intermediate', label: 'Intermediate' },
      { value: 'Advanced', label: 'Advanced' },
      { value: 'Expert', label: 'Expert' }
    ],
    sortBy: [
      { value: 'name', label: 'Name' },
      { value: 'age', label: 'Age' },
      { value: 'location', label: 'Location' },
      { value: 'tech', label: 'Tech Level' },
      { value: 'created', label: 'Recently Added' }
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="border-b border-gray-200 bg-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
                <h3 className="airbnb-text-lg font-semibold text-gray-900">Filters</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block airbnb-text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="airbnb-input w-full"
                >
                  {filterOptions.status.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Filter */}
              <div>
                <label className="block airbnb-text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <select
                  value={age}
                  onChange={(e) => onFilterChange('age', e.target.value)}
                  className="airbnb-input w-full"
                >
                  {filterOptions.age.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tech Level Filter */}
              <div>
                <label className="block airbnb-text-sm font-medium text-gray-700 mb-2">
                  Tech Level
                </label>
                <select
                  value={techLevel}
                  onChange={(e) => onFilterChange('techLevel', e.target.value)}
                  className="airbnb-input w-full"
                >
                  {filterOptions.techLevel.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* English Level Filter */}
              <div>
                <label className="block airbnb-text-sm font-medium text-gray-700 mb-2">
                  English Level
                </label>
                <select
                  value={englishLevel}
                  onChange={(e) => onFilterChange('englishLevel', e.target.value)}
                  className="airbnb-input w-full"
                >
                  {filterOptions.englishLevel.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block airbnb-text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => onFilterChange('sortBy', e.target.value)}
                  className="airbnb-input w-full"
                >
                  {filterOptions.sortBy.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClearFilters}
                className="airbnb-btn airbnb-btn-ghost"
              >
                Clear all
              </button>
              <div className="flex items-center gap-2">
                <span className="airbnb-text-sm text-gray-600">
                  Showing all agents
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AirbnbFilters;
