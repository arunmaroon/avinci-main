import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  CheckCircleOutline,
  HourglassEmpty,
  CancelOutlined,
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Download,
  Upload,
  Settings,
  TrendingUp,
  People,
  DesignServices,
  Code,
  Psychology,
  Palette,
  BugReport,
  FileDownload,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  border: '1px solid #F3F4F6',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-1px)',
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'completed' && {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  }),
  ...(status === 'in_progress' && {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  }),
  ...(status === 'pending' && {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  }),
}));

const StageDashboard = () => {
  const { stageId, projectId } = useParams();
  const theme = useTheme();

  const stages = {
    'product-thinking': { 
      title: 'Product Thinking', 
      role: 'Product Manager', 
      color: '#2563EB',
      icon: <TrendingUp />,
      description: 'Define product vision, goals, and requirements with AI-powered insights.',
      tools: ['Grok 3', 'Perplexity', 'Analytics Integration']
    },
    'user-research': { 
      title: 'User Research', 
      role: 'UX Researcher', 
      color: '#10B981',
      icon: <People />,
      description: 'Conduct user interviews and analyze data to create comprehensive personas.',
      tools: ['Fireflies.ai', 'QoQo AI', 'Transcript Analysis']
    },
    'ux-design': { 
      title: 'UX Design', 
      role: 'UX Designer', 
      color: '#8B5CF6',
      icon: <DesignServices />,
      description: 'Create user flows, wireframes, and interactive prototypes.',
      tools: ['UX Pilot', 'Miro Assist', 'Journey Mapping']
    },
    'ui-design': { 
      title: 'UI Design', 
      role: 'UI Designer', 
      color: '#F59E0B',
      icon: <Palette />,
      description: 'Design high-fidelity interfaces and comprehensive design systems.',
      tools: ['Figma Magician', 'Midjourney', 'Component Library']
    },
    'ux-content': { 
      title: 'UX Content', 
      role: 'UX Writer', 
      color: '#06B6D4',
      icon: <Psychology />,
      description: 'Craft user-centric content and microcopy for optimal engagement.',
      tools: ['UX Writing Assistant', 'Acrolinx', 'Tone Analysis']
    },
    'visual-design': { 
      title: 'Visual Design', 
      role: 'Visual Designer', 
      color: '#EC4899',
      icon: <Palette />,
      description: 'Develop visual language, branding, and creative assets.',
      tools: ['Adobe Firefly', 'Coolors AI', 'Brand Guidelines']
    },
    'visual-testing': { 
      title: 'Visual Testing', 
      role: 'QA/UX Tester', 
      color: '#EF4444',
      icon: <BugReport />,
      description: 'Conduct usability testing and gather actionable feedback.',
      tools: ['Attention Insight', 'Maze AI', 'Heatmap Analysis']
    },
    'code-export': { 
      title: 'Code Export', 
      role: 'Developer', 
      color: '#10B981',
      icon: <Code />,
      description: 'Export production-ready code and development specifications.',
      tools: ['Fronty', 'Zeplin AI', 'Component Export']
    },
  };

  const stage = stages[stageId] || { 
    title: 'Unknown Stage', 
    role: '', 
    color: '#64748B',
    icon: <Settings />,
    description: 'This stage is not available.',
    tools: []
  };

  const project = useMemo(() => {
    const saved = JSON.parse(localStorage.getItem('avinci_projects') || '[]');
    return saved.find((p) => p.id === projectId);
  }, [projectId]);

  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [progress, setProgress] = useState(25);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Define project scope and objectives', completed: false },
    { id: 2, title: 'Identify key stakeholders and requirements', completed: false },
    { id: 3, title: 'Create initial project timeline', completed: false },
    { id: 4, title: 'Draft project artifacts and deliverables', completed: false },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleOutline color="success" />;
      case 'in_progress': return <HourglassEmpty color="warning" />;
      case 'pending': return <CancelOutlined color="action" />;
      default: return <HourglassEmpty color="action" />;
    }
  };

  const renderWorkspace = () => {
    switch (stageId) {
      case 'product-thinking':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0F172A' }}>
              AI-Powered PRD Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Describe your product idea and let AI generate a comprehensive Product Requirements Document.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Describe your product idea, target audience, and key features..."
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                sx={{
                  background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}CC 100%)`,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                }}
              >
                Generate PRD
              </Button>
              <Button variant="outlined" startIcon={<Refresh />}>
                Reset
              </Button>
            </Box>
          </Box>
        );
      case 'user-research':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#0F172A' }}>
              Persona Generator
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload interview transcripts or research data to generate detailed user personas.
            </Typography>
            <Paper
              sx={{
                p: 4,
                border: '2px dashed #E2E8F0',
                borderRadius: 2,
                textAlign: 'center',
                mb: 3,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: stage.color,
                  backgroundColor: `${stage.color}08`,
                },
              }}
            >
              <Upload sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                Drop files here or click to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports PDF, DOC, TXT files up to 10MB
              </Typography>
            </Paper>
            <Button
              variant="contained"
              startIcon={<People />}
              sx={{
                background: `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}CC 100%)`,
                borderRadius: 2,
                px: 3,
                py: 1.5,
              }}
            >
              Generate Personas
            </Button>
          </Box>
        );
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Settings sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Workspace Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This stage workspace is under development.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
             <Box sx={{ mb: 6 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                 <Avatar
                   sx={{
                     backgroundColor: stage.color,
                     width: 48,
                     height: 48,
                   }}
                 >
                   {stage.icon}
                 </Avatar>
                 <Box>
                   <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#1F2937' }}>
                     {stage.title}
                   </Typography>
                   <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                     {stage.role}
                   </Typography>
                 </Box>
               </Box>

               {project && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                   <Typography variant="body2" color="text.secondary">
                     Project:
                   </Typography>
                   <Chip
                     label={project.name}
                     size="small"
                     sx={{
                       backgroundColor: '#F3F4F6',
                       color: '#1F2937',
                       fontWeight: 500,
                     }}
                   />
                 </Box>
               )}

               <Typography variant="body1" color="text.secondary">
                 {stage.description}
               </Typography>
             </Box>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <ModernCard>
            <CardContent>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                       <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                         AI Tools
                       </Typography>
                       <StatusChip label="Active" status="completed" />
                     </Box>
                     <Box sx={{ mb: 2 }}>
                       {stage.tools.map((tool, index) => (
                         <Chip
                           key={index}
                           label={tool}
                           size="small"
                           sx={{
                             mr: 1,
                             mb: 1,
                             backgroundColor: '#F8FAFC',
                             color: '#6B7280',
                             fontWeight: 500,
                           }}
                         />
                       ))}
                     </Box>
                     <Button
                       variant="contained"
                       startIcon={<PlayArrow />}
                       sx={{
                         backgroundColor: stage.color,
                         borderRadius: 2,
                         width: '100%',
                         '&:hover': {
                           backgroundColor: stage.color,
                           opacity: 0.9,
                         },
                       }}
                     >
                       Run AI Assistant
                     </Button>
            </CardContent>
          </ModernCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ModernCard>
            <CardContent>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                       <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
                         Approval Process
                       </Typography>
                       {getStatusIcon(approvalStatus)}
                     </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Status: <strong>{approvalStatus.replace('_', ' ')}</strong>
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#F1F5F9',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stage.color,
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {progress}% Complete
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setApprovalStatus('completed');
                    setProgress(100);
                  }}
                  disabled={approvalStatus === 'completed'}
                  sx={{
                    backgroundColor: '#10B981',
                    '&:hover': { backgroundColor: '#059669' },
                    borderRadius: 2,
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setApprovalStatus('in_progress');
                    setProgress(50);
                  }}
                  disabled={approvalStatus === 'completed'}
                  sx={{ borderRadius: 2 }}
                >
                  In Progress
                </Button>
              </Box>
            </CardContent>
          </ModernCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <ModernCard>
            <CardContent>
                     <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}>
                       Tasks
                     </Typography>
              <Box sx={{ mb: 2 }}>
                {tasks.map((task) => (
                  <FormControlLabel
                    key={task.id}
                    control={
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        sx={{
                          '&.Mui-checked': {
                            color: stage.color,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>
                    }
                    sx={{ display: 'block', mb: 1 }}
                  />
                ))}
              </Box>
              <Button variant="text" size="small" sx={{ color: stage.color }}>
                Add New Task
              </Button>
            </CardContent>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Workspace */}
      <ModernCard>
        <CardContent sx={{ p: 4 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                   <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
                     {stage.title} Workspace
                   </Typography>
                   <Box sx={{ display: 'flex', gap: 1 }}>
                     <IconButton size="small" sx={{ backgroundColor: '#F3F4F6', '&:hover': { backgroundColor: '#E5E7EB' } }}>
                       <Download />
                     </IconButton>
                     <IconButton size="small" sx={{ backgroundColor: '#F3F4F6', '&:hover': { backgroundColor: '#E5E7EB' } }}>
                       <Upload />
                     </IconButton>
                     <IconButton size="small" sx={{ backgroundColor: '#F3F4F6', '&:hover': { backgroundColor: '#E5E7EB' } }}>
                       <Settings />
                     </IconButton>
                   </Box>
                 </Box>
          <Divider sx={{ mb: 3 }} />
          {renderWorkspace()}
        </CardContent>
      </ModernCard>
    </Container>
  );
};

export default StageDashboard;


