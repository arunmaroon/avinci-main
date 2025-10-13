import React, { useState } from 'react';
import { 
    FileText, 
    Download, 
    RefreshCw, 
    CheckCircle, 
    AlertCircle,
    Lightbulb,
    Target,
    Users,
    Calendar,
    Star
} from 'react-icons/fi';
import axios from 'axios';

const PRDGenerator = ({ project, onPRDGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPRD, setGeneratedPRD] = useState(null);
    const [error, setError] = useState(null);
    const [prdSections, setPrdSections] = useState({
        executiveSummary: '',
        productVision: '',
        targetUsers: '',
        userStories: '',
        features: '',
        technicalRequirements: '',
        successMetrics: '',
        timeline: ''
    });

    const generatePRD = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await axios.post('http://localhost:9001/api/ai/generate-prd', {
                projectName: project?.name || 'New Product',
                projectDescription: project?.description || '',
                targetAudience: project?.targetAudience || 'General users',
                businessGoals: project?.businessGoals || 'Increase user engagement',
                technicalConstraints: project?.technicalConstraints || 'Web-based application'
            });

            const prdData = response.data;
            setGeneratedPRD(prdData);
            setPrdSections(prdData.sections || prdSections);
            
            if (onPRDGenerated) {
                onPRDGenerated(prdData);
            }
        } catch (err) {
            console.error('Error generating PRD:', err);
            setError('Failed to generate PRD. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadPRD = () => {
        if (!generatedPRD) return;

        const prdContent = `
# Product Requirements Document (PRD)
## ${project?.name || 'New Product'}

### Executive Summary
${prdSections.executiveSummary}

### Product Vision
${prdSections.productVision}

### Target Users
${prdSections.targetUsers}

### User Stories
${prdSections.userStories}

### Features
${prdSections.features}

### Technical Requirements
${prdSections.technicalRequirements}

### Success Metrics
${prdSections.successMetrics}

### Timeline
${prdSections.timeline}

---
Generated on ${new Date().toLocaleDateString()}
        `;

        const blob = new Blob([prdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name || 'product'}-prd.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const regenerateSection = async (sectionKey) => {
        try {
            const response = await axios.post('http://localhost:9001/api/ai/generate-prd-section', {
                section: sectionKey,
                projectContext: {
                    name: project?.name,
                    description: project?.description,
                    targetAudience: project?.targetAudience
                },
                currentContent: prdSections[sectionKey]
            });

            setPrdSections(prev => ({
                ...prev,
                [sectionKey]: response.data.content
            }));
        } catch (err) {
            console.error('Error regenerating section:', err);
        }
    };

    const sectionTitles = {
        executiveSummary: 'Executive Summary',
        productVision: 'Product Vision',
        targetUsers: 'Target Users',
        userStories: 'User Stories',
        features: 'Features',
        technicalRequirements: 'Technical Requirements',
        successMetrics: 'Success Metrics',
        timeline: 'Timeline'
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">PRD Generator</h2>
                        <p className="text-sm text-gray-500">Generate comprehensive Product Requirements Document</p>
                    </div>
                </div>
                
                <div className="flex space-x-3">
                    <button
                        onClick={generatePRD}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Lightbulb className="w-4 h-4" />
                                <span>Generate PRD</span>
                            </>
                        )}
                    </button>
                    
                    {generatedPRD && (
                        <button
                            onClick={downloadPRD}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{error}</span>
                </div>
            )}

            {/* Success State */}
            {generatedPRD && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700">PRD generated successfully!</span>
                </div>
            )}

            {/* PRD Sections */}
            {generatedPRD && (
                <div className="space-y-6">
                    {Object.entries(prdSections).map(([key, content]) => (
                        <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    {key === 'executiveSummary' && <Target className="w-4 h-4" />}
                                    {key === 'productVision' && <Lightbulb className="w-4 h-4" />}
                                    {key === 'targetUsers' && <Users className="w-4 h-4" />}
                                    {key === 'userStories' && <FileText className="w-4 h-4" />}
                                    {key === 'features' && <Star className="w-4 h-4" />}
                                    {key === 'technicalRequirements' && <FileText className="w-4 h-4" />}
                                    {key === 'successMetrics' && <Target className="w-4 h-4" />}
                                    {key === 'timeline' && <Calendar className="w-4 h-4" />}
                                    <span>{sectionTitles[key]}</span>
                                </h3>
                                <button
                                    onClick={() => regenerateSection(key)}
                                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Regenerate
                                </button>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!generatedPRD && !isGenerating && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Your PRD</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Create a comprehensive Product Requirements Document with AI-powered insights and structured sections.
                    </p>
                    <button
                        onClick={generatePRD}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Start Generating PRD
                    </button>
                </div>
            )}
        </div>
    );
};

export default PRDGenerator;
