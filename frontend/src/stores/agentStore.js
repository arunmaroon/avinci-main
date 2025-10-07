import { create } from 'zustand';
import api from '../utils/api';

const useAgentStore = create((set, get) => ({
    // State
    agents: [],
    selectedAgent: null,
    messages: [],
    isLoading: false,
    error: null,
    chatThemes: [],

    // Actions
    fetchAgents: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/agent/generate');
            set({ 
                agents: response.data.agents,
                isLoading: false 
            });
        } catch (error) {
            console.error('Error fetching agents:', error);
            set({ 
                error: error.message,
                isLoading: false 
            });
        }
    },

    selectAgent: async (agentId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/agent/generate/${agentId}`);
            set({ 
                selectedAgent: response.data.agent,
                messages: [], // Clear messages when switching agents
                isLoading: false 
            });
        } catch (error) {
            console.error('Error selecting agent:', error);
            set({ 
                error: error.message,
                isLoading: false 
            });
        }
    },

    sendMessage: async (message) => {
        const { selectedAgent } = get();
        if (!selectedAgent) return;

        // Add user message immediately
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };

        set(state => ({
            messages: [...state.messages, userMessage],
            isLoading: true
        }));

        try {
            const response = await api.post('/api/ai/generate', {
                agentId: selectedAgent.id,
                message: message
            });

            const agentMessage = {
                id: Date.now() + 1,
                type: 'agent',
                content: response.data.response,
                timestamp: new Date().toISOString()
            };

            set(state => ({
                messages: [...state.messages, agentMessage],
                isLoading: false
            }));

            // Extract themes
            get().extractThemes(message, response.data.response);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };

            set(state => ({
                messages: [...state.messages, errorMessage],
                isLoading: false,
                error: error.message
            }));
        }
    },

    sendImageFeedback: async (imageFile) => {
        const { selectedAgent } = get();
        if (!selectedAgent) return;

        set({ isLoading: true });

        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('agentId', selectedAgent.id);

            const response = await api.post('/api/agent/feedback', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const feedbackMessage = {
                id: Date.now(),
                type: 'agent',
                content: response.data.feedback,
                timestamp: new Date().toISOString(),
                isImageFeedback: true
            };

            set(state => ({
                messages: [...state.messages, feedbackMessage],
                isLoading: false
            }));

        } catch (error) {
            console.error('Error sending image feedback:', error);
            set({ 
                error: error.message,
                isLoading: false 
            });
        }
    },

    extractThemes: (userMessage, agentResponse) => {
        const themes = [];
        
        // Simple theme extraction based on keywords
        const fintechKeywords = ['banking', 'payment', 'finance', 'money', 'transaction', 'account', 'card', 'loan', 'credit'];
        const techKeywords = ['app', 'software', 'technology', 'digital', 'online', 'mobile', 'website', 'platform'];
        const painKeywords = ['problem', 'issue', 'difficult', 'frustrated', 'confused', 'stuck', 'error', 'bug'];
        const securityKeywords = ['security', 'safe', 'secure', 'password', 'authentication', 'privacy', 'data'];
        const uxKeywords = ['interface', 'design', 'user', 'experience', 'usability', 'navigation', 'layout'];
        
        const combinedText = (userMessage + ' ' + agentResponse).toLowerCase();
        
        if (fintechKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Fintech');
        }
        if (techKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Technology');
        }
        if (painKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Pain Points');
        }
        if (securityKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('Security');
        }
        if (uxKeywords.some(keyword => combinedText.includes(keyword))) {
            themes.push('UX/UI');
        }
        
        set(state => ({
            chatThemes: [...new Set([...state.chatThemes, ...themes])]
        }));
    },

    clearMessages: () => {
        set({ messages: [] });
    },

    clearThemes: () => {
        set({ chatThemes: [] });
    },

    clearError: () => {
        set({ error: null });
    }
}));

export default useAgentStore;