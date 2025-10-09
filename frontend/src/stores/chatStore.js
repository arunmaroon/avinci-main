import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useChatStore = create(
    persist(
        (set, get) => ({
            // State
            chatHistory: [], // Array of {role: 'user'/'agent', content: string, ui_path: string|null, timestamp: string}
            currentAgentId: null,
            isLoading: false,
            error: null,
            uiContext: null, // Current UI context for feedback
            usabilityResults: null,
            chatSessions: {}, // Object to store multiple chat sessions
            currentSessionId: null, // Current active session ID

            // Actions
            setCurrentAgent: (agentId) => {
                // Save current agent's history before switching
                get().saveChatHistory();
                
                // Clear current chat history
                set({ chatHistory: [] });
                
                // Set new agent and load their history
                set({ currentAgentId: agentId });
                get().loadChatHistory(agentId);
            },

            appendMessage: ({ role, content, ui_path = null, timestamp = new Date().toISOString() }) => {
                const message = {
                    id: Date.now() + Math.random(),
                    role,
                    content,
                    ui_path,
                    timestamp
                };

                set(state => ({
                    chatHistory: [...state.chatHistory, message]
                }));

                // Persist to localStorage
                get().saveChatHistory();
            },

            sendMessage: async (message, ui_path = null) => {
                const { currentAgentId, chatHistory } = get();
                
                if (!currentAgentId) {
                    console.error('No currentAgentId set!');
                    return;
                }

                // Add user message immediately
                get().appendMessage({
                    role: 'user',
                    content: message,
                    ui_path
                });

                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/ai/generate', {
                        agentId: currentAgentId,
                        query: message,
                        ui_path,
                        chat_history: chatHistory
                    });

                    // Check if response is successful
                    if (response.data && response.data.success && response.data.response) {
                        // Add agent response
                        get().appendMessage({
                            role: 'agent',
                            content: response.data.response,
                            ui_path
                        });
                    } else {
                        throw new Error('Invalid response format');
                    }

                    set({ isLoading: false });

                } catch (error) {
                    console.error('Error sending message:', error);
                    get().appendMessage({
                        role: 'error',
                        content: 'Sorry, I encountered an error. Please try again.',
                        ui_path
                    });
                    set({ 
                        error: error.message,
                        isLoading: false 
                    });
                }
            },

            uploadUI: async (imageFile) => {
                const { currentAgentId } = get();
                if (!currentAgentId) {
                    console.error('No currentAgentId set for UI upload');
                    set({ 
                        error: 'No agent selected for UI upload',
                        isLoading: false 
                    });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    formData.append('agentId', currentAgentId);

                    console.log('Uploading UI for agent:', currentAgentId);

                    const response = await api.post('/ai/upload-ui', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    console.log('UI upload response:', response.data);

                    const ui_path = response.data.ui_path;
                    set({ uiContext: ui_path });

                    // Add UI upload message
                    get().appendMessage({
                        role: 'user',
                        content: `Uploaded UI image: ${imageFile.name}`,
                        ui_path
                    });

                    set({ isLoading: false });

                } catch (error) {
                    console.error('Error uploading UI:', error);
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to upload UI image';
                    set({ 
                        error: errorMessage,
                        isLoading: false 
                    });
                }
            },

            runUsabilityTest: async (task, ui_path = null) => {
                const { currentAgentId } = get();
                if (!currentAgentId) return;

                set({ isLoading: true });

                try {
                    const response = await api.post('/api/agent/usability', {
                        agentId: currentAgentId,
                        task,
                        ui_path: ui_path || get().uiContext
                    });

                    set({ 
                        usabilityResults: response.data,
                        isLoading: false 
                    });

                    // Add usability test message
                    get().appendMessage({
                        role: 'system',
                        content: `Ran usability test: ${task}`,
                        ui_path
                    });

                } catch (error) {
                    console.error('Error running usability test:', error);
                    set({ 
                        error: error.message,
                        isLoading: false 
                    });
                }
            },

            loadChatHistory: (agentId) => {
                if (!agentId) return;
                
                const stored = localStorage.getItem(`chat_history_${agentId}`);
                if (stored) {
                    try {
                        const history = JSON.parse(stored);
                        set({ chatHistory: history });
                    } catch (error) {
                        console.error('Error loading chat history:', error);
                        set({ chatHistory: [] });
                    }
                } else {
                    // No history found for this agent, start fresh
                    set({ chatHistory: [] });
                }
            },

            saveChatHistory: () => {
                const { currentAgentId, chatHistory } = get();
                if (currentAgentId) {
                    localStorage.setItem(`chat_history_${currentAgentId}`, JSON.stringify(chatHistory));
                }
            },

            clearHistory: () => {
                const { currentAgentId } = get();
                set({ chatHistory: [] });
                if (currentAgentId) {
                    localStorage.removeItem(`chat_history_${currentAgentId}`);
                }
            },

            clearHistoryForAgent: (agentId) => {
                if (agentId) {
                    localStorage.removeItem(`chat_history_${agentId}`);
                    // If this is the current agent, also clear the current history
                    const { currentAgentId } = get();
                    if (currentAgentId === agentId) {
                        set({ chatHistory: [] });
                    }
                }
            },

            getChatHistoryForAgent: (agentId) => {
                const stored = localStorage.getItem(`chat_history_${agentId}`);
                if (stored) {
                    try {
                        return JSON.parse(stored);
                    } catch (error) {
                        console.error('Error loading chat history for agent:', error);
                        return [];
                    }
                }
                return [];
            },

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set({
                    chatHistory: [],
                    currentAgentId: null,
                    isLoading: false,
                    error: null,
                    uiContext: null,
                    usabilityResults: null
                });
            },

            // Session Management
            startNewSession: (agentId) => {
                const sessionId = `session_${Date.now()}_${agentId}`;
                set({
                    currentSessionId: sessionId,
                    currentAgentId: agentId,
                    chatHistory: [],
                    uiContext: null,
                    usabilityResults: null
                });
                return sessionId;
            },

            endCurrentChat: () => {
                const { currentSessionId, chatHistory, currentAgentId } = get();
                if (currentSessionId && chatHistory.length > 0) {
                    // Save current session
                    set(state => ({
                        chatSessions: {
                            ...state.chatSessions,
                            [currentSessionId]: {
                                agentId: currentAgentId,
                                chatHistory: [...chatHistory],
                                endedAt: new Date().toISOString(),
                                messageCount: chatHistory.length
                            }
                        },
                        currentSessionId: null,
                        currentAgentId: null,
                        chatHistory: [],
                        uiContext: null,
                        usabilityResults: null
                    }));
                }
            },

            loadSession: (sessionId) => {
                const { chatSessions } = get();
                const session = chatSessions[sessionId];
                if (session) {
                    set({
                        currentSessionId: sessionId,
                        currentAgentId: session.agentId,
                        chatHistory: session.chatHistory,
                        uiContext: null,
                        usabilityResults: null
                    });
                }
            },

            getAllSessions: () => {
                const { chatSessions } = get();
                return Object.entries(chatSessions).map(([id, session]) => ({
                    id,
                    ...session
                }));
            },

            // Summary functionality
            generateSummary: async () => {
                const { chatSessions } = get();
                const allSessions = Object.values(chatSessions);
                
                if (allSessions.length === 0) {
                    return { error: 'No chat sessions found' };
                }

                try {
                    set({ isLoading: true, error: null });

                    // Prepare all chat data for summary
                    const allChats = allSessions.flatMap(session => 
                        session.chatHistory.map(msg => ({
                            ...msg,
                            sessionId: Object.keys(chatSessions).find(id => chatSessions[id] === session),
                            agentId: session.agentId
                        }))
                    );

                    // Send to backend for AI summary
                    const response = await api.post('/ai/generate-summary', {
                        chatSessions: allSessions,
                        allChats: allChats
                    });

                    set({ isLoading: false });
                    return response.data;
                } catch (error) {
                    console.error('Error generating summary:', error);
                    set({ 
                        error: 'Failed to generate summary',
                        isLoading: false 
                    });
                    return { error: 'Failed to generate summary' };
                }
            }
        }),
        {
            name: 'chat-store',
            partialize: (state) => ({ 
                chatHistory: state.chatHistory,
                currentAgentId: state.currentAgentId,
                uiContext: state.uiContext,
                chatSessions: state.chatSessions || {}
            })
        }
    )
);

export default useChatStore;
