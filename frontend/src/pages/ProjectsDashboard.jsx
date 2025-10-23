import React from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Fab,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  Add,
  Business,
  Code,
  Palette,
  Psychology,
  BugReport,
  TrendingUp,
  People,
  DesignServices,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ProjectCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  border: '1px solid #F1F5F9',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    transform: 'translateY(-1px)',
  },
}));

const ProjectIcon = styled(Box)(({ theme, color }) => ({
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '18px',
  fontWeight: 600,
}));

const ProjectsDashboard = () => {
  const projects = [
    {
      id: 1,
      name: 'Digital Ocean',
      description: ['Social Media Strategy', 'Social Media Branding'],
      progress: 56,
      dueDate: '3 days left',
      team: ['A', 'B'],
      icon: <Business />,
      color: '#1E293B',
      isDark: true,
    },
    {
      id: 2,
      name: 'IBM',
      description: ['Branding IBM Lab Company', 'Website Concept'],
      progress: 82,
      dueDate: '27.07.2019',
      team: ['C', 'D', 'E'],
      icon: <Code />,
      color: '#3B82F6',
    },
    {
      id: 3,
      name: 'Tipit',
      description: ['Branding Strategy', 'Social Media Strategy'],
      progress: 39,
      dueDate: '02.09.2019',
      team: ['F', 'G'],
      icon: <Palette />,
      color: '#10B981',
    },
    {
      id: 4,
      name: 'AskNed',
      description: ['Application Concept', 'Website Concept'],
      progress: 64,
      dueDate: '27.07.2019',
      team: ['H', 'I'],
      icon: <Psychology />,
      color: '#3B82F6',
    },
    {
      id: 5,
      name: 'Space 10',
      description: ['Space 10 XXX project', 'Social Media Posts'],
      progress: 97,
      dueDate: '27.07.2018',
      team: ['J', 'K', 'L'],
      icon: <TrendingUp />,
      color: '#3B82F6',
    },
    {
      id: 6,
      name: 'Flash',
      description: ['Magazine Concept', 'Flyer Concept'],
      progress: 7,
      dueDate: '27.07.2018',
      team: ['M', 'N', 'O'],
      icon: <DesignServices />,
      color: '#3B82F6',
    },
    {
      id: 7,
      name: 'Chorus',
      description: ['Social Media Strategy', 'Social Media Branding'],
      progress: 27,
      dueDate: '27.07.2019',
      team: ['P', 'Q', 'R'],
      icon: <BugReport />,
      color: '#F59E0B',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <ProjectCard
              sx={{
                backgroundColor: project.isDark ? '#1E293B' : '#FFFFFF',
                color: project.isDark ? '#FFFFFF' : '#1E293B',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <ProjectIcon color={project.color}>
                    {project.icon}
                  </ProjectIcon>
                  <IconButton size="small" sx={{ color: project.isDark ? '#FFFFFF' : '#64748B' }}>
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {project.name}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {project.description.map((desc, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        color: project.isDark ? '#94A3B8' : '#64748B',
                        mb: 0.5,
                      }}
                    >
                      {desc}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {project.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: project.isDark ? '#374151' : '#F1F5F9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: project.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: project.isDark ? '#94A3B8' : '#64748B',
                    }}
                  >
                    {project.dueDate}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {project.team.map((member, index) => (
                      <Avatar
                        key={index}
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: '0.75rem',
                          backgroundColor: project.color,
                        }}
                      >
                        {member}
                      </Avatar>
                    ))}
                  </Box>
                </Box>

                {project.isDark && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={project.dueDate}
                      size="small"
                      sx={{
                        backgroundColor: '#374151',
                        color: '#FFFFFF',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </ProjectCard>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#1E293B',
          '&:hover': {
            backgroundColor: '#0F172A',
          },
        }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default ProjectsDashboard;
