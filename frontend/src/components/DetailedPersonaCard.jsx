import React from 'react';
import { motion } from 'framer-motion';
import { 
    UserIcon, 
    MapPinIcon, 
    BriefcaseIcon, 
    AcademicCapIcon,
    HeartIcon,
    StarIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    EyeIcon,
    SparklesIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const DetailedPersonaCard = ({ persona, onClose, onChat, onView }) => {
    if (!persona) return null;

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        hover: { 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.2, ease: "easeOut" }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const getPersonaIcon = (persona) => {
        if (persona.occupation?.toLowerCase().includes('designer')) return '🎨';
        if (persona.occupation?.toLowerCase().includes('developer')) return '💻';
        if (persona.occupation?.toLowerCase().includes('manager')) return '👔';
        if (persona.occupation?.toLowerCase().includes('analyst')) return '📊';
        if (persona.occupation?.toLowerCase().includes('consultant')) return '💡';
        return '👤';
    };

    const renderArray = (items, fallback = 'Not specified') => {
        if (!items) return fallback;
        if (Array.isArray(items)) {
            return items.length > 0 ? items : fallback;
        }
        return items;
    };

    const renderArrayAsTags = (items, maxItems = 5) => {
        if (!items) return <span className="text-slate-500 italic">Not specified</span>;
        if (!Array.isArray(items)) return <span className="text-slate-500 italic">Not specified</span>;
        if (items.length === 0) return <span className="text-slate-500 italic">Not specified</span>;
        
        const displayItems = items.slice(0, maxItems);
        const remaining = items.length - maxItems;
        
        return (
            <div className="flex flex-wrap gap-2">
                {displayItems.map((item, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ 
                            backgroundColor: 'rgba(20, 72, 53, 0.1)', 
                            color: '#144835' 
                        }}
                    >
                        {item}
                    </span>
                ))}
                {remaining > 0 && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                        +{remaining} more
                    </span>
                )}
            </div>
        );
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
            {/* Header */}
            <div className="relative h-48 bg-gradient-horizontal-01 p-8">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                            {getPersonaIcon(persona)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{persona.name || 'Unknown'}</h1>
                            <p className="text-white/90 text-lg">{persona.occupation || 'Professional'}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1 text-white/80">
                                    <MapPinIcon className="w-4 h-4" />
                                    <span className="text-sm">{persona.location || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-white/80">
                                    <ClockIcon className="w-4 h-4" />
                                    <span className="text-sm">{persona.age || 'Unknown'} years old</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onChat}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
                        >
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onView}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
                        >
                            <EyeIcon className="w-6 h-6" />
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
                            >
                                <CommandLineIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8">
                {/* Quote Section */}
                {persona.quote && (
                    <motion.div
                        variants={sectionVariants}
                        className="mb-8 p-6 rounded-xl border-l-4"
                        style={{ 
                            backgroundColor: 'rgba(20, 72, 53, 0.05)', 
                            borderLeftColor: '#144835' 
                        }}
                    >
                        <p className="text-lg text-slate-700 italic leading-relaxed">"{persona.quote}"</p>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        {/* Demographics */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <UserIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Demographics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Age:</span>
                                    <span className="font-medium">{persona.age || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Gender:</span>
                                    <span className="font-medium">{persona.gender || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Location:</span>
                                    <span className="font-medium">{persona.location || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Education:</span>
                                    <span className="font-medium">{persona.education || 'Not specified'}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Goals & Objectives */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <StarIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Goals & Objectives
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Primary Goals:</h4>
                                    {renderArrayAsTags(persona.goals?.primary, 3)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Motivations:</h4>
                                    {renderArrayAsTags(persona.goals?.motivations, 3)}
                                </div>
                            </div>
                        </motion.div>

                        {/* Pain Points */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <HeartIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Pain Points & Challenges
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Primary Pain Points:</h4>
                                    {renderArrayAsTags(persona.pain_points?.primary, 3)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Frustrations:</h4>
                                    {renderArrayAsTags(persona.pain_points?.frustrations, 3)}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Skills & Expertise */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <BriefcaseIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Skills & Expertise
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Technical Skills:</h4>
                                    {renderArrayAsTags(persona.skills?.technical, 4)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Soft Skills:</h4>
                                    {renderArrayAsTags(persona.skills?.soft_skills, 4)}
                                </div>
                            </div>
                        </motion.div>

                        {/* Personality Traits */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <SparklesIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Personality
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Traits:</h4>
                                    {renderArrayAsTags(persona.personality?.traits, 4)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Values:</h4>
                                    {renderArrayAsTags(persona.personality?.values, 4)}
                                </div>
                            </div>
                        </motion.div>

                        {/* Technology Usage */}
                        <motion.div variants={sectionVariants} className="card p-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                <CommandLineIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                                Technology
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Devices:</h4>
                                    {renderArrayAsTags(persona.technology?.devices, 3)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700 mb-2">Platforms:</h4>
                                    {renderArrayAsTags(persona.technology?.platforms, 3)}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Daily Life & Activities */}
                {(persona.daily_life?.leisure_activities || persona.daily_life?.work_style) && (
                    <motion.div variants={sectionVariants} className="mt-8 card p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                            <ClockIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                            Daily Life & Activities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-slate-700 mb-2">Leisure Activities:</h4>
                                {renderArrayAsTags(persona.daily_life?.leisure_activities, 4)}
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-700 mb-2">Work Style:</h4>
                                <p className="text-slate-600">{persona.daily_life?.work_style || 'Not specified'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Voice & Communication */}
                {(persona.voice?.tone || persona.voice?.communication_style) && (
                    <motion.div variants={sectionVariants} className="mt-8 card p-6">
                        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" style={{ color: '#144835' }} />
                            Voice & Communication
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-slate-700 mb-2">Tone:</h4>
                                <p className="text-slate-600">{persona.voice?.tone || 'Not specified'}</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-slate-700 mb-2">Communication Style:</h4>
                                <p className="text-slate-600">{persona.voice?.communication_style || 'Not specified'}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default DetailedPersonaCard;