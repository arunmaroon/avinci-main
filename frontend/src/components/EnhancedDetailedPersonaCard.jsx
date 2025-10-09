import React from 'react';
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
    ClockIcon as ClockIconSolid,
    StarIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    WifiIcon,
    CreditCardIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    HomeModernIcon,
    CarIcon,
    FilmIcon,
    MusicNoteIcon,
    BookOpenIcon,
    CameraIcon,
    GamepadIcon,
    PaintBrushIcon
} from '@heroicons/react/24/outline';

const EnhancedDetailedPersonaCard = ({ persona }) => {
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
        quote,
        demographics,
        traits,
        behaviors,
        objectives,
        needs,
        fears,
        apprehensions,
        motivations,
        frustrations,
        domain_literacy,
        tech_savviness,
        communication_style,
        speech_patterns,
        vocabulary_profile,
        cognitive_profile,
        knowledge_bounds
    } = persona;

    return (
        <div className="max-w-6xl mx-auto bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative px-8 py-12">
                    <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                            <img 
                                src={avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`} 
                                alt={name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                                onError={(e) => {
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold mb-3">{name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-blue-100 mb-4">
                                <div className="flex items-center">
                                    <BriefcaseIcon className="h-6 w-6 mr-2" />
                                    <span className="text-lg">{occupation}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPinIcon className="h-6 w-6 mr-2" />
                                    <span className="text-lg">{location}</span>
                                </div>
                                <div className="flex items-center">
                                    <CalendarIcon className="h-6 w-6 mr-2" />
                                    <span className="text-lg">Age {age}</span>
                                </div>
                            </div>
                            {quote && (
                                <blockquote className="text-xl italic text-blue-100 max-w-3xl">
                                    "{quote}"
                                </blockquote>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-8 py-8 space-y-12">
                
                {/* Overview Section */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Basic Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Age:</span>
                                    <span className="font-medium">{age}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Occupation:</span>
                                    <span className="font-medium">{occupation}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-medium">{location}</span>
                                </div>
                                {demographics?.education && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Education:</span>
                                        <span className="font-medium">{demographics.education}</span>
                                    </div>
                                )}
                                {demographics?.income_range && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Income:</span>
                                        <span className="font-medium">{demographics.income_range}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Personality Traits */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <HeartIcon className="h-5 w-5 mr-2 text-green-600" />
                                Personality Traits
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(traits || {}).map((trait, index) => (
                                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                        {trait}
                                    </span>
                                ))}
                                {(!traits || Object.keys(traits).length === 0) && (
                                    <span className="text-gray-500 text-sm">No traits available</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Tech Savviness */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <CogIcon className="h-5 w-5 mr-2 text-purple-600" />
                                Tech Profile
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tech Savviness:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        tech_savviness === 'high' ? 'bg-green-100 text-green-800' :
                                        tech_savviness === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {tech_savviness || 'medium'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Communication:</span>
                                    <span className="text-sm font-medium">
                                        {communication_style?.formality ? `${communication_style.formality}/10` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Background & Cultural Context */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <HomeIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Background & Cultural Context</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Life Background */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <HomeIcon className="h-5 w-5 mr-2 text-green-600" />
                                Life Background
                            </h3>
                            <p className="text-gray-700 leading-relaxed">
                                {background || demographics?.background || 'Background information not available.'}
                            </p>
                        </div>

                        {/* Cultural Background */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <GlobeAltIcon className="h-5 w-5 mr-2 text-green-600" />
                                Cultural Background
                            </h3>
                            {cultural_background ? (
                                <div className="space-y-3">
                                    {cultural_background.heritage && (
                                        <div>
                                            <span className="font-medium text-gray-700">Heritage:</span>
                                            <span className="ml-2 text-gray-600">{cultural_background.heritage}</span>
                                        </div>
                                    )}
                                    {cultural_background.beliefs && (
                                        <div>
                                            <span className="font-medium text-gray-700">Core Beliefs:</span>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {cultural_background.beliefs.map((belief, index) => (
                                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                        {belief}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">Cultural background information not available.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Goals & Motivations */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <LightBulbIcon className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Goals & Motivations</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Goals */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                                Goals & Objectives
                            </h3>
                            <ul className="space-y-2">
                                {(objectives || goals || []).map((goal, index) => (
                                    <li key={index} className="flex items-start">
                                        <StarIcon className="h-4 w-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                                        <span className="text-gray-700">{goal}</span>
                                    </li>
                                ))}
                                {(!objectives && !goals) && (
                                    <li className="text-gray-500">No goals specified</li>
                                )}
                            </ul>
                        </div>
                        
                        {/* Motivations */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
                                Motivations & Needs
                            </h3>
                            <div className="space-y-3">
                                {motivations && motivations.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Motivations:</span>
                                        <ul className="mt-2 space-y-1">
                                            {motivations.map((motivation, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-indigo-500 mr-2">•</span>
                                                    <span className="text-gray-700 text-sm">{motivation}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {needs && needs.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Key Needs:</span>
                                        <ul className="mt-2 space-y-1">
                                            {needs.map((need, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-indigo-500 mr-2">•</span>
                                                    <span className="text-gray-700 text-sm">{need}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pain Points & Fears */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Pain Points & Concerns</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Fears & Apprehensions */}
                        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
                                Fears & Apprehensions
                            </h3>
                            <div className="space-y-3">
                                {fears && fears.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Fears:</span>
                                        <ul className="mt-2 space-y-1">
                                            {fears.map((fear, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-red-500 mr-2">•</span>
                                                    <span className="text-gray-700 text-sm">{fear}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {apprehensions && apprehensions.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Apprehensions:</span>
                                        <ul className="mt-2 space-y-1">
                                            {apprehensions.map((apprehension, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-red-500 mr-2">•</span>
                                                    <span className="text-gray-700 text-sm">{apprehension}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Frustrations */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-600" />
                                Frustrations
                            </h3>
                            <ul className="space-y-2">
                                {(frustrations || pain_points || []).map((frustration, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-orange-500 mr-2">•</span>
                                        <span className="text-gray-700 text-sm">{frustration}</span>
                                    </li>
                                ))}
                                {(!frustrations && !pain_points) && (
                                    <li className="text-gray-500 text-sm">No specific frustrations identified</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Communication & Behavior */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Communication & Behavior</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Communication Style */}
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-purple-600" />
                                Communication Style
                            </h3>
                            <div className="space-y-3 text-sm">
                                {communication_style?.formality && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Formality:</span>
                                        <span className="font-medium">{communication_style.formality}/10</span>
                                    </div>
                                )}
                                {communication_style?.question_style && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Question Style:</span>
                                        <span className="font-medium capitalize">{communication_style.question_style}</span>
                                    </div>
                                )}
                                {communication_style?.sentence_length && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sentence Length:</span>
                                        <span className="font-medium capitalize">{communication_style.sentence_length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Speech Patterns */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2 text-blue-600" />
                                Speech Patterns
                            </h3>
                            <div className="space-y-3">
                                {speech_patterns?.filler_words && speech_patterns.filler_words.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700 text-sm">Filler Words:</span>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {speech_patterns.filler_words.map((word, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {speech_patterns?.common_phrases && speech_patterns.common_phrases.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700 text-sm">Common Phrases:</span>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                            {speech_patterns.common_phrases.map((phrase, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {phrase}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Behaviors */}
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border border-green-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2 text-green-600" />
                                Behaviors
                            </h3>
                            <div className="space-y-2">
                                {Object.keys(behaviors || {}).map((behavior, index) => (
                                    <div key={index} className="flex items-center">
                                        <span className="text-green-500 mr-2">•</span>
                                        <span className="text-gray-700 text-sm">{behavior}</span>
                                    </div>
                                ))}
                                {(!behaviors || Object.keys(behaviors).length === 0) && (
                                    <span className="text-gray-500 text-sm">No specific behaviors identified</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Financial Profile */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CurrencyRupeeIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Financial Profile</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Financial Preferences */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <CurrencyRupeeIcon className="h-5 w-5 mr-2 text-emerald-600" />
                                Financial Preferences
                            </h3>
                            <div className="space-y-3">
                                {fintech_preferences && Object.keys(fintech_preferences).length > 0 ? (
                                    Object.entries(fintech_preferences).map(([key, value], index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Financial preferences not specified</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Domain Literacy */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ChartBarIcon className="h-5 w-5 mr-2 text-amber-600" />
                                Domain Knowledge
                            </h3>
                            <div className="space-y-3">
                                {domain_literacy && Object.keys(domain_literacy).length > 0 ? (
                                    Object.entries(domain_literacy).map(([key, value], index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <span className="font-medium">{Array.isArray(value) ? value.join(', ') : value}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">Domain knowledge not specified</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Context */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <UserGroupIcon className="h-6 w-6 text-pink-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Social Context</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Family & Friends */}
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2 text-pink-600" />
                                Family & Social Circle
                            </h3>
                            {social_context ? (
                                <div className="space-y-3">
                                    {social_context.family && (
                                        <div>
                                            <span className="font-medium text-gray-700">Family:</span>
                                            <p className="text-gray-600 text-sm mt-1">{social_context.family}</p>
                                        </div>
                                    )}
                                    {social_context.friends && (
                                        <div>
                                            <span className="font-medium text-gray-700">Friends:</span>
                                            <p className="text-gray-600 text-sm mt-1">{social_context.friends}</p>
                                        </div>
                                    )}
                                    {social_context.community_values && (
                                        <div>
                                            <span className="font-medium text-gray-700">Community Values:</span>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {social_context.community_values.map((value, index) => (
                                                    <span key={index} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                                                        {value}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Social context information not available</p>
                            )}
                        </div>
                        
                        {/* Lifestyle & Hobbies */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <ClockIconSolid className="h-5 w-5 mr-2 text-indigo-600" />
                                Lifestyle & Interests
                            </h3>
                            <div className="space-y-3">
                                {hobbies && hobbies.length > 0 && (
                                    <div>
                                        <span className="font-medium text-gray-700">Hobbies:</span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {hobbies.map((hobby, index) => (
                                                <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                                                    {hobby}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {daily_routine && (
                                    <div>
                                        <span className="font-medium text-gray-700">Daily Routine:</span>
                                        <p className="text-gray-600 text-sm mt-1">{daily_routine}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cognitive Profile */}
                <section className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <CogIcon className="h-6 w-6 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Cognitive Profile</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cognitive Characteristics */}
                        <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <CogIcon className="h-5 w-5 mr-2 text-violet-600" />
                                Cognitive Characteristics
                            </h3>
                            <div className="space-y-3">
                                {cognitive_profile?.patience && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Patience Level:</span>
                                        <span className="font-medium">{cognitive_profile.patience}/10</span>
                                    </div>
                                )}
                                {cognitive_profile?.comprehension_speed && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Comprehension Speed:</span>
                                        <span className="font-medium capitalize">{cognitive_profile.comprehension_speed}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Knowledge Bounds */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <BookOpenIcon className="h-5 w-5 mr-2 text-slate-600" />
                                Knowledge Areas
                            </h3>
                            {knowledge_bounds && Object.keys(knowledge_bounds).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(knowledge_bounds).map(([key, value], index) => (
                                        <div key={index}>
                                            <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {Array.isArray(value) ? value.map((item, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">
                                                        {item}
                                                    </span>
                                                )) : (
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded">
                                                        {value}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Knowledge areas not specified</p>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default EnhancedDetailedPersonaCard;