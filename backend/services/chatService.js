const fs = require('fs').promises;
const path = require('path');

// In-memory storage for demo purposes
// In production, this would be stored in a database
let savedConversations = [];
let nextId = 1;

const CONVERSATIONS_DIR = path.join(__dirname, '../data/conversations');

// Ensure conversations directory exists
const ensureConversationsDir = async () => {
  try {
    await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating conversations directory:', error);
  }
};

// Save conversation to file and memory
const saveConversation = async (conversationData) => {
  try {
    await ensureConversationsDir();

    const conversation = {
      id: nextId++,
      ...conversationData,
      createdAt: new Date().toISOString()
    };

    // Save to file
    const filename = `conversation_${conversation.id}_${Date.now()}.json`;
    const filepath = path.join(CONVERSATIONS_DIR, filename);
    
    await fs.writeFile(filepath, JSON.stringify(conversation, null, 2));

    // Add to memory storage
    savedConversations.unshift(conversation);

    // Keep only last 100 conversations in memory
    if (savedConversations.length > 100) {
      savedConversations = savedConversations.slice(0, 100);
    }

    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

// Get saved conversations
const getSavedConversations = async (limit = 20, offset = 0) => {
  try {
    // Load from files if memory is empty
    if (savedConversations.length === 0) {
      await loadConversationsFromFiles();
    }

    return savedConversations.slice(offset, offset + limit);
  } catch (error) {
    console.error('Error getting saved conversations:', error);
    throw error;
  }
};

// Get specific saved conversation by ID
const getSavedConversationById = async (id) => {
  try {
    // Load from files if memory is empty
    if (savedConversations.length === 0) {
      await loadConversationsFromFiles();
    }

    return savedConversations.find(conv => conv.id === parseInt(id));
  } catch (error) {
    console.error('Error getting saved conversation by ID:', error);
    throw error;
  }
};

// Delete saved conversation
const deleteSavedConversation = async (id) => {
  try {
    const conversationIndex = savedConversations.findIndex(conv => conv.id === parseInt(id));
    
    if (conversationIndex === -1) {
      return false;
    }

    const conversation = savedConversations[conversationIndex];
    
    // Remove from memory
    savedConversations.splice(conversationIndex, 1);

    // Try to delete file (optional, as we might not have the exact filename)
    try {
      const files = await fs.readdir(CONVERSATIONS_DIR);
      const conversationFile = files.find(file => 
        file.includes(`conversation_${id}_`) && file.endsWith('.json')
      );
      
      if (conversationFile) {
        await fs.unlink(path.join(CONVERSATIONS_DIR, conversationFile));
      }
    } catch (fileError) {
      console.warn('Could not delete conversation file:', fileError.message);
    }

    return true;
  } catch (error) {
    console.error('Error deleting saved conversation:', error);
    throw error;
  }
};

// Load conversations from files
const loadConversationsFromFiles = async () => {
  try {
    await ensureConversationsDir();
    
    const files = await fs.readdir(CONVERSATIONS_DIR);
    const conversationFiles = files.filter(file => file.endsWith('.json'));

    const conversations = [];
    
    for (const file of conversationFiles) {
      try {
        const filepath = path.join(CONVERSATIONS_DIR, file);
        const content = await fs.readFile(filepath, 'utf8');
        const conversation = JSON.parse(content);
        conversations.push(conversation);
      } catch (fileError) {
        console.warn(`Error loading conversation file ${file}:`, fileError.message);
      }
    }

    // Sort by creation date (newest first)
    conversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    savedConversations = conversations;
    nextId = Math.max(...conversations.map(c => c.id), 0) + 1;
    
  } catch (error) {
    console.error('Error loading conversations from files:', error);
    // Don't throw error, just use empty array
    savedConversations = [];
  }
};

// Get conversation statistics
const getConversationStats = async () => {
  try {
    if (savedConversations.length === 0) {
      await loadConversationsFromFiles();
    }

    const stats = {
      total: savedConversations.length,
      byType: {},
      totalDuration: 0,
      averageDuration: 0,
      totalMessages: 0,
      averageMessages: 0
    };

    savedConversations.forEach(conv => {
      // Count by type
      const type = conv.callType || 'text';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Sum duration
      stats.totalDuration += conv.callDuration || 0;
      
      // Sum messages
      stats.totalMessages += conv.messages?.length || 0;
    });

    // Calculate averages
    if (savedConversations.length > 0) {
      stats.averageDuration = Math.round(stats.totalDuration / savedConversations.length);
      stats.averageMessages = Math.round(stats.totalMessages / savedConversations.length);
    }

    return stats;
  } catch (error) {
    console.error('Error getting conversation stats:', error);
    throw error;
  }
};

module.exports = {
  saveConversation,
  getSavedConversations,
  getSavedConversationById,
  deleteSavedConversation,
  getConversationStats,
  loadConversationsFromFiles
};
