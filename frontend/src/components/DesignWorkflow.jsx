import React, { useState } from 'react';
import { 
    Lightbulb, 
    Users, 
    Palette, 
    Monitor, 
    Eye, 
    Type, 
    Code,
    Clock,
    Lock
} from 'react-icons/fi';

const DesignWorkflow = ({ project, onStageChange }) => {
    const [currentStage, setCurrentStage] = useState(project?.currentStage || 'product-thinking');
    const [isInProgress, setIsInProgress] = useState(project?.isInProgress || true);

    const workflowStages = [
        {
            id: 'product-thinking',
            name: 'Product Thinking',
            icon: Lightbulb,
            description: 'Define product vision, goals, and strategy',
            color: 'blue',
            isActive: currentStage === 'product-thinking'
        },
        {
            id: 'user-research',
            name: 'User Research',
            icon: Users,
            description: 'Understand user needs and behaviors',
            color: 'gray',
            isLocked: currentStage !== 'product-thinking'
        },
        {
            id: 'ux-design',
            name: 'UX Design',
            icon: Palette,
            description: 'Create user experience flows and wireframes',
            color: 'gray',
            isLocked: currentStage !== 'user-research'
        },
        {
            id: 'ui-design',
            name: 'UI Design',
            icon: Monitor,
            description: 'Design visual interface components',
            color: 'gray',
            isLocked: currentStage !== 'ux-design'
        },
        {
            id: 'visual-design',
            name: 'Visual Design',
            icon: Eye,
            description: 'Create final visual designs and assets',
            color: 'gray',
            isLocked: currentStage !== 'ui-design'
        },
        {
            id: 'ux-content',
            name: 'UX Content',
            icon: Type,
            description: 'Write and refine content strategy',
            color: 'gray',
            isLocked: currentStage !== 'visual-design'
        },
        {
            id: 'code-export',
            name: 'Code Export',
            icon: Code,
            description: 'Generate development-ready code',
            color: 'gray',
            isLocked: currentStage !== 'ux-content'
        }
    ];

    const handleStageClick = (stage) => {
        if (!stage.isLocked) {
            setCurrentStage(stage.id);
            if (onStageChange) {
                onStageChange(stage.id);
            }
        }
    };

    const getStageStyles = (stage) => {
        if (stage.isActive) {
            return {
                container: 'border-blue-500 bg-blue-50 shadow-md',
                icon: 'bg-blue-100 text-blue-600',
                text: 'text-blue-900 font-semibold'
            };
        } else if (stage.isLocked) {
            return {
                container: 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60',
                icon: 'bg-gray-200 text-gray-400',
                text: 'text-gray-500'
            };
        } else {
            return {
                container: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer',
                icon: 'bg-gray-100 text-gray-600',
                text: 'text-gray-700'
            };
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Workflow Stages</h2>
                <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {workflowStages.find(s => s.isActive)?.name}
                </div>
            </div>

            {/* Workflow Stages */}
            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
                {workflowStages.map((stage) => {
                    const IconComponent = stage.icon;
                    const styles = getStageStyles(stage);
                    
                    return (
                        <div
                            key={stage.id}
                            onClick={() => handleStageClick(stage)}
                            className={`flex-shrink-0 w-48 p-4 rounded-lg border-2 transition-all duration-200 ${styles.container}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.icon}`}>
                                    {stage.isLocked ? (
                                        <Lock className="w-5 h-5" />
                                    ) : stage.isActive ? (
                                        <Clock className="w-5 h-5" />
                                    ) : (
                                        <IconComponent className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-medium ${styles.text} truncate`}>
                                        {stage.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        {stage.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${currentStage === 'product-thinking' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        {workflowStages.find(s => s.isActive)?.name}
                    </span>
                </div>
                <div className="text-sm text-gray-500">
                    {isInProgress ? 'In Progress' : 'Completed'}
                </div>
            </div>

            {/* Stage Details */}
            {currentStage && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">
                        {workflowStages.find(s => s.id === currentStage)?.name} Details
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        {workflowStages.find(s => s.id === currentStage)?.description}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Start Stage
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            View Details
                        </button>
                        {currentStage === 'product-thinking' && (
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                Generate PRD
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignWorkflow;
