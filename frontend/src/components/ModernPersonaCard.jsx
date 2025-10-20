import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserGroupIcon,
  HeartIcon,
  LightBulbIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const Section = ({ title, children, icon: Icon, className = '' }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    {children}
  </motion.section>
);

const BadgeList = ({ items, emptyLabel = 'Not specified', color = 'blue' }) => {
  const content = toArray(items);
  if (content.length === 0) return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  
  const colorClasses = {
    blue: 'text-blue-800 border-blue-200',
    green: 'text-emerald-800 border-emerald-200',
    purple: 'text-purple-800 border-purple-200',
    amber: 'text-amber-800 border-amber-200',
    rose: 'text-rose-800 border-rose-200',
    gray: 'text-gray-800 border-gray-200'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {content.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClasses[color]}`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
        >
          {item}
        </span>
      ))}
    </div>
  );
};

const List = ({ items, emptyLabel = 'Not available' }) => {
  const content = toArray(items);
  if (content.length === 0) return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  return (
    <ul className="space-y-2 text-sm text-gray-700">
      {content.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
};

const Field = ({ icon: Icon, label, value, className = '' }) => {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-3 text-sm text-gray-700 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const ModernPersonaCard = ({ persona, onStartChat, onStartAudioCall, onViewDetails }) => {
  if (!persona) return null;

  const {
    name,
    title,
    occupation,
    location,
    demographics = {},
    age,
    gender,
    avatar_url,
    avatar,
    quote,
    background,
    goals,
    motivations,
    goals_detail,
    pain_points,
    pain_points_detail,
    ui_pain_points,
    behaviors,
    daily_routine,
    daily_life: rawDailyLife,
    decision_making,
    technology,
    fintech_preferences,
    personality_profile,
    personality = {},
    hobbies,
    emotional_profile_extended,
    social_context,
    cultural_background,
    life_events,
    voice,
    voice_id,
    insights,
  } = persona;

  const photo = getAvatarSrc(avatar_url || avatar, name, { size: 240 });
  const primaryGoals = goals_detail?.primary || goals;
  const secondaryGoals = goals_detail?.secondary || [];
  const generalPainPoints = pain_points_detail?.primary || pain_points;
  const frustrations = pain_points_detail?.frustrations;

  const traits = personality_profile || personality.traits;
  const values = personality.values;

  const triggers = emotional_profile_extended?.triggers;
  const responses = emotional_profile_extended?.responses;

  const devices = technology?.devices || technology?.preferred_devices;
  const apps = technology?.apps || technology?.software;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-white shadow-xl mb-8"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleAvatarError(e, name, { size: 240 })}
                  />
                </div>
                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg" />
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{name || 'Unnamed Persona'}</h1>
                  <p className="text-xl font-semibold text-blue-600 mb-1">
                    {title || occupation || 'Role not specified'}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {location || demographics.location || 'Location not provided'}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Field icon={CalendarIcon} label="Age" value={age || demographics.age} />
                  <Field icon={UserGroupIcon} label="Gender" value={gender || demographics.gender} />
                  <Field icon={AcademicCapIcon} label="Education" value={demographics.education} />
                  <Field icon={CogIcon} label="Type" value={demographics.persona_type} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartChat}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Start Chat
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStartAudioCall}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                    Audio Call
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onViewDetails}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    <PhotoIcon className="w-5 h-5" />
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Quote */}
            {quote && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
              >
                <blockquote className="text-lg italic text-gray-700 leading-relaxed">
                  "{quote}"
                </blockquote>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <Section title="Background & Personality" icon={HeartIcon}>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Life Story</p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {background || 'No background information available yet.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Personality Traits</p>
                    <BadgeList items={traits} emptyLabel="Traits not documented." color="blue" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Values</p>
                    <BadgeList items={values} emptyLabel="Values not recorded." color="green" />
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Hobbies & Interests</p>
                  <BadgeList items={hobbies} emptyLabel="Hobbies not captured." color="purple" />
                </div>
              </div>
            </Section>

            <Section title="Goals & Motivations" icon={LightBulbIcon}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Primary Goals</p>
                  <List items={primaryGoals} emptyLabel="No primary goals provided." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Secondary Goals</p>
                  <List items={secondaryGoals} emptyLabel="No secondary goals provided." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Motivations</p>
                  <List items={motivations} emptyLabel="Motivations not captured." />
                </div>
              </div>
            </Section>

            <Section title="Pain Points & Challenges" icon={CogIcon}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">General Frustrations</p>
                  <List items={generalPainPoints} emptyLabel="No pain points recorded." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">UX-Specific Issues</p>
                  <List items={ui_pain_points} emptyLabel="No UX issues noted." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Recurring Concerns</p>
                  <List items={frustrations} emptyLabel="No recurring concerns captured." />
                </div>
              </div>
            </Section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <Section title="Daily Life & Behavior" icon={CalendarIcon}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Habits & Behaviors</p>
                  <List items={behaviors?.habits} emptyLabel="Habits not documented." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Daily Routine</p>
                  <List items={daily_routine || rawDailyLife?.schedule} emptyLabel="Routine not captured." />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Decision Style</p>
                  <p className="text-sm text-gray-600 mb-2">{decision_making?.style || 'Not specified.'}</p>
                  <BadgeList items={decision_making?.influences} emptyLabel="Influences not noted." color="amber" />
                </div>
              </div>
            </Section>

            <Section title="Technology & Tools" icon={CogIcon}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Devices</p>
                  <BadgeList items={devices} emptyLabel="Devices not captured." color="blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Apps & Platforms</p>
                  <BadgeList items={apps} emptyLabel="Apps not captured." color="green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Fintech Behavior</p>
                  <div className="text-sm text-gray-600">
                    {fintech_preferences ? 
                      Object.entries(fintech_preferences).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="font-medium">{key.replace(/_/g, ' ')}:</span>
                          <span>{value}</span>
                        </div>
                      )) : 
                      'Fintech usage not captured.'
                    }
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Emotional & Social Context" icon={UserGroupIcon}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Emotional Triggers</p>
                    <List items={triggers} emptyLabel="Triggers not documented." />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Responses</p>
                    <List items={responses} emptyLabel="Responses not documented." />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Family & Friends</p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Family:</span> {social_context?.family || 'Not specified.'}</p>
                    <p><span className="font-medium">Friends:</span> {social_context?.friends || 'Not specified.'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Community Values</p>
                  <BadgeList items={social_context?.community_values} emptyLabel="Community values not captured." color="purple" />
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* Life Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-8"
        >
          <Section title="Life Events & Milestones" icon={CalendarIcon}>
            {Array.isArray(life_events) && life_events.length > 0 ? (
              <div className="space-y-4">
                {life_events.map((event, index) => (
                  <motion.div
                    key={`${event.event || 'life-event'}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-amber-900">{event.event || 'Milestone'}</div>
                        <div className="text-xs font-medium text-amber-700 mb-1">
                          {event.year || 'Year not specified'}
                        </div>
                        <p className="text-sm text-amber-800">{event.impact || 'Impact unknown.'}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No life events recorded.</p>
            )}
          </Section>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernPersonaCard;
