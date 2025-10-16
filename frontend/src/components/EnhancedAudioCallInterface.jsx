import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMicrophoneSlash as MicOff, 
  FaMicrophone as Mic, 
  FaPhoneSlash as PhoneOff, 
  FaCommentDots as MessageSquare,
  FaImage as PhotoIcon,
  FaVolumeUp as VolumeIcon,
  FaUsers as UsersIcon,
  FaClock as ClockIcon
} from 'react-icons/fa';
import { 
  MicrophoneIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon as PhotoOutline,
  SpeakerWaveIcon,
  UserGroupIcon,
  ClockIcon as ClockOutline
} from '@heroicons/react/24/outline';

const EnhancedAudioCallInterface = ({
  callState,
  isMuted,
  isRecording,
  transcript,
  participants,
  callDuration,
  currentSpeakingAgent,
  isPlayingAudio,
  onMuteToggle,
  onEndCall,
  onStartRecording,
  onStopRecording,
  onImageUpload,
  isUploading
}) => {
  const [showTranscript, setShowTranscript] = useState(true);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger pulse animation when someone is speaking
  useEffect(() => {
    if (currentSpeakingAgent) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSpeakingAgent]);

  const getCallStateColor = () => {
    switch (callState) {
      case 'connected':
        return 'from-emerald-500 to-teal-500';
      case 'connecting':
        return 'from-blue-500 to-indigo-500';
      case 'ended':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getCallStateText = () => {
    switch (callState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'ended':
        return 'Call Ended';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Main Call Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* Call Status Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ 
                scale: pulseAnimation ? 1.1 : 1,
                opacity: pulseAnimation ? 0.8 : 1
              }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
            >
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCallStateColor()}`} />
              <span className="text-white font-medium">{getCallStateText()}</span>
              {callDuration > 0 && (
                <>
                  <div className="w-px h-4 bg-white/30" />
                  <div className="flex items-center gap-1 text-white/80">
                    <ClockOutline className="w-4 h-4" />
                    <span className="font-mono text-sm">{formatDuration(callDuration)}</span>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Participants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative rounded-3xl p-6 bg-white/10 backdrop-blur-sm border border-white/20
                  ${currentSpeakingAgent === participant.name ? 'ring-2 ring-emerald-400 ring-opacity-50' : ''}
                  transition-all duration-300
                `}
              >
                {/* Avatar */}
                <div className="text-center mb-4">
                  <div className={`
                    w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500
                    flex items-center justify-center text-white text-2xl font-bold
                    ${currentSpeakingAgent === participant.name ? 'animate-pulse' : ''}
                    transition-all duration-300
                  `}>
                    {participant.name?.charAt(0) || 'A'}
                  </div>
                  
                  {/* Speaking Indicator */}
                  {currentSpeakingAgent === participant.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <SpeakerWaveIcon className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Participant Info */}
                <div className="text-center">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {participant.name || 'Unknown Agent'}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {participant.role || 'AI Persona'}
                  </p>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className={`w-2 h-2 rounded-full ${
                      currentSpeakingAgent === participant.name ? 'bg-emerald-400' : 'bg-white/40'
                    }`} />
                    <span className="text-white/60 text-xs">
                      {currentSpeakingAgent === participant.name ? 'Speaking' : 'Listening'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Control Panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Mute Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onMuteToggle}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl
                  transition-all duration-300
                  ${isMuted 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30' 
                    : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                  }
                `}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </motion.button>

              {/* Recording Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={isRecording ? onStopRecording : onStartRecording}
                className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl
                  transition-all duration-300
                  ${isRecording 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 animate-pulse' 
                    : 'bg-gray-500 hover:bg-gray-600 shadow-lg shadow-gray-500/30'
                  }
                `}
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </motion.button>

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEndCall}
                className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-red-500/30 transition-all duration-300"
              >
                <PhoneOff />
              </motion.button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Image Upload */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onImageUpload}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <PhotoOutline className="w-4 h-4" />
                )}
                Upload Image
              </motion.button>

              {/* Transcript Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTranscript(!showTranscript)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all duration-200"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                {showTranscript ? 'Hide' : 'Show'} Transcript
              </motion.button>
            </div>
          </div>

          {/* Transcript Panel */}
          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">Live Transcript</h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {transcript.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No conversation yet...</p>
                  ) : (
                    transcript.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {entry.speaker?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">
                              {entry.speaker || 'Unknown'}
                            </span>
                            <span className="text-white/60 text-xs">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-white/80 text-sm">{entry.text}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Playing Indicator */}
          <AnimatePresence>
            {isPlayingAudio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3"
              >
                <div className="w-4 h-4 animate-pulse">
                  <VolumeIcon />
                </div>
                <span className="font-medium">
                  {currentSpeakingAgent ? `${currentSpeakingAgent} is speaking...` : 'Playing audio...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedAudioCallInterface;
