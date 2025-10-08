import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  showMessage = true,
  variant = 'default' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-2 border-slate-200 border-t-2`}
          style={{ borderTopColor: '#144835' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className="flex items-center justify-center space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#144835' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'logo') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <motion.div
          className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center shadow-lg`}
          style={{ background: 'linear-gradient(135deg, #144835 0%, #0e2f26 100%)' }}
          variants={pulseVariants}
          animate="animate"
        >
          <CommandLineIcon className="w-1/2 h-1/2 text-white" />
        </motion.div>
        {showMessage && (
          <motion.p
            className={`${textSizes[size]} text-slate-600 font-medium`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-4 border-slate-200 border-t-4`}
        style={{ borderTopColor: '#144835' }}
        variants={spinnerVariants}
        animate="animate"
      />
      {showMessage && (
        <motion.p
          className={`${textSizes[size]} text-slate-600 font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
