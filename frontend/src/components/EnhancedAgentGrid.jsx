import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UltraModernAgentCard from './UltraModernAgentCard';
import EnhancedDetailedPersonaCard from './EnhancedDetailedPersonaCard';
import PasswordConfirmation from './PasswordConfirmation';
import api from '../utils/api';

const EnhancedAgentGrid = ({ 
  agents, 
  onSelectAgent, 
  onDeleteAgent, 
  onAgentStatusChange,
  onStartAudioCall 
}) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [detailedPersona, setDetailedPersona] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);

  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    setLoadingPersona(true);
    setShowDetailView(true);

    try {
      const response = await api.get(`/personas/${agent.id}`);
      setDetailedPersona(response.data.agent);
    } catch (error) {
      console.error('Error fetching detailed persona:', error);
      setDetailedPersona(agent);
    } finally {
      setLoadingPersona(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailView(false);
    setSelectedAgent(null);
    setDetailedPersona(null);
  };

  const handleChat = (agent) => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    } else {
      window.location.href = `/enhanced-chat/${agent.id}`;
    }
  };

  const requestPasswordAction = (action, agent) => {
    setPendingAction(action);
    setPendingAgent(agent);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = async () => {
    if (!pendingAgent || !pendingAction) return;

    try {
      if (pendingAction === 'Sleep') {
        const currentStatus = (pendingAgent.status || '').toLowerCase();
        const newStatus = currentStatus === 'sleeping' ? 'active' : 'sleeping';
        await api.patch(`/agents/v5/${pendingAgent.id}/status`, { status: newStatus });
        onAgentStatusChange && onAgentStatusChange(pendingAgent.id, newStatus);
        window.alert(`Agent ${newStatus === 'active' ? 'woken up' : 'put to sleep'} successfully!`);
      } else if (pendingAction === 'Delete') {
        await api.delete(`/agents/v5/${pendingAgent.id}`);
        onDeleteAgent && onDeleteAgent(pendingAgent.id);
        window.alert('Agent deleted successfully!');
      }
    } catch (error) {
      console.error(`Error ${pendingAction.toLowerCase()}ing agent:`, error);
      window.alert(`Failed to ${pendingAction.toLowerCase()} agent: ${error.response?.data?.error || error.message}`);
    } finally {
      setShowPasswordConfirm(false);
      setPendingAction(null);
      setPendingAgent(null);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirm(false);
    setPendingAction(null);
    setPendingAgent(null);
  };

  // Enhanced grid layout with better spacing
  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence>
          {agents.map((agent, index) => (
            <UltraModernAgentCard
              key={agent.id}
              agent={agent}
              index={index}
              onSelectAgent={onSelectAgent}
              onDeleteAgent={onDeleteAgent}
              onAgentStatusChange={onAgentStatusChange}
              onViewDetails={handleViewDetails}
              onStartChat={handleChat}
              onStartAudioCall={onStartAudioCall}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Enhanced Detail Modal */}
      <AnimatePresence>
        {showDetailView && selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Detailed Persona</h2>
                    <p className="text-sm text-gray-600">Comprehensive agent information and background</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseDetails}
                  className="rounded-2xl p-3 text-gray-400 transition-all duration-200 hover:bg-white hover:text-gray-600 hover:shadow-md"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-8">
                {loadingPersona ? (
                  <div className="flex items-center justify-center gap-4 py-20 text-gray-500">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <span className="text-lg font-medium">Loading detailed persona…</span>
                  </div>
                ) : detailedPersona ? (
                  <EnhancedDetailedPersonaCard persona={detailedPersona} />
                ) : (
                  <div className="py-20 text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load persona data</h3>
                    <p className="text-gray-600">There was an error loading the detailed persona information.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PasswordConfirmation
        isOpen={showPasswordConfirm}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        action={pendingAction}
        agentName={pendingAgent?.name}
      />
    </>
  );
};

export default EnhancedAgentGrid;
