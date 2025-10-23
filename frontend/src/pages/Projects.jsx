import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Box,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Fade,
  Grow,
} from '@mui/material';
import {
  AddCircleOutline,
  FolderOpen,
  DeleteOutline,
  TrendingUp,
  People,
  DesignServices,
  Code,
  Psychology,
  Palette,
  BugReport,
  FileDownload,
  MoreVert,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-4px)',
  },
}));

const CreateCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
  border: '2px dashed #E2E8F0',
  backgroundColor: '#F8FAFC',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: '#2563EB',
    backgroundColor: '#F1F5F9',
    transform: 'translateY(-2px)',
  },
}));

const StageIcon = ({ stageId }) => {
  const icons = {
    'product-thinking': <TrendingUp />,
    'user-research': <People />,
    'ux-design': <DesignServices />,
    'ui-design': <Palette />,
    'ux-content': <Psychology />,
    'visual-design': <Palette />,
    'visual-testing': <BugReport />,
    'code-export': <Code />,
  };
  return icons[stageId] || <FileDownload />;
};

const Projects = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem('avinci_projects')) || [];
    setProjects(storedProjects);
  }, []);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      setIsCreating(true);
      const newProject = {
        id: uuidv4(),
        name: newProjectName.trim(),
        createdAt: new Date().toISOString(),
        stages: {
          'product-thinking': { status: 'pending', progress: 0 },
          'user-research': { status: 'pending', progress: 0 },
          'ux-design': { status: 'pending', progress: 0 },
          'ui-design': { status: 'pending', progress: 0 },
          'ux-content': { status: 'pending', progress: 0 },
          'visual-design': { status: 'pending', progress: 0 },
          'visual-testing': { status: 'pending', progress: 0 },
          'code-export': { status: 'pending', progress: 0 },
        }
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('avinci_projects', JSON.stringify(updatedProjects));
      setNewProjectName('');
      setIsCreating(false);
      navigate(`/projects/${newProject.id}`);
    }
  };

  const handleDeleteProject = (projectId, event) => {
    event.stopPropagation();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('avinci_projects', JSON.stringify(updatedProjects));
  };

  const getProjectProgress = (project) => {
    const stages = Object.values(project.stages || {});
    const completedStages = stages.filter(s => s.status === 'completed').length;
    return Math.round((completedStages / stages.length) * 100);
  };

  const getProjectStatus = (project) => {
    const progress = getProjectProgress(project);
    if (progress === 100) return { label: 'Completed', color: '#10B981' };
    if (progress > 0) return { label: 'In Progress', color: '#F59E0B' };
    return { label: 'Not Started', color: '#64748B' };
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#0F172A' }}>
          My Projects
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Manage your AI-driven UX design projects
        </Typography>
      </Box>

      {/* Create Project Card */}
      <CreateCard sx={{ mb: 6, p: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar sx={{ backgroundColor: '#2563EB', width: 48, height: 48 }}>
              <AddCircleOutline />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#0F172A' }}>
                Create New Project
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a new AI-powered UX design workflow
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              label="Project Name"
              placeholder="e.g., Money View Loan UX Redesign"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              variant="outlined"
              sx={{ flexGrow: 1 }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <Button
              variant="contained"
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || isCreating}
              startIcon={<AddCircleOutline />}
              sx={{
                background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                minWidth: 140,
              }}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </Box>
        </CardContent>
      </CreateCard>

      {/* Projects Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: '#0F172A' }}>
          Existing Projects
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {projects.length} project{projects.length !== 1 ? 's' : ''} total
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 3,
              }}
            >
              <FolderOpen sx={{ fontSize: 64, color: '#94A3B8', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: '#64748B' }}>
                No projects created yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by creating your first project above to begin the AI-driven UX design process.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          projects.map((project, index) => {
            const progress = getProjectProgress(project);
            const status = getProjectStatus(project);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Grow in timeout={300 + index * 100}>
                  <ModernCard onClick={() => navigate(`/projects/${project.id}`)}>
                    <CardContent sx={{ p: 3 }}>
                      {/* Project Header */}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                          <Avatar sx={{ backgroundColor: '#2563EB', width: 40, height: 40 }}>
                            <FolderOpen />
                          </Avatar>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              component="div" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#0F172A',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {project.name}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          sx={{ 
                            color: '#EF4444',
                            '&:hover': { backgroundColor: '#FEF2F2' }
                          }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Status and Progress */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              backgroundColor: `${status.color}20`,
                              color: status.color,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {progress}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 6,
                            backgroundColor: '#F1F5F9',
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: status.color,
                              transition: 'width 0.3s ease-in-out',
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Stage Icons */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 1, display: 'block' }}>
                          Stages
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {Object.keys(project.stages || {}).map((stageId) => (
                            <Avatar
                              key={stageId}
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: project.stages[stageId]?.status === 'completed' ? '#10B981' : '#E2E8F0',
                                color: project.stages[stageId]?.status === 'completed' ? 'white' : '#64748B',
                              }}
                            >
                              <StageIcon stageId={stageId} />
                            </Avatar>
                          ))}
                        </Box>
                      </Box>

                      {/* Created Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: '#94A3B8' }} />
                        <Typography variant="caption" color="text.secondary">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </ModernCard>
                </Grow>
              </Grid>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default Projects;



