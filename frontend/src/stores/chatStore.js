import { create } from 'zustand';
import api from '../utils/api';

const useChatStore = create((set, get) => ({
            // Single-agent chat state
            chatHistory: [],
            currentAgentId: null,
            isLoading: false,
            error: null,
            uiContext: null,
            usabilityResults: null,

            // Group chat state
            activeGroupId: null,
            activeGroupAgents: [],
            groupChatHistory: [],
            groupPurpose: '',

            // Session history
            chatSessions: {},
            groupSessions: {},
            currentSessionId: null,

            // ---------- Single-Agent Chat Methods ----------
            setCurrentAgent: (agentId) => {
                get().saveChatHistory();
                set({ chatHistory: [], currentAgentId: agentId });
                get().loadChatHistory(agentId);
            },

            getAllSessions: () => {
                const { chatSessions } = get();
                return Object.entries(chatSessions).map(([id, session]) => ({ id, ...session }));
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
                        usabilityResults: null,
                    });
                }
            },

            saveChatSession: (session) => {
                if (!session || !session.id) return;
                set((state) => ({
                    chatSessions: {
                        ...state.chatSessions,
                        [session.id]: {
                            ...session,
                            messageCount: session.chatHistory?.length || session.messageCount || 0,
                            endedAt: session.endedAt || new Date().toISOString(),
                        },
                    },
                }));
            },

            deleteChatSession: (sessionId) => {
                if (!sessionId) return;
                set((state) => {
                    const updated = { ...(state.chatSessions || {}) };
                    delete updated[sessionId];
                    return { chatSessions: updated };
                });
            },

            appendMessage: ({ role, content, ui_path = null, timestamp = new Date().toISOString() }) => {
                const message = {
                    id: Date.now() + Math.random(),
                    role,
                    content,
                    ui_path,
                    timestamp,
                };

                set((state) => ({ chatHistory: [...state.chatHistory, message] }));
                get().saveChatHistory();
            },

            sendMessage: async (message, ui_path = null) => {
                const { currentAgentId, chatHistory } = get();
                if (!currentAgentId) return;

                get().appendMessage({ role: 'user', content: message, ui_path });
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/ai/generate', {
                        agentId: currentAgentId,
                        query: message,
                        ui_path,
                        chat_history: chatHistory,
                    });

                    if (response.data?.success && response.data.response) {
                        get().appendMessage({ role: 'agent', content: response.data.response, ui_path });
                    } else {
                        throw new Error('Invalid response format');
                    }

                    set({ isLoading: false });
                } catch (error) {
                    console.error('Error sending message:', error);
                    get().appendMessage({
                        role: 'error',
                        content: 'Sorry, I encountered an error. Please try again.',
                        ui_path,
                    });
                    set({ error: error.message, isLoading: false });
                }
            },

            uploadUI: async (imageFile) => {
                const { currentAgentId } = get();
                if (!currentAgentId) {
                    set({ error: 'No agent selected for UI upload', isLoading: false });
                    return;
                }

                set({ isLoading: true, error: null });

                try {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    formData.append('agentId', currentAgentId);

                    const response = await api.post('/ai/upload-ui', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const ui_path = response.data.ui_path;
                    set({ uiContext: ui_path });

                    get().appendMessage({
                        role: 'user',
                        content: `Uploaded UI image: ${imageFile.name}`,
                        ui_path,
                    });
                    set({ isLoading: false });
                } catch (error) {
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to upload UI image';
                    set({ error: errorMessage, isLoading: false });
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
                if (!agentId) return;
                localStorage.removeItem(`chat_history_${agentId}`);
                if (get().currentAgentId === agentId) {
                    set({ chatHistory: [] });
                }
            },

            getChatHistoryForAgent: (agentId) => {
                const stored = localStorage.getItem(`chat_history_${agentId}`);
                if (stored) {
                    try {
                        return JSON.parse(stored);
                    } catch (error) {
                        console.error('Error loading chat history for agent:', error);
                    }
                }
                return [];
            },

            // ---------- Parallel Chat Methods ----------
            sendParallelMessage: async (agentIds, message, chatHistory = []) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/ai/parallel-chat', {
                        agentIds,
                        message,
                        chatHistory
                    });

                    if (response.data.success) {
                        const responses = response.data.responses.map(resp => ({
                            id: Date.now() + Math.random(),
                            type: 'agent',
                            agentId: resp.agentId,
                            agentName: resp.agentName,
                            content: resp.response,
                            success: resp.success,
                            timestamp: resp.timestamp,
                            error: resp.error
                        }));

                        return {
                            success: true,
                            responses,
                            metadata: response.data.metadata
                        };
                    } else {
                        throw new Error('Failed to get parallel responses');
                    }
                } catch (error) {
                    console.error('Parallel chat failed:', error);
                    set({ error: error.message, isLoading: false });
                    return {
                        success: false,
                        error: error.message
                    };
                } finally {
                    set({ isLoading: false });
                }
            },

            sendBatchMessage: async (conversations) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await api.post('/ai/batch-chat', {
                        conversations
                    });

                    if (response.data.success) {
                        return {
                            success: true,
                            conversations: response.data.conversations,
                            metadata: response.data.metadata
                        };
                    } else {
                        throw new Error('Failed to get batch responses');
                    }
                } catch (error) {
                    console.error('Batch chat failed:', error);
                    set({ error: error.message, isLoading: false });
                    return {
                        success: false,
                        error: error.message
                    };
                } finally {
                    set({ isLoading: false });
                }
            },
            startGroupChatSession: (agents, purpose) => {
                const groupId = `group_${Date.now()}`;
                set({
                    activeGroupId: groupId,
                    activeGroupAgents: agents,
                    groupChatHistory: [],
                    groupPurpose: purpose,
                });

                localStorage.setItem(
                    `group_chat_${groupId}`,
                    JSON.stringify({
                        agents,
                        purpose,
                        messages: [],
                        startedAt: new Date().toISOString(),
                    })
                );

                return groupId;
            },

            appendGroupMessage: (message) => {
                set((state) => ({ groupChatHistory: [...state.groupChatHistory, message] }));
                get().saveGroupChatHistory();
            },

            saveGroupChatHistory: () => {
                const { activeGroupId, activeGroupAgents, groupChatHistory, groupPurpose } = get();
                if (!activeGroupId) return;

                localStorage.setItem(
                    `group_chat_${activeGroupId}`,
                    JSON.stringify({ agents: activeGroupAgents, purpose: groupPurpose, messages: groupChatHistory })
                );
            },

            loadGroupChatHistory: (groupId) => {
                if (!groupId) return;
                const stored = localStorage.getItem(`group_chat_${groupId}`);
                if (!stored) return;

                try {
                    const parsed = JSON.parse(stored);
                    set({
                        activeGroupId: groupId,
                        activeGroupAgents: parsed.agents || [],
                        groupPurpose: parsed.purpose || '',
                        groupChatHistory: parsed.messages || [],
                    });
                } catch (error) {
                    console.error('Error loading group chat history:', error);
                }
            },

            endGroupChatSession: () => {
                const { activeGroupId, activeGroupAgents, groupChatHistory, groupPurpose } = get();
                if (!activeGroupId || groupChatHistory.length === 0) {
                    set({
                        activeGroupId: null,
                        activeGroupAgents: [],
                        groupChatHistory: [],
                        groupPurpose: '',
                    });
                    return;
                }

                const sessionId = `group_${activeGroupId}`;
                const sessionData = {
                    id: sessionId,
                    agents: activeGroupAgents,
                    purpose: groupPurpose,
                    chatHistory: [...groupChatHistory],
                    endedAt: new Date().toISOString(),
                };

                set((state) => ({
                    groupSessions: {
                        ...state.groupSessions,
                        [sessionId]: sessionData,
                    },
                    activeGroupId: null,
                    activeGroupAgents: [],
                    groupChatHistory: [],
                    groupPurpose: '',
                }));

                localStorage.setItem(`group_session_${sessionId}`, JSON.stringify(sessionData));
                localStorage.removeItem(`group_chat_${activeGroupId}`);
            },

            loadSavedGroupSession: (sessionId) => {
                const stored = localStorage.getItem(`group_session_${sessionId}`);
                if (!stored) return;

                try {
                    const parsed = JSON.parse(stored);
                    set({
                        activeGroupId: parsed.id,
                        activeGroupAgents: parsed.agents || [],
                        groupPurpose: parsed.purpose || '',
                        groupChatHistory: parsed.chatHistory || [],
                    });
                } catch (error) {
                    console.error('Error loading saved group session:', error);
                }
            },

            getGroupSessions: () => {
                const { groupSessions } = get();
                return Object.entries(groupSessions).map(([id, session]) => ({ id, ...session }));
            },

            loadLastActiveGroupChat: () => {
                // Find the most recent active group chat in localStorage
                const keys = Object.keys(localStorage).filter(key => key.startsWith('group_chat_'));
                if (keys.length === 0) return null;

                // Sort by timestamp in the key (group_chat_{timestamp})
                const latestKey = keys.sort().reverse()[0];
                const groupId = latestKey.replace('group_chat_', '');
                
                try {
                    const stored = localStorage.getItem(latestKey);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        set({
                            activeGroupId: groupId,
                            activeGroupAgents: parsed.agents || [],
                            groupPurpose: parsed.purpose || '',
                            groupChatHistory: parsed.messages || [],
                        });
                        return groupId;
                    }
                } catch (error) {
                    console.error('Error loading last active group chat:', error);
                }
                return null;
            },

            clearGroupChatHistory: () => {
                const { activeGroupId } = get();
                set({ groupChatHistory: [] });
                if (activeGroupId) {
                    localStorage.removeItem(`group_chat_${activeGroupId}`);
                }
            },

            // ---------- Shared Utilities ----------
            clearError: () => set({ error: null }),

            reset: () => {
                set({
                    chatHistory: [],
                    currentAgentId: null,
                    isLoading: false,
                    error: null,
                    uiContext: null,
                    usabilityResults: null,
                    activeGroupId: null,
                    activeGroupAgents: [],
                    groupChatHistory: [],
                    groupPurpose: '',
                });
            },
}));

export default useChatStore;
