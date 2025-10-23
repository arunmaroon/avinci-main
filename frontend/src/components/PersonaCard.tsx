import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAdminStore } from '../stores/adminStore';
import { useChatStore } from '../stores/chatStore';
import FigmaImportModal from './FigmaImportModal';

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    role: string;
    age?: number;
    location?: string;
    goals: string;
    painPoints: string;
    behaviors: string;
    traits: string;
    demographics?: {
      gender?: string;
      income?: string;
      education?: string;
      occupation?: string;
    };
    figmaConnections?: Array<{
      id: string;
      name: string;
      feedback: string;
      score: number;
    }>;
  };
  onEdit?: (persona: any) => void;
  onDelete?: (id: string) => void;
  onExport?: (persona: any) => void;
  className?: string;
}

const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onEdit,
  onDelete,
  onExport,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFigmaModal, setShowFigmaModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { importFigmaDesign } = useAdminStore();
  const { addFigmaData, addPersona } = useChatStore();

  const handleFigmaImport = async (figmaData: any) => {
    setIsImporting(true);
    try {
      // Import Figma design
      const result = await importFigmaDesign(figmaData);
      
      // Add to chat store
      const figma = addFigmaData({
        fileKey: result.fileKey,
        name: result.name,
        analysis: result.analysis,
        metadata: {
          personaId: persona.id,
          personaName: persona.name
        }
      });

      // Generate persona-specific feedback
      const personaFeedback = await generatePersonaFeedback(persona, result.analysis);
      
      // Update persona with Figma connection
      const updatedPersona = {
        ...persona,
        figmaConnections: [
          ...(persona.figmaConnections || []),
          {
            id: figma.id,
            name: result.name,
            feedback: personaFeedback,
            score: calculatePersonaScore(personaFeedback)
          }
        ]
      };

      addPersona(updatedPersona);
      
      // Show success message
      console.log('Figma design imported and connected to persona');
      
    } catch (error) {
      console.error('Failed to import Figma design:', error);
    } finally {
      setIsImporting(false);
      setShowFigmaModal(false);
    }
  };

  const generatePersonaFeedback = async (persona: any, analysis: any) => {
    // This would typically call the backend AI endpoint
    // For now, we'll generate a mock response
    return `As ${persona.name}, this design ${analysis.suggestions?.[0] || 'could be improved'} to better support my goal of ${persona.goals}`;
  };

  const calculatePersonaScore = (feedback: string) => {
    // Simple scoring based on feedback sentiment
    const positiveWords = ['good', 'great', 'excellent', 'perfect', 'supports', 'helps'];
    const negativeWords = ['bad', 'poor', 'frustrating', 'confusing', 'hinders', 'blocks'];
    
    const positiveCount = positiveWords.filter(word => 
      feedback.toLowerCase().includes(word)
    ).length;
    
    const negativeCount = negativeWords.filter(word => 
      feedback.toLowerCase().includes(word)
    ).length;
    
    return Math.max(1, Math.min(10, 5 + positiveCount - negativeCount));
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <>
      <motion.div
        className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                <p className="text-sm text-gray-600">{persona.role}</p>
                {persona.age && persona.location && (
                  <p className="text-xs text-gray-500">{persona.age} years old, {persona.location}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {persona.figmaConnections?.length > 0 && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">
                    {persona.figmaConnections.length} design{persona.figmaConnections.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Goals & Pain Points */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Goals</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{persona.goals}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pain Points</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{persona.painPoints}</p>
            </div>
          </div>

          {/* Figma Connections */}
          {persona.figmaConnections && persona.figmaConnections.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Design Feedback</h4>
              <div className="space-y-3">
                {persona.figmaConnections.map((connection) => (
                  <div key={connection.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{connection.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(connection.score)}`}>
                        {connection.score}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{connection.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 space-y-4"
              >
                {/* Behaviors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Behaviors</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{persona.behaviors}</p>
                </div>

                {/* Traits */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Traits</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{persona.traits}</p>
                </div>

                {/* Demographics */}
                {persona.demographics && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Demographics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(persona.demographics).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="ml-1 text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFigmaModal(true)}
                disabled={isImporting}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{isImporting ? 'Importing...' : 'Import from Figma'}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(persona)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={() => onExport(persona)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(persona.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Figma Import Modal */}
      <FigmaImportModal
        isOpen={showFigmaModal}
        onClose={() => setShowFigmaModal(false)}
        onImport={handleFigmaImport}
        personaContext={persona}
      />
    </>
  );
};

export default PersonaCard;

