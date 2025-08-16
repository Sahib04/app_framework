import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  People,
  School,
  AttachMoney,
  Assessment,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  Person,
  Group,
  Book,
  Schedule,
  Notifications,
  Settings,
  Dashboard as DashboardIcon,
  BarChart,
  PieChart,
  LineChart
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 1250,
    totalTeachers: 85,
    totalCourses: 45,
    totalRevenue: 1250000,
    monthlyGrowth: 12.5,
    activeUsers: 890
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user', action: 'New student registered', user: 'Alice Johnson', time: '2 minutes ago' },
    { id: 2, type: 'course', action: 'Course created', user: 'Dr. Smith', time: '15 minutes ago' },
    { id: 3, type: 'payment', action: 'Payment received', user: 'Bob Wilson', time: '1 hour ago' },
    { id: 4, type: 'user', action: 'Teacher profile updated', user: 'Prof. Davis', time: '2 hours ago' }
  ]);

  const [quickActions, setQuickActions] = useState([
    { title: 'Add New Student', icon: <Person />, color: '#4CAF50', action: 'add-student' },
    { title: 'Create Course', icon: <Book />, color: '#2196F3', action: 'create-course' },
    { title: 'Assign Teacher', icon: <Group />, color: '#FF9800', action: 'assign-teacher' },
    { title: 'Generate Report', icon: <Assessment />, color: '#9C27B0', action: 'generate-report' }
  ]);

  const [systemHealth, setSystemHealth] = useState({
    serverStatus: 'Online',
    databaseStatus: 'Healthy',
    storageUsage: 75,
    activeConnections: 234
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  const handleQuickAction = (action) => {
    setDialogType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ color: '#4CAF50', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="body2" color={trend > 0 ? '#4CAF50' : '#f44336'}>
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }) => (
    <ListItem sx={{ px: 0 }}>
      <ListItemIcon>
        <Avatar sx={{ 
          bgcolor: activity.type === 'user' ? '#4CAF50' : 
                   activity.type === 'course' ? '#2196F3' : '#FF9800',
          width: 32,
          height: 32
        }}>
          {activity.type === 'user' ? <Person /> : 
           activity.type === 'course' ? <Book /> : <AttachMoney />}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={activity.action}
        secondary={`${activity.user} • ${activity.time}`}
      />
    </ListItem>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your school management system today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            icon={<People />}
            color="#4CAF50"
            trend={8.2}
            subtitle="Active enrollments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={<Group />}
            color="#2196F3"
            trend={5.1}
            subtitle="Active faculty"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<Book />}
            color="#FF9800"
            trend={-2.3}
            subtitle="Available courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={<AttachMoney />}
            color="#9C27B0"
            trend={15.7}
            subtitle="This academic year"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ color: action.color, mb: 1 }}>
                        {action.icon}
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {action.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Activities
              </Typography>
              <IconButton size="small">
                <Notifications />
              </IconButton>
            </Box>
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </List>
            <Button fullWidth sx={{ mt: 2 }} variant="outlined">
              View All Activities
            </Button>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              System Health
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Server Status</Typography>
                <Chip 
                  label={systemHealth.serverStatus} 
                  color="success" 
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Database</Typography>
                <Chip 
                  label={systemHealth.databaseStatus} 
                  color="success" 
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Active Connections</Typography>
                <Typography variant="body2" color="primary">
                  {systemHealth.activeConnections}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Storage Usage</Typography>
                <Typography variant="body2">{systemHealth.storageUsage}%</Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={systemHealth.storageUsage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Button fullWidth variant="outlined" startIcon={<Settings />}>
              System Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'add-student' && 'Add New Student'}
          {dialogType === 'create-course' && 'Create New Course'}
          {dialogType === 'assign-teacher' && 'Assign Teacher'}
          {dialogType === 'generate-report' && 'Generate Report'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'add-student' && (
            <Box sx={{ pt: 2 }}>
              <TextField fullWidth label="First Name" margin="normal" />
              <TextField fullWidth label="Last Name" margin="normal" />
              <TextField fullWidth label="Email" margin="normal" type="email" />
              <TextField fullWidth label="Phone" margin="normal" />
              <FormControl fullWidth margin="normal">
                <InputLabel>Grade</InputLabel>
                <Select label="Grade">
                  <MenuItem value="9">Grade 9</MenuItem>
                  <MenuItem value="10">Grade 10</MenuItem>
                  <MenuItem value="11">Grade 11</MenuItem>
                  <MenuItem value="12">Grade 12</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {dialogType === 'create-course' && (
            <Box sx={{ pt: 2 }}>
              <TextField fullWidth label="Course Name" margin="normal" />
              <TextField fullWidth label="Course Code" margin="normal" />
              <TextField fullWidth label="Description" margin="normal" multiline rows={3} />
              <FormControl fullWidth margin="normal">
                <InputLabel>Subject</InputLabel>
                <Select label="Subject">
                  <MenuItem value="math">Mathematics</MenuItem>
                  <MenuItem value="science">Science</MenuItem>
                  <MenuItem value="english">English</MenuItem>
                  <MenuItem value="history">History</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {dialogType === 'assign-teacher' && (
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Teacher</InputLabel>
                <Select label="Teacher">
                  <MenuItem value="1">Dr. Smith</MenuItem>
                  <MenuItem value="2">Prof. Davis</MenuItem>
                  <MenuItem value="3">Ms. Johnson</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Course</InputLabel>
                <Select label="Course">
                  <MenuItem value="1">Advanced Mathematics</MenuItem>
                  <MenuItem value="2">Physics</MenuItem>
                  <MenuItem value="3">English Literature</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {dialogType === 'generate-report' && (
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Report Type</InputLabel>
                <Select label="Report Type">
                  <MenuItem value="student">Student Performance</MenuItem>
                  <MenuItem value="financial">Financial Report</MenuItem>
                  <MenuItem value="attendance">Attendance Report</MenuItem>
                  <MenuItem value="course">Course Analytics</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Date Range" margin="normal" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {dialogType === 'add-student' && 'Add Student'}
            {dialogType === 'create-course' && 'Create Course'}
            {dialogType === 'assign-teacher' && 'Assign Teacher'}
            {dialogType === 'generate-report' && 'Generate Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default AdminDashboard;
