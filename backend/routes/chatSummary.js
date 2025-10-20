const express = require('express');
const router = express.Router();
const { generateSummary } = require('../services/aiService');
const { saveConversation, getSavedConversations } = require('../services/chatService');

// Generate chat summary
router.post('/generate-summary', async (req, res) => {
  try {
    const { conversationId, messages, callDuration, callType } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'No messages to summarize' });
    }

    // Prepare conversation context
    const conversationText = messages
      .filter(msg => !msg.isSystem)
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join('\n');

    const context = {
      conversationId,
      messageCount: messages.length,
      callDuration: callDuration || 0,
      callType: callType || 'text',
      participants: [...new Set(messages.map(msg => msg.sender).filter(sender => sender !== 'System'))]
    };

    // Generate summary using AI
    const summary = await generateSummary(conversationText, context);

    res.json({
      success: true,
      summary: summary,
      metadata: {
        messageCount: messages.length,
        callDuration: callDuration || 0,
        callType: callType || 'text',
        participants: context.participants,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message 
    });
  }
});

// Save conversation
router.post('/save-conversation', async (req, res) => {
  try {
    const { conversationId, messages, callDuration, callType, startTime, endTime, participants } = req.body;

    if (!conversationId || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const conversationData = {
      conversationId,
      messages,
      callDuration: callDuration || 0,
      callType: callType || 'text',
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date().toISOString(),
      participants: participants || [],
      savedAt: new Date().toISOString()
    };

    const savedConversation = await saveConversation(conversationData);

    res.json({
      success: true,
      conversation: savedConversation,
      message: 'Conversation saved successfully'
    });

  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({ 
      error: 'Failed to save conversation',
      details: error.message 
    });
  }
});

// Get saved conversations
router.get('/saved-conversations', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const conversations = await getSavedConversations(parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      conversations,
      count: conversations.length
    });

  } catch (error) {
    console.error('Error fetching saved conversations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved conversations',
      details: error.message 
    });
  }
});

// Get specific saved conversation
router.get('/saved-conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await getSavedConversationById(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      conversation
    });

  } catch (error) {
    console.error('Error fetching saved conversation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch saved conversation',
      details: error.message 
    });
  }
});

// Delete saved conversation
router.delete('/saved-conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteSavedConversation(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting saved conversation:', error);
    res.status(500).json({ 
      error: 'Failed to delete saved conversation',
      details: error.message 
    });
  }
});

module.exports = router;
