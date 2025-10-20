import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const FigmaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authentication parameters');
          return;
        }

        setMessage('Completing authentication...');
        
        // Call the OAuth callback endpoint
        const response = await api.get('/design/admin/oauth-callback', {
          params: { code, state }
        });

        if (response.data.success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          toast.success('Figma authentication completed successfully');
          
          // Redirect to admin panel after a short delay
          setTimeout(() => {
            navigate('/admin/design-import');
          }, 2000);
        } else {
          throw new Error(response.data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.response?.data?.error || 'Authentication failed');
        toast.error('Figma authentication failed');
        
        // Redirect to admin panel on error after delay
        setTimeout(() => {
          navigate('/admin/design-import');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
          {status === 'success' && 'Authentication Successful!'}
          {status === 'error' && 'Authentication Failed'}
          {status === 'processing' && 'Processing...'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6"
        >
          {message}
        </motion.p>

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
            onClick={() => navigate('/admin/design-import')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Design Import
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default FigmaCallback;
