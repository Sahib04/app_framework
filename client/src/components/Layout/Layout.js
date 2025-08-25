import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  School,
  People,
  Assignment,
  Grade,
  Schedule,
  Message,
  Event,
  Payment,
  Settings,
  AccountCircle,
  Notifications,
  Logout,
  Book,
  Group,
  Assessment,
  Receipt,
  VideoCall,
  Upload,
  Download
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Role-specific menu items
  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { text: 'Users', icon: <People />, path: '/users' },
          { text: 'Courses', icon: <Book />, path: '/courses' },
          { text: 'Classes', icon: <School />, path: '/classes' },
          { text: 'Attendance', icon: <Schedule />, path: '/attendance' },
          { text: 'Grades', icon: <Grade />, path: '/grades' },
          { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
          { text: 'Messages', icon: <Message />, path: '/messages' },
          { text: 'Events', icon: <Event />, path: '/events' },
          { text: 'Fees', icon: <Payment />, path: '/fees' },
          { text: 'Reports', icon: <Assessment />, path: '/reports' },
          { text: 'Settings', icon: <Settings />, path: '/settings' }
        ];

      case 'teacher':
        return [
          ...baseItems,
          { text: 'My Classes', icon: <School />, path: '/classes' },
          { text: 'Students', icon: <People />, path: '/students' },
          { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
          { text: 'Grades', icon: <Grade />, path: '/grades' },
          { text: 'Attendance', icon: <Schedule />, path: '/attendance' },
          { text: 'Messages', icon: <Message />, path: '/messages' },
          { text: 'Resources', icon: <Upload />, path: '/resources' },
          { text: 'Video Calls', icon: <VideoCall />, path: '/video-calls' },
          { text: 'Reports', icon: <Assessment />, path: '/reports' }
        ];

      case 'student':
        return [
          ...baseItems,
          { text: 'My Courses', icon: <Book />, path: '/courses' },
          { text: 'Assignments', icon: <Assignment />, path: '/assignments' },
          { text: 'Grades', icon: <Grade />, path: '/grades' },
          { text: 'Schedule', icon: <Schedule />, path: '/schedule' },
          { text: 'Messages', icon: <Message />, path: '/messages' },
          { text: 'Events', icon: <Event />, path: '/events' },
          { text: 'Resources', icon: <Download />, path: '/resources' },
          { text: 'Video Classes', icon: <VideoCall />, path: '/video-classes' }
        ];

      case 'parent':
        return [
          ...baseItems,
          { text: 'Children', icon: <People />, path: '/children' },
          { text: 'Grades', icon: <Grade />, path: '/grades' },
          { text: 'Attendance', icon: <Schedule />, path: '/attendance' },
          { text: 'Messages', icon: <Message />, path: '/messages' },
          { text: 'Payments', icon: <Payment />, path: '/payments' },
          { text: 'Events', icon: <Event />, path: '/events' },
          { text: 'Reports', icon: <Assessment />, path: '/reports' },
          { text: 'Receipts', icon: <Receipt />, path: '/receipts' }
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          School Management
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
          </Typography>
          
          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {children}
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
