import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import useMoneyviewAuth from '../hooks/useMoneyviewAuth';
import { toast } from 'react-hot-toast';

const MoneyviewIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const {
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    session,
    initiateAuth,
    logout,
    refreshUserInfo,
    clearError
  } = useMoneyviewAuth();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      clearError();
      await initiateAuth();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      toast.success('Disconnected from Moneyview');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshUserInfo();
      toast.success('User info refreshed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusIcon = () => {
    if (isLoading || isConnecting) {
      return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (isAuthenticated) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    if (error) {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isLoading || isConnecting) {
      return 'Connecting...';
    }
    if (isAuthenticated) {
      return 'Connected';
    }
    if (error) {
      return 'Connection Failed';
    }
    return 'Not Connected';
  };

  const getStatusColor = () => {
    if (isLoading || isConnecting) {
      return 'text-blue-600';
    }
    if (isAuthenticated) {
      return 'text-green-600';
    }
    if (error) {
      return 'text-red-600';
    }
    return 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <LinkIcon className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Moneyview Integration</h3>
            <p className="text-sm text-gray-600">Connect your Moneyview account for enhanced features</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </motion.div>
      )}

      {isAuthenticated && userInfo ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800">Account Connected</h4>
                <p className="text-sm text-green-700">
                  {userInfo.name} ({userInfo.email})
                </p>
                {session && (
                  <p className="text-xs text-green-600 mt-1">
                    Session expires: {new Date(session.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                >
                  Refresh
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-1">Account ID</h5>
              <p className="text-sm text-gray-600 font-mono">{userInfo.moneyviewId || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-1">Email</h5>
              <p className="text-sm text-gray-600">{userInfo.email}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-6">
          <div className="mb-4">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connect to Moneyview</h4>
            <p className="text-sm text-gray-600 mb-4">
              Connect your Moneyview account to access enhanced features and integrations.
            </p>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={isLoading || isConnecting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
          >
            {isConnecting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" />
                Connect to Moneyview
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MoneyviewIntegration;
