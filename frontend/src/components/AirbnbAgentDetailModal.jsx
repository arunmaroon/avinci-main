import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  MapPinIcon,
  ChatBubbleLeftIcon,
  MicrophoneIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ClockIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  BookOpenIcon,
  UsersIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const formatArray = (arr, fallback = 'Not documented') => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return fallback;
  return arr.join(', ');
};

const AirbnbAgentDetailModal = ({ agent, isOpen, onClose, onChat, onAudio }) => {
  if (!agent) return null;

  const rawPersona = agent.raw_persona || {};
  const communication = agent.communication_style || rawPersona.communication_style || {};
  const decisionMaking = agent.decision_making || rawPersona.decision_making || {};
  const cultural = agent.cultural_background || rawPersona.cultural_background || {};
  const hobbies = rawPersona.hobbies_interests || {};
  const dailyRoutine = agent.daily_routine || rawPersona.daily_routine || {};

  // Generate a quote based on agent data
  const generateQuote = () => {
    const quotes = [
      "I need tools that help me make data-driven decisions quickly.",
      "Efficiency and clarity are key to my success.",
      "I want to understand my customers better through analytics.",
      "Real-time insights help me stay ahead of the competition.",
      "I need solutions that adapt to my workflow seamlessly."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>


              {/* Content */}
              <div className="p-8">
                {/* Design Process Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    Design Process
                    <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Strategy */}
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Strategy</h3>
                        <span className="text-sm text-gray-500">(20 Hours)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Ideation Stage</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Hypotheses</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Competitor Analysis</span>
                      </div>
                    </div>

                    {/* Discovery */}
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <BookOpenIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Discovery</h3>
                        <span className="text-sm text-gray-500">(40 Hours)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Research</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">User Persona</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">User Flow</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Information Architecture</span>
                      </div>
                    </div>

                    {/* Solution */}
                    <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                          <StarIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Solution</h3>
                        <span className="text-sm text-gray-500">(90 Hours)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">UX Design</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">UI Design</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Wireframe</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Design System</span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-300">Prototyping</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Persona Section Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    User Persona
                    <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                  </h2>
                </div>

                {/* Photo and Bio Layout */}
                <div className="flex gap-8 mb-8">
                  {/* Left: Large Photo */}
                  <div className="w-80 flex-shrink-0">
                    <img
                      src={agent.avatar_url}
                      alt={agent.name}
                      className="w-full h-96 rounded-2xl object-cover shadow-lg"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=320&background=87ceeb&color=fff&bold=true`;
                      }}
                    />
                  </div>

                  {/* Right: Quote and Bio */}
                  <div className="flex-1 space-y-6">
                    {/* Quote Bubble */}
                    <div className="bg-yellow-100 rounded-2xl p-6 border border-yellow-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white text-lg font-bold">"</span>
                        </div>
                        <p className="text-gray-800 text-lg leading-relaxed">
                          {generateQuote()}
                        </p>
                      </div>
                    </div>

                    {/* Basic Information Card */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={agent.avatar_url}
                          alt={agent.name}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=64&background=87ceeb&color=fff&bold=true`;
                          }}
                        />
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                          <p className="text-gray-600 font-medium">{agent.occupation || agent.role_title || 'AI Persona'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Age: {agent.age || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>Location: {agent.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="w-4 h-4" />
                          <span>Country: {agent.country || 'India'}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {agent.name} is a {agent.occupation || 'professional'} with extensive experience in their field. 
                        They have {agent.tech_savviness || 'intermediate'} knowledge of technology and prefer 
                        {communication.style || 'direct and clear'} communication. They need tools to enhance 
                        their productivity and decision-making capabilities.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rich Persona Details - Three Column Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  
                  {/* Personality Traits Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Personality Traits</h3>
                    </div>
                    <div className="space-y-3">
                      {agent.personality_traits ? (
                        <div className="flex flex-wrap gap-2">
                          {agent.personality_traits.split(',').slice(0, 6).map((trait, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-medium">
                              {trait.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not documented</p>
                      )}
                      <div className="pt-2">
                        <span className="text-xs text-gray-600">Communication Style:</span>
                        <p className="text-sm font-semibold text-gray-900">{communication.style || 'Direct & Clear'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Goals & Motivations Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Goals & Motivations</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Primary Goals:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(agent.goals || rawPersona.objectives) || 'Improve efficiency and productivity'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Motivations:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(agent.motivations || rawPersona.motivations) || 'Professional growth and success'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hobbies & Interests Card */}
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                        <HeartIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Hobbies & Interests</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Primary Interests:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(hobbies.primary) || 'Technology, Business, Innovation'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Seasonal Activities:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(hobbies.seasonal) || 'Reading, Travel, Sports'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Rich Details - Two Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Daily Routine Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Daily Routine</h3>
                    </div>
                    <div className="text-xs text-gray-700 space-y-1 max-h-48 overflow-y-auto">
                      {dailyRoutine?.weekday && Object.keys(dailyRoutine.weekday).length > 0 ? (
                        Object.entries(dailyRoutine.weekday)
                          .sort(([timeA], [timeB]) => {
                            const parseTime = (t) => {
                              const [time, period] = t.split(' ');
                              let [hours, minutes] = time.split(':').map(Number);
                              if (period === 'PM' && hours !== 12) hours += 12;
                              if (period === 'AM' && hours === 12) hours = 0;
                              return hours * 60 + minutes;
                            };
                            return parseTime(timeA) - parseTime(timeB);
                          })
                          .slice(0, 8)
                          .map(([time, activity]) => (
                            <div key={time} className="flex gap-2 py-0.5">
                              <span className="font-semibold text-amber-600 w-16 flex-shrink-0">{time}</span>
                              <span>{activity}</span>
                            </div>
                          ))
                      ) : (
                        <span className="text-gray-500">Not documented</span>
                      )}
                    </div>
                  </div>

                  {/* Decision Making Card */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                        <LightBulbIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Decision Making</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Style:</span>
                        <p className="font-semibold text-gray-900">{decisionMaking.style || 'Analytical'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Approach:</span>
                        <p className="text-gray-700">{decisionMaking.approach || 'Data-driven'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Risk Tolerance:</span>
                        <p className="text-gray-700">{decisionMaking.risk_tolerance || 'Moderate'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social & Cultural Context - Two Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Social Context Card */}
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 border border-teal-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Social Context</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Cultural Background:</span>
                        <p className="font-semibold text-gray-900">{cultural.region || agent.location || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Values:</span>
                        <p className="text-gray-700">{formatArray(cultural.values) || 'Family, Success, Integrity'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Social Circle:</span>
                        <p className="text-gray-700">{formatArray(cultural.social_circle) || 'Professional, Family-oriented'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technology Usage Card */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                        <CpuChipIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Technology Usage</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tech Savviness:</span>
                        <span className="px-3 py-1 rounded-full bg-cyan-200 text-cyan-800 text-xs font-semibold">
                          {agent.tech_savviness || 'Medium'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Preferred Devices:</span>
                        <p className="text-gray-700">Smartphone, Laptop, Tablet</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Communication:</span>
                        <p className="text-gray-700">{communication.preferred_channel || 'Email, Chat, Video'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pain Points & Voice & Tone - Two Column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  
                  {/* Pain Points Card */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Pain Points</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Frustrations:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(agent.frustrations || rawPersona.frustrations) || 'Manual processes, lack of automation, data silos'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Challenges:</span>
                        <p className="text-gray-700 mt-1">
                          {formatArray(agent.challenges || rawPersona.challenges) || 'Time management, decision making, resource constraints'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Voice & Tone Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        <MicrophoneIcon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Voice & Tone</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tone:</span>
                        <p className="font-semibold text-gray-900">{communication.tone || 'Professional'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Communication Style:</span>
                        <p className="text-gray-700">{communication.style || 'Direct and clear'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Preferred Language:</span>
                        <p className="text-gray-700">{agent.language_preference || 'English'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Needs Section - Full Width */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Needs & Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "A comprehensive dashboard that provides real-time insights and analytics",
                      "Tools for efficient customer relationship management and order tracking",
                      "Automated alerts and notifications for critical business metrics",
                      "Advanced search and filtering capabilities for data analysis",
                      "Integration with existing systems for seamless workflow",
                      "Mobile-friendly interface for on-the-go access and management",
                      "Training and support resources for technology adoption",
                      "Customizable reports and data visualization tools"
                    ].map((need, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <ChevronRightIcon className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{need}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={onChat}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    Start Conversation
                  </button>
                  <button
                    onClick={onAudio}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-full hover:from-secondary-600 hover:to-secondary-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                    Voice Call
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AirbnbAgentDetailModal;