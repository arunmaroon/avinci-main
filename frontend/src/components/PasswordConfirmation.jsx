import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PasswordConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  agentName 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === '12345') {
      onConfirm();
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {action}
              </h3>
              <p className="text-sm text-gray-500">
                This action requires password confirmation
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {action === 'Sleep' ? 'Sleep Agent' : 'Delete Agent'}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {action === 'Sleep' 
                    ? `This will put "${agentName}" to sleep. The agent will not be available for chat until woken up.`
                    : `This will permanently delete "${agentName}" and all associated data. This action cannot be undone.`
                  }
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter password"
                autoFocus
                required
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  action === 'Sleep' 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {action === 'Sleep' ? 'Sleep Agent' : 'Delete Agent'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 text-center">
          Password: 12345
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PasswordConfirmation;
