import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useMoneyviewAuth from '../hooks/useMoneyviewAuth';
import { toast } from 'react-hot-toast';

const MoneyviewCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing Moneyview authentication...');
  const [userInfo, setUserInfo] = useState(null);

  const { handleCallback } = useMoneyviewAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          toast.error('Moneyview authentication failed');
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authentication parameters');
          toast.error('Invalid authentication response');
          return;
        }

        setMessage('Completing Moneyview authentication...');
        
        // Handle the OAuth callback
        const result = await handleCallback(code, state);

        if (result.success) {
          setStatus('success');
          setMessage('Moneyview authentication successful! Redirecting...');
          setUserInfo(result.user);
          toast.success('Successfully connected to Moneyview');
          
          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            navigate('/admin');
          }, 2000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Moneyview OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        toast.error('Moneyview authentication failed');
        
        // Redirect to admin dashboard on error after delay
        setTimeout(() => {
          navigate('/admin');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {status === 'processing' && (
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {status === 'success' && (
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          )}
          
          {status === 'error' && (
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-2xl font-bold mb-4 ${
            status === 'success' ? 'text-green-700' : 
            status === 'error' ? 'text-red-700' : 
            'text-gray-700'
          }`}
        >
          {status === 'success' && 'Moneyview Connected!'}
          {status === 'error' && 'Connection Failed'}
          {status === 'processing' && 'Connecting to Moneyview...'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          {message}
        </motion.p>

        {userInfo && status === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium text-green-800">Account Connected</span>
            </div>
            <p className="text-sm text-green-700">
              {userInfo.name} ({userInfo.email})
            </p>
          </motion.div>
        )}

        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500"
          >
            Please wait while we complete the authentication process...
          </motion.div>
        )}

        {status !== 'processing' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate('/admin')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Panel
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default MoneyviewCallback;
