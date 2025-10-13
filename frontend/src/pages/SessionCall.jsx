import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause,
  Download,
  People,
  Person,
  Timer,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SessionCall = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playbackActive, setPlaybackActive] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [playbackInterval, setPlaybackInterval] = useState(null);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (session && !playbackActive) {
      // Show all messages initially if not in playback mode
      setVisibleMessages(session.log_json.length);
    }
  }, [session]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`http://localhost:9001/api/sessions/${sessionId}`);
      setSession(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching session:', error);
      setLoading(false);
    }
  };

  const startPlayback = () => {
    setPlaybackActive(true);
    setVisibleMessages(0);

    const interval = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev >= session.log_json.length) {
          clearInterval(interval);
          setPlaybackActive(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // 2 seconds per message

    setPlaybackInterval(interval);
  };

  const stopPlayback = () => {
    if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    setPlaybackActive(false);
    setVisibleMessages(session.log_json.length);
  };

  const exportTranscript = () => {
    const transcript = session.log_json
      .map((msg) => {
        const action = msg.action ? ` ${msg.action}` : '';
        return `[${msg.speaker}${action}]: ${msg.text}`;
      })
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${sessionId}-transcript.txt`;
    a.click();
  };

  const getAvatarColor = (speaker) => {
    if (speaker === 'Moderator') return '#10B981';
    const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];
    const hash = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Session not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/user-research')}
          sx={{ mb: 2 }}
        >
          Back to Sessions
        </Button>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                {session.topic}
              </Typography>
              <Chip
                label={session.type === 'group' ? 'Group Discussion' : '1:1 Interview'}
                icon={session.type === 'group' ? <People /> : <Person />}
                color="primary"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                icon={<Timer />}
                label={`${session.duration_minutes || 0} minutes`}
                size="small"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                {session.log_json.length} messages
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {!playbackActive ? (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={startPlayback}
                sx={{ backgroundColor: '#1E293B' }}
              >
                Playback
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Pause />}
                onClick={stopPlayback}
              >
                Stop
              </Button>
            )}
            <IconButton onClick={exportTranscript}>
              <Download />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Transcript */}
      <Card sx={{ borderRadius: 3, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {session.log_json.slice(0, visibleMessages).map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 2,
                  opacity: playbackActive && index === visibleMessages - 1 ? 0 : 1,
                  animation: playbackActive && index === visibleMessages - 1 ? 'fadeIn 0.5s forwards' : 'none',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: getAvatarColor(message.speaker),
                    width: 40,
                    height: 40,
                  }}
                >
                  {message.speaker.charAt(0)}
                </Avatar>

                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {message.speaker}
                    </Typography>
                    {message.action && (
                      <Typography variant="body2" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                        {message.action}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body1" sx={{ color: '#1E293B', lineHeight: 1.6 }}>
                    {message.text}
                  </Typography>
                  {message.timestamp && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            {playbackActive && visibleMessages < session.log_json.length && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>

          {visibleMessages >= session.log_json.length && !loading && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  End of session
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Insights Section (if available) */}
      {session.insights && (
        <Card sx={{ borderRadius: 3, boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', mt: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Key Insights
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', lineHeight: 1.8 }}>
              {session.insights}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default SessionCall;


