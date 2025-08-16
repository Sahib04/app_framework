import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  IconButton,
  Fab,
  LinearProgress
} from '@mui/material';
import {
  People,
  Grade,
  Schedule,
  Message,
  Event,
  Payment,
  Assessment,
  School,
  TrendingUp,
  Notifications,
  Receipt,
  Book,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = {
    totalChildren: 2,
    totalCourses: 12,
    averageGrade: 88.5,
    attendanceRate: 94.8,
    outstandingFees: 250.00
  };

  const children = [
    { 
      id: 1, 
      name: 'Alex Johnson', 
      grade: '10th Grade', 
      courses: 6, 
      averageGrade: 90.2, 
      attendance: 96.5,
      image: 'https://source.unsplash.com/100x100/?student'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      grade: '8th Grade', 
      courses: 6, 
      averageGrade: 86.8, 
      attendance: 93.1,
      image: 'https://source.unsplash.com/100x100/?student-female'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'grade', title: 'Math Test Grade Updated', child: 'Alex Johnson', time: '2 hours ago', value: 'A-' },
    { id: 2, type: 'attendance', title: 'Attendance Marked', child: 'Sarah Johnson', time: '1 day ago', value: 'Present' },
    { id: 3, type: 'assignment', title: 'Science Project Due', child: 'Alex Johnson', time: '2 days ago', value: 'Due Soon' },
    { id: 4, type: 'payment', title: 'Fee Payment Received', child: 'Sarah Johnson', time: '1 week ago', value: '$150.00' }
  ];

  // Feature navigation cards for parents
  const featureCards = [
    {
      title: 'Children',
      description: 'View your children\'s profiles and academic information',
      icon: <People />,
      color: '#4CAF50',
      path: '/children',
      stats: `${stats.totalChildren} children`
    },
    {
      title: 'Grades',
      description: 'Monitor academic performance and progress reports',
      icon: <Grade />,
      color: '#9C27B0',
      path: '/grades',
      stats: `${stats.averageGrade}% average`
    },
    {
      title: 'Attendance',
      description: 'Track attendance records and patterns',
      icon: <Schedule />,
      color: '#2196F3',
      path: '/attendance',
      stats: `${stats.attendanceRate}% attendance`
    },
    {
      title: 'Communication',
      description: 'Send messages to teachers and administrators',
      icon: <Message />,
      color: '#00BCD4',
      path: '/messages',
      stats: 'Active conversations'
    },
    {
      title: 'Payments',
      description: 'Manage fees, payments, and financial records',
      icon: <Payment />,
      color: '#FF9800',
      path: '/payments',
      stats: `$${stats.outstandingFees} outstanding`
    },
    {
      title: 'Events',
      description: 'View school events and activities',
      icon: <Event />,
      color: '#8BC34A',
      path: '/events',
      stats: 'Upcoming events'
    },
    {
      title: 'Reports',
      description: 'Access academic and financial reports',
      icon: <Assessment />,
      color: '#607D8B',
      path: '/reports',
      stats: 'Analytics & insights'
    },
    {
      title: 'Receipts',
      description: 'View payment receipts and transaction history',
      icon: <Receipt />,
      color: '#E91E63',
      path: '/receipts',
      stats: 'Payment history'
    }
  ];

  const StatCard = ({ title, value, icon, color, subtitle, progress }) => (
    <Card sx={{ height: '100%' }}>
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
            {progress && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 4 }}
                />
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

  const FeatureCard = ({ title, description, icon, color, path, stats }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .feature-icon': {
            transform: 'scale(1.1)'
          }
        }
      }}
      onClick={() => navigate(path)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: color, 
              width: 48, 
              height: 48, 
              mr: 2,
              transition: 'transform 0.3s ease'
            }}
            className="feature-icon"
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" color="primary">
          Access {title}
        </Button>
      </Box>
    </Card>
  );

  const ActivityItem = ({ activity }) => (
    <ListItem sx={{ px: 0, mb: 2 }}>
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {activity.child} • {activity.time}
              </Typography>
            </Box>
            <Chip 
              label={activity.value} 
              color={
                activity.type === 'grade' ? 'primary' : 
                activity.type === 'attendance' ? 'success' : 
                activity.type === 'assignment' ? 'warning' : 'info'
              } 
              size="small"
            />
          </Box>
        </CardContent>
      </Card>
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
          Here's your overview of your children's academic progress and quick access to all features.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Children"
            value={stats.totalChildren}
            icon={<People />}
            color="#4CAF50"
            subtitle="Enrolled students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<Book />}
            color="#2196F3"
            subtitle="Combined courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#9C27B0"
            subtitle="Combined performance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Outstanding Fees"
            value={`$${stats.outstandingFees}`}
            icon={<Payment />}
            color="#FF9800"
            subtitle="Payment due"
          />
        </Grid>
      </Grid>

      {/* Feature Navigation Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Quick Access to Features
        </Typography>
        <Grid container spacing={3}>
          {featureCards.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Children Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Children Overview
            </Typography>
            <Grid container spacing={2}>
              {children.map((child) => (
                <Grid item xs={12} key={child.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar src={child.image} sx={{ mr: 2 }}>
                          {child.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {child.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {child.grade} • {child.courses} courses
                          </Typography>
                        </Box>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                              {child.averageGrade}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Average Grade
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main">
                              {child.attendance}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Attendance
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Activities
            </Typography>
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="contained"
                startIcon={<Grade />}
                fullWidth
                onClick={() => navigate('/grades')}
              >
                View Grades
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                fullWidth
                onClick={() => navigate('/attendance')}
              >
                Check Attendance
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Payment />}
                fullWidth
                onClick={() => navigate('/payments')}
              >
                Make Payment
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Message />}
                fullWidth
                onClick={() => navigate('/messages')}
              >
                Contact Teacher
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/messages')}
      >
        <Message />
      </Fab>
    </Container>
  );
};

export default ParentDashboard;
