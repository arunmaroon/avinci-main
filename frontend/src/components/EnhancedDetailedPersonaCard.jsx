import React, { useState } from 'react';
import { 
    MapPinIcon, 
    CalendarIcon, 
    BriefcaseIcon,
    AcademicCapIcon,
    CurrencyRupeeIcon,
    HeartIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    CogIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    HomeIcon,
    SparklesIcon,
    UserIcon,
    GlobeAltIcon,
    ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';

const EnhancedDetailedPersonaCard = ({ persona }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!persona) return null;

    const {
        name,
        age,
        occupation,
        location,
        background,
        personality,
        hobbies,
        fintech_preferences,
        pain_points,
        ui_pain_points,
        key_quotes,
        goals,
        extrapolation_rules,
        emotional_profile,
        social_context,
        cultural_background,
        daily_routine,
        decision_making,
        life_events,
        avatar_url,
        quote
    } = persona;

    const tabs = [
        { id: 'overview', name: 'Overview', icon: UserIcon },
        { id: 'background', name: 'Background', icon: HomeIcon },
        { id: 'behavior', name: 'Behavior', icon: SparklesIcon },
        { id: 'financial', name: 'Financial', icon: CurrencyRupeeIcon },
        { id: 'social', name: 'Social', icon: UserGroupIcon },
        { id: 'lifestyle', name: 'Lifestyle', icon: ClockIconSolid }
    ];

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Age:</span> {age}</p>
                        <p><span className="font-medium">Occupation:</span> {occupation}</p>
                        <p><span className="font-medium">Location:</span> {location}</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <HeartIcon className="h-5 w-5 mr-2 text-red-600" />
                        Personality
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {personality?.map((trait, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {trait}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quote */}
            {quote && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <blockquote className="text-lg italic text-gray-700">
                        "{quote}"
                    </blockquote>
                </div>
            )}

            {/* Goals and Pain Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-green-600" />
                        Goals
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {goals?.map((goal, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {goal}
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                        Pain Points
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {pain_points?.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );

    const renderBackground = () => (
        <div className="space-y-6">
            {/* Background Story */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <HomeIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Life Background
                </h3>
                <p className="text-gray-700 leading-relaxed">{background}</p>
            </div>

            {/* Cultural Background */}
            {cultural_background && (
                <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <GlobeAltIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Cultural Background
                    </h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Heritage:</span> {cultural_background.heritage}</p>
                        <div>
                            <span className="font-medium">Beliefs:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {cultural_background.beliefs?.map((belief, index) => (
                                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        {belief}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Life Events */}
            {life_events && life_events.length > 0 && (
                <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Life Events
                    </h3>
                    <div className="space-y-3">
                        {life_events.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-gray-900">{event.event}</span>
                                        <span className="text-sm text-gray-500">({event.year})</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{event.impact}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderBehavior = () => (
        <div className="space-y-6">
            {/* Hobbies */}
            {hobbies && hobbies.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Hobbies & Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {hobbies.map((hobby, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {hobby}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Quotes */}
            {key_quotes && key_quotes.length > 0 && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-yellow-600" />
                        Key Quotes
                    </h3>
                    <div className="space-y-2">
                        {key_quotes.map((quote, index) => (
                            <blockquote key={index} className="text-sm italic text-gray-700 border-l-2 border-yellow-400 pl-3">
                                "{quote}"
                            </blockquote>
                        ))}
                    </div>
                </div>
            )}

            {/* Emotional Profile */}
            {emotional_profile && (
                <div className="bg-pink-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <HeartIcon className="h-5 w-5 mr-2 text-pink-600" />
                        Emotional Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Triggers</h4>
                            <ul className="space-y-1 text-sm">
                                {emotional_profile.triggers?.map((trigger, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-pink-600 mr-2">•</span>
                                        {trigger}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Responses</h4>
                            <ul className="space-y-1 text-sm">
                                {emotional_profile.responses?.map((response, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-pink-600 mr-2">•</span>
                                        {response}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Decision Making */}
            {decision_making && (
                <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CogIcon className="h-5 w-5 mr-2 text-green-600" />
                        Decision Making
                    </h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Style:</span> {decision_making.style}</p>
                        <div>
                            <span className="font-medium">Influences:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {decision_making.influences?.map((influence, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        {influence}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderFinancial = () => (
        <div className="space-y-6">
            {/* Fintech Preferences */}
            {fintech_preferences && (
                <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-green-600" />
                        Financial Preferences
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Apps Used</h4>
                            <div className="flex flex-wrap gap-2">
                                {fintech_preferences.apps?.map((app, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                        {app}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Banks</h4>
                            <div className="flex flex-wrap gap-2">
                                {fintech_preferences.banks?.map((bank, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                        {bank}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Payment Habits</h4>
                            <p className="text-sm text-gray-600">{fintech_preferences.payment_habits}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* UI Pain Points */}
            {ui_pain_points && ui_pain_points.length > 0 && (
                <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                        UI Pain Points
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {ui_pain_points.map((point, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-red-600 mr-2">•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderSocial = () => (
        <div className="space-y-6">
            {/* Social Context */}
            {social_context && (
                <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
                        Social Context
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Family</h4>
                            <p className="text-sm text-gray-600">{social_context.family}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Friends</h4>
                            <p className="text-sm text-gray-600">{social_context.friends}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-700 mb-2">Community Values</h4>
                            <div className="flex flex-wrap gap-2">
                                {social_context.community_values?.map((value, index) => (
                                    <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        {value}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Extrapolation Rules */}
            {extrapolation_rules && extrapolation_rules.length > 0 && (
                <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CogIcon className="h-5 w-5 mr-2 text-indigo-600" />
                        Extrapolation Rules
                    </h3>
                    <ul className="space-y-1 text-sm">
                        {extrapolation_rules.map((rule, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-indigo-600 mr-2">•</span>
                                {rule}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderLifestyle = () => (
        <div className="space-y-6">
            {/* Daily Routine */}
            {daily_routine && daily_routine.length > 0 && (
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <ClockIconSolid className="h-5 w-5 mr-2 text-blue-600" />
                        Daily Routine
                    </h3>
                    <div className="space-y-2">
                        {daily_routine.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                    {index + 1}
                                </div>
                                <span className="text-sm text-gray-700">{activity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return renderOverview();
            case 'background':
                return renderBackground();
            case 'behavior':
                return renderBehavior();
            case 'financial':
                return renderFinancial();
            case 'social':
                return renderSocial();
            case 'lifestyle':
                return renderLifestyle();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <img 
                            src={avatar_url} 
                            alt={name}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{name}</h1>
                        <div className="flex items-center space-x-4 text-blue-100">
                            <div className="flex items-center">
                                <BriefcaseIcon className="h-5 w-5 mr-2" />
                                {occupation}
                            </div>
                            <div className="flex items-center">
                                <MapPinIcon className="h-5 w-5 mr-2" />
                                {location}
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                Age {age}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default EnhancedDetailedPersonaCard;

