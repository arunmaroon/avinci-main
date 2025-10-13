import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Phone as PhoneIcon,
  PhoneDisabled as PhoneDisabledIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  VolumeUp as VolumeIcon
} from '@mui/icons-material';
import api from '../utils/api';

const UserInterview = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [topic, setTopic] = useState('');
  const [callId, setCallId] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [callEvents, setCallEvents] = useState([]);
  const [showCallDialog, setShowCallDialog] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/research-agents');
      // Fix: Extract agents array from response.data.agents
      setAgents(response.data.agents || []);
    } catch (err) {
      setError('Failed to load agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentToggle = (agent) => {
    setSelectedAgents(prev => {
      const isSelected = prev.find(a => a.id === agent.id);
      if (isSelected) {
        return prev.filter(a => a.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  const startCall = async () => {
    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      return;
    }
    if (!topic.trim()) {
      setError('Please enter a discussion topic');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/call/create', {
        agentIds: selectedAgents.map(a => a.id),
        topic: topic.trim()
      });

      setCallId(response.data.callId);
      setIsCallActive(true);
      setShowCallDialog(true);
    } catch (err) {
      setError('Failed to start call: ' + (err.response?.data?.error || err.message));
      console.error('Error starting call:', err);
    } finally {
      setLoading(false);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallId(null);
    setCallEvents([]);
    setShowCallDialog(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const simulateAgentResponse = () => {
    if (selectedAgents.length === 0) return;
    
    const randomAgent = selectedAgents[Math.floor(Math.random() * selectedAgents.length)];
    const responses = [
      "That's an interesting point. Let me share my perspective on this.",
      "I've experienced something similar. From my point of view...",
      "You know, that reminds me of a situation I faced recently.",
      "I think the key issue here is understanding the user's needs better.",
      "From my experience in this field, I would suggest..."
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setCallEvents(prev => [...prev, {
      id: Date.now(),
      speaker: randomAgent.name,
      text: response,
      timestamp: new Date().toISOString(),
      type: 'agent'
    }]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1E293B' }}>
        User Interview
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: '#64748B' }}>
        Conduct real-time audio interviews with AI agents using rich personas. 
        Select agents, set a topic, and start a simulated group discussion.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Agent Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Select Agents ({selectedAgents.length})
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {agents.map((agent) => {
                    const isSelected = selectedAgents.find(a => a.id === agent.id);
                    return (
                      <Box
                        key={agent.id}
                        onClick={() => handleAgentToggle(agent)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          mb: 1,
                          cursor: 'pointer',
                          borderRadius: 2,
                          backgroundColor: isSelected ? '#F1F5F9' : 'transparent',
                          border: isSelected ? '2px solid #3B82F6' : '2px solid transparent',
                          '&:hover': {
                            backgroundColor: '#F8FAFC'
                          }
                        }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: '#3B82F6' }}>
                          {agent.name?.charAt(0) || 'A'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {agent.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {agent.role} • {agent.location}
                          </Typography>
                        </Box>
                        {isSelected && (
                          <Chip label="Selected" size="small" color="primary" />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Call Setup */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Call Setup
              </Typography>
              
              <TextField
                fullWidth
                label="Discussion Topic"
                placeholder="e.g., Loan application process, Mobile banking experience"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                sx={{ mb: 3 }}
                multiline
                rows={3}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={startCall}
                disabled={loading || selectedAgents.length === 0 || !topic.trim()}
                startIcon={<PhoneIcon />}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  backgroundColor: '#10B981',
                  '&:hover': { backgroundColor: '#059669' }
                }}
              >
                {loading ? 'Starting Call...' : 'Start Interview'}
              </Button>

              {selectedAgents.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Selected Agents:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedAgents.map((agent) => (
                      <Chip
                        key={agent.id}
                        label={agent.name}
                        size="small"
                        color="primary"
                        onDelete={() => handleAgentToggle(agent)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Call Dialog */}
      <Dialog
        open={showCallDialog}
        onClose={endCall}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Live Interview: {topic}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={toggleMute}
                color={isMuted ? 'error' : 'primary'}
                sx={{ bgcolor: isMuted ? '#FEE2E2' : '#EFF6FF' }}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
              <IconButton
                onClick={endCall}
                color="error"
                sx={{ bgcolor: '#FEE2E2' }}
              >
                <PhoneDisabledIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Participants: {selectedAgents.map(a => a.name).join(', ')}
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={simulateAgentResponse}
              sx={{ mb: 2 }}
            >
              Simulate Agent Response
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Conversation
          </Typography>
          
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {callEvents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No messages yet. Click "Simulate Agent Response" to start the conversation.
              </Typography>
            ) : (
              <List>
                {callEvents.map((event) => (
                  <ListItem key={event.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: event.type === 'agent' ? '#3B82F6' : '#10B981' }}>
                        {event.speaker?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={event.speaker}
                      secondary={event.text}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.85rem' }}
                    />
                    {event.type === 'agent' && (
                      <IconButton size="small" color="primary">
                        <VolumeIcon />
                      </IconButton>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={endCall} color="error">
            End Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserInterview;

