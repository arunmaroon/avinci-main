import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Tabs,
  Tab,
  InputAdornment,
  Badge,
} from '@mui/material';
import {
  Add,
  People,
  Person,
  PlayArrow,
  Close,
  CheckCircle,
  Phone,
  Search,
  FilterList,
  Check,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserResearch = () => {
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState('group');
  const [topic, setTopic] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Agent selection dialog state
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState(0);
  const [filteredAgents, setFilteredAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
    fetchRecentSessions();
  }, []);

  // Filter agents based on search and category
  useEffect(() => {
    let filtered = availableAgents;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterTab === 1) { // Recent
      filtered = filtered.slice(0, 10);
    } else if (filterTab === 2) { // Popular
      filtered = filtered.filter(agent => 
        agent.role?.toLowerCase().includes('manager') ||
        agent.role?.toLowerCase().includes('director') ||
        agent.role?.toLowerCase().includes('senior')
      );
    } else if (filterTab === 3) { // By Role
      const roles = [...new Set(availableAgents.map(a => a.role))];
      filtered = filtered.filter(agent => 
        roles.includes(agent.role)
      );
    }
    
    setFilteredAgents(filtered);
  }, [availableAgents, searchQuery, filterTab]);

  const fetchAgents = async () => {
    try {
      console.log('Fetching agents for User Research...');
      
      // Use the dedicated research-agents endpoint
      const response = await axios.get('http://localhost:9001/api/research-agents');
      
      if (response.data.success && response.data.agents) {
        const agents = response.data.agents;
        console.log(`✅ Loaded ${agents.length} agents from Agent Library (ai_agents table)`);
        
        setAvailableAgents(agents);

        if (agents.length === 0) {
          setError('No agents found in Agent Library. Please generate some agents first from the "Generate Agents" page.');
        }
      } else {
        console.warn('No agents returned from API');
        setError('No agents available. Please generate some agents first.');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
      
      // Show specific error message
      if (error.response) {
        setError(`Failed to load agents: ${error.response.data?.error || error.message}`);
      } else if (error.request) {
        setError('Backend server not responding. Please ensure the backend is running on port 9001.');
      } else {
        setError('Failed to load agents from Agent Library. Please try again.');
      }
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const response = await axios.get('http://localhost:9001/api/sessions?limit=5');
      setRecentSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleAgentToggle = (agent) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((a) => a.id === agent.id);
      if (exists) {
        return prev.filter((a) => a.id !== agent.id);
      } else {
        if (sessionType === '1on1' && prev.length >= 1) {
          return [agent];
        }
        if (sessionType === 'group' && prev.length >= 5) {
          setError('Maximum 5 agents allowed for group sessions');
          return prev;
        }
        return [...prev, agent];
      }
    });
    setError('');
  };

  const handleCreateSession = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for discussion');
      return;
    }

    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      return;
    }

    if (sessionType === '1on1' && selectedAgents.length !== 1) {
      setError('1:1 interview requires exactly one agent');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:9001/api/sessions/create', {
        type: sessionType,
        agentIds: selectedAgents.map((a) => a.id),
        topic: topic,
      });

      setSuccess('Session created successfully!');
      setTimeout(() => {
        navigate(`/user-research/session/${response.data.sessionId}`);
      }, 1000);
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSession = (sessionId) => {
    navigate(`/user-research/session/${sessionId}`);
  };

  const handleStartAudioCall = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for discussion');
      return;
    }

    if (selectedAgents.length === 0) {
      setError('Please select at least one agent');
      return;
    }

    if (sessionType === '1on1' && selectedAgents.length !== 1) {
      setError('1:1 interview requires exactly one agent');
      return;
    }

    try {
      // Test if audio services are available
      const response = await axios.post('http://localhost:9001/api/call/create', {
        agentIds: selectedAgents.map((a) => a.id),
        topic: topic,
        type: sessionType
      });

      // If successful, navigate to audio call
      navigate('/audio-call', {
        state: {
          agentIds: selectedAgents.map((a) => a.id),
          topic: topic,
          type: sessionType
        }
      });
    } catch (error) {
      if (error.response?.data?.audioEnabled === false) {
        setError('Audio calling is not available. Audio services (Twilio, Deepgram, ElevenLabs) need to be configured. See AUDIO_CALLING_QUICKSTART.md for setup instructions.');
      } else {
        setError('Failed to start audio call: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mb: 1 }}>
          User Research Sessions
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B' }}>
          Simulate user research sessions with AI agents for insights without scheduling real users
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Session Setup Card */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Create New Session
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
                  {success}
                </Alert>
              )}

              {/* Session Type */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Session Type</InputLabel>
                <Select
                  value={sessionType}
                  label="Session Type"
                  onChange={(e) => {
                    setSessionType(e.target.value);
                    setSelectedAgents([]);
                  }}
                >
                  <MenuItem value="group">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People />
                      <Box>
                        <Typography variant="body1">Group Discussion</Typography>
                        <Typography variant="caption" color="text.secondary">
                          2-5 agents discussing a topic
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="1on1">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person />
                      <Box>
                        <Typography variant="body1">1:1 Interview</Typography>
                        <Typography variant="caption" color="text.secondary">
                          In-depth interview with one agent
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Topic */}
              <TextField
                fullWidth
                label="Research Topic"
                placeholder="E.g., Mobile banking experience, Product feedback, Feature preferences"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                multiline
                rows={2}
                sx={{ mb: 3 }}
              />

              {/* Agent Selection */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Select Agents {sessionType === '1on1' ? '(1 required)' : '(2-5 required)'}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate('/generate')}
                    sx={{ textTransform: 'none' }}
                  >
                    Generate More Agents
                  </Button>
                </Box>

                {availableAgents.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No agents available. Please <strong>generate some agents</strong> first from the Agent Library, 
                    or visit the <strong>Generate Agents</strong> page.
                  </Alert>
                ) : (
                  <Box>
                    {/* Selected Agents Preview */}
                    {selectedAgents.length > 0 && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#475569' }}>
                          Selected Agents ({selectedAgents.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedAgents.map((agent) => (
                            <Chip
                              key={agent.id}
                              avatar={
                                <Avatar sx={{ width: 24, height: 24, backgroundColor: '#3B82F6' }}>
                                  {agent.avatar || agent.name?.charAt(0) || 'A'}
                                </Avatar>
                              }
                              label={agent.name}
                              onDelete={() => handleAgentToggle(agent)}
                              deleteIcon={<Close />}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Agent Selection Button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<People />}
                      onClick={() => setAgentDialogOpen(true)}
                      sx={{ 
                        py: 2, 
                        borderStyle: 'dashed',
                        borderColor: selectedAgents.length > 0 ? '#3B82F6' : '#CBD5E1',
                        color: selectedAgents.length > 0 ? '#3B82F6' : '#64748B',
                        '&:hover': {
                          borderColor: '#3B82F6',
                          backgroundColor: '#F8FAFC'
                        }
                      }}
                    >
                      {selectedAgents.length === 0 
                        ? `Choose ${sessionType === '1on1' ? '1 Agent' : '2-5 Agents'}`
                        : `${selectedAgents.length} Agent${selectedAgents.length > 1 ? 's' : ''} Selected`
                      }
                    </Button>
                  </Box>
                )}
              </Box>


              {/* Create Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                  onClick={handleCreateSession}
                  disabled={loading || selectedAgents.length === 0 || !topic.trim()}
                  sx={{
                    backgroundColor: '#1E293B',
                    '&:hover': { backgroundColor: '#0F172A' },
                    py: 1.5,
                  }}
                >
                  {loading ? 'Creating Session...' : 'Text Session'}
                </Button>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Phone />}
                  onClick={handleStartAudioCall}
                  disabled={selectedAgents.length === 0 || !topic.trim()}
                  sx={{
                    backgroundColor: '#2563EB',
                    '&:hover': { backgroundColor: '#1D4ED8' },
                    py: 1.5,
                  }}
                >
                  🎙️ Audio Call
                </Button>
              </Box>
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', textAlign: 'center', mt: 1 }}
              >
                Choose Text Session for chat or Audio Call for real-time voice conversation with Indian accents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sessions */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Sessions
              </Typography>

              {recentSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No sessions yet. Create your first one!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {recentSessions.map((session) => (
                    <Box
                      key={session.id}
                      sx={{
                        p: 2,
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#F8FAFC',
                        },
                      }}
                      onClick={() => handleViewSession(session.id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={session.type === 'group' ? 'Group' : '1:1'}
                          size="small"
                          icon={session.type === 'group' ? <People /> : <Person />}
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(session.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {session.topic}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.duration_minutes} min • {session.log_json?.length || 0} messages
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agent Selection Dialog */}
      <Dialog 
        open={agentDialogOpen} 
        onClose={() => setAgentDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, maxHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Select Agents
            </Typography>
            <Badge badgeContent={selectedAgents.length} color="primary">
              <Typography variant="body2" color="text.secondary">
                {sessionType === '1on1' ? '1 required' : '2-5 required'}
              </Typography>
            </Badge>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {/* Search and Filter */}
          <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0' }}>
            <TextField
              fullWidth
              placeholder="Search agents by name, role, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <Tabs 
              value={filterTab} 
              onChange={(e, newValue) => setFilterTab(newValue)}
              sx={{ minHeight: 'auto' }}
            >
              <Tab label="All" />
              <Tab label="Recent" />
              <Tab label="Popular" />
              <Tab label="By Role" />
            </Tabs>
          </Box>

          {/* Agent List */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {filteredAgents.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {searchQuery ? 'No agents found matching your search.' : 'No agents available.'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredAgents.map((agent) => {
                  const isSelected = selectedAgents.find(a => a.id === agent.id);
                  const canSelect = sessionType === '1on1' ? true : selectedAgents.length < 5 || isSelected;
                  
                  return (
                    <ListItem key={agent.id} disablePadding>
                      <ListItemButton
                        onClick={() => canSelect && handleAgentToggle(agent)}
                        disabled={!canSelect && !isSelected}
                        sx={{ 
                          px: 3, 
                          py: 2,
                          opacity: canSelect ? 1 : 0.5,
                          '&:hover': {
                            backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              backgroundColor: isSelected ? '#3B82F6' : '#E2E8F0',
                              color: isSelected ? 'white' : '#64748B'
                            }}
                          >
                            {agent.avatar || agent.name?.charAt(0) || 'A'}
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {agent.name}
                              </Typography>
                              {isSelected && (
                                <Check sx={{ color: '#3B82F6', fontSize: 20 }} />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {agent.role}
                              </Typography>
                              {agent.location && (
                                <Typography variant="caption" color="text.secondary">
                                  📍 {agent.location}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid #E2E8F0' }}>
          <Button 
            onClick={() => setAgentDialogOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setAgentDialogOpen(false)}
            variant="contained"
            disabled={selectedAgents.length < (sessionType === '1on1' ? 1 : 2)}
            sx={{ textTransform: 'none' }}
          >
            Done ({selectedAgents.length})
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserResearch;

