import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip,
  TextField,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SmartToy as AgentsIcon,
  Chat as ChatIcon,
  Feedback as FeedbackIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  FolderOpen as ProjectsIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationsIcon,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const drawerWidth = 80; // Narrow sidebar like the design

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#1E293B',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  borderBottom: '1px solid #E2E8F0',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: '#1E293B', // Dark sidebar
    borderRight: 'none',
    boxShadow: 'none',
  },
}));

const Main = styled('main')(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: open ? 0 : `-${drawerWidth}px`,
  backgroundColor: '#F8FAFC', // Light gray background
  minHeight: '100vh',
  [theme.breakpoints.up('sm')]: {
    marginLeft: 0,
  },
}));

const SidebarIcon = styled(IconButton)(({ theme, active }) => ({
  width: 48,
  height: 48,
  margin: theme.spacing(1),
  backgroundColor: active ? '#FFFFFF' : 'transparent',
  color: active ? '#1E293B' : '#FFFFFF',
  borderRadius: '50%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
  },
}));

const M3Layout = ({ children, user, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    onLogout();
    handleProfileMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', badge: null },
    { text: 'Generate Agents', icon: <AgentsIcon />, path: '/generate', badge: null },
    { text: 'Agent Library', icon: <AgentsIcon />, path: '/agents', badge: '12' },
    { text: 'Group Chat', icon: <ChatIcon />, path: '/group-chat', badge: null },
    { text: 'Design Feedback', icon: <FeedbackIcon />, path: '/design-feedback', badge: null },
    { text: 'Projects', icon: <ProjectsIcon />, path: '/projects', badge: '3' },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
      {menuItems.map((item, index) => (
        <SidebarIcon
          key={item.text}
          active={location.pathname === item.path}
          onClick={() => {
            navigate(item.path);
            if (isMobile) setMobileOpen(false);
          }}
          sx={{ mb: 1 }}
        >
          {item.icon}
        </SidebarIcon>
      ))}
      
      {/* Bottom icons */}
      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SidebarIcon sx={{ mb: 1 }}>
          <Settings />
        </SidebarIcon>
        <SidebarIcon>
          <AccountIcon />
        </SidebarIcon>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" open={mobileOpen}>
        <Toolbar sx={{ px: 3 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
                 <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
                   <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
                     Projects
                   </Typography>
                   <TextField
                     placeholder="Q Search by project name"
                     variant="outlined"
                     size="small"
                     sx={{ 
                       minWidth: 300,
                       '& .MuiOutlinedInput-root': {
                         backgroundColor: '#F8FAFC',
                       }
                     }}
                   />
                 </Box>
          
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <Box sx={{ display: 'flex', gap: 1 }}>
                     {['All', 'Current', 'Finished', 'On Hold', 'Archive'].map((tab) => (
                       <Button
                         key={tab}
                         variant={tab === 'All' || tab === 'Current' ? 'contained' : 'text'}
                         sx={{
                           textTransform: 'none',
                           fontWeight: 500,
                           px: 2,
                           py: 1,
                           minWidth: 'auto',
                           backgroundColor: tab === 'All' || tab === 'Current' ? '#1E293B' : 'transparent',
                           color: tab === 'All' || tab === 'Current' ? '#FFFFFF' : '#64748B',
                           '&:hover': {
                             backgroundColor: tab === 'All' || tab === 'Current' ? '#0F172A' : '#F8FAFC',
                           }
                         }}
                       >
                         {tab}
                       </Button>
                     ))}
                   </Box>
                   
                   <TextField
                     select
                     value="time"
                     size="small"
                     sx={{ minWidth: 150 }}
                   >
                     <MenuItem value="time">Sort by time expire</MenuItem>
                   </TextField>
                   
                   <Box sx={{ display: 'flex', gap: 1 }}>
                     <IconButton size="small" sx={{ backgroundColor: '#F8FAFC' }}>
                       <DashboardIcon />
                     </IconButton>
                     <IconButton size="small" sx={{ backgroundColor: '#F8FAFC' }}>
                       <DashboardIcon />
                     </IconButton>
                     <IconButton size="small" sx={{ backgroundColor: '#F8FAFC' }}>
                       <DashboardIcon />
                     </IconButton>
                   </Box>
                   
                   <Typography variant="body2" sx={{ color: '#64748B', mr: 1 }}>
                     {user?.name || 'Timothee'}
                   </Typography>
                   <Avatar 
                     sx={{ 
                       width: 32, 
                       height: 32, 
                       backgroundColor: '#3B82F6',
                       cursor: 'pointer'
                     }}
                     onClick={handleProfileMenuOpen}
                   >
                     {user?.name?.charAt(0) || 'T'}
                   </Avatar>
                 </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #E2E8F0',
                mt: 1,
              }
            }}
          >
            <MenuItem onClick={handleProfileMenuClose} sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <StyledDrawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </StyledDrawer>
      </Box>
      
      <Main open={!isMobile}>
        <Toolbar />
        {children}
      </Main>
    </Box>
  );
};

export default M3Layout;
