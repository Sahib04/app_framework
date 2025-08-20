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
  Class,
  Assignment,
  Grade,
  Schedule,
  Book,
  Add,
  Edit,
  Visibility,
  Person,
  Message,
  Event,
  Assessment,
  School,
  TrendingUp,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = {
    totalCourses: 6,
    assignmentsDue: 3,
    averageGrade: 87.5,
    attendanceRate: 96.2
  };

  const courses = [
    { id: 1, name: 'Advanced Mathematics', instructor: 'Dr. Sarah Johnson', grade: 'A-', progress: 85, nextClass: '9:00 AM' },
    { id: 2, name: 'Physics 101', instructor: 'Prof. Michael Chen', grade: 'B+', progress: 72, nextClass: '11:00 AM' },
    { id: 3, name: 'English Literature', instructor: 'Dr. Emily Davis', grade: 'A', progress: 90, nextClass: '2:00 PM' }
  ];

  const upcomingAssignments = [
    { id: 1, title: 'Calculus Problem Set 3', course: 'Advanced Mathematics', dueDate: '2024-02-15', status: 'Not Started' },
    { id: 2, title: 'Physics Lab Report', course: 'Physics 101', dueDate: '2024-02-18', status: 'In Progress' },
    { id: 3, title: 'Essay: Literary Analysis', course: 'English Literature', dueDate: '2024-02-20', status: 'Not Started' }
  ];

  // Feature navigation cards for students
  const featureCards = [
    {
      title: 'My Courses',
      description: 'View your enrolled courses, materials, and progress',
      icon: <Book />,
      color: '#4CAF50',
      path: '/courses',
      stats: `${stats.totalCourses} enrolled courses`
    },
    {
      title: 'Assignments',
      description: 'View and submit assignments, track deadlines',
      icon: <Assignment />,
      color: '#FF9800',
      path: '/assignments',
      stats: `${stats.assignmentsDue} due soon`
    },
    {
      title: 'Grades',
      description: 'Check your grades and academic performance',
      icon: <Grade />,
      color: '#9C27B0',
      path: '/grades',
      stats: `${stats.averageGrade}% average`
    },
    {
      title: 'Schedule',
      description: 'View your class schedule and upcoming sessions',
      icon: <Schedule />,
      color: '#2196F3',
      path: '/schedule',
      stats: 'Daily schedule'
    },
    {
      title: 'Communication',
      description: 'Send messages to teachers and classmates',
      icon: <Message />,
      color: '#00BCD4',
      path: '/messages',
      stats: 'Active conversations'
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
      title: 'Resources',
      description: 'Access course materials and study resources',
      icon: <School />,
      color: '#607D8B',
      path: '/resources',
      stats: 'Learning materials'
    },
    {
      title: 'Video Classes',
      description: 'Join online classes and virtual sessions',
      icon: <Class />,
      color: '#E91E63',
      path: '/video-classes',
      stats: 'Online learning'
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
      <Button size="small" color="primary" fullWidth>
        Access {title}
      </Button>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's your academic overview and quick access to all features.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<Book />}
            color="#4CAF50"
            subtitle="Enrolled courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assignments Due"
            value={stats.assignmentsDue}
            icon={<Assignment />}
            color="#FF9800"
            subtitle="Upcoming deadlines"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#9C27B0"
            subtitle="Academic performance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Schedule />}
            color="#2196F3"
            subtitle="Class attendance"
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
        {/* Current Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Current Courses
            </Typography>
            <Grid container spacing={2}>
              {courses.map((course) => (
                <Grid item xs={12} key={course.id}>
                  <Card>
                <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {course.name}
                      </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {course.instructor}
                        </Typography>
                      </Box>
                        <Chip label={course.grade} color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{course.progress}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={course.progress}
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        Next class: {course.nextClass}
                      </Typography>
                    </CardContent>
                    <Button size="small" variant="outlined" fullWidth>
                      View Course
                      </Button>
              </Card>
                </Grid>
            ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Upcoming Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Upcoming Assignments
            </Typography>
            <List sx={{ p: 0 }}>
              {upcomingAssignments.map((assignment) => (
                <ListItem key={assignment.id} sx={{ px: 0, mb: 2 }}>
                  <Card sx={{ width: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {assignment.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {assignment.course}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </Typography>
                        <Chip 
                          label={assignment.status} 
                          color={assignment.status === 'Not Started' ? 'error' : 'warning'} 
                          size="small"
                        />
            </Box>
                    </CardContent>
                    <Button size="small" variant="outlined" fullWidth>
                      View Assignment
                    </Button>
                  </Card>
              </ListItem>
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
                startIcon={<Assignment />}
                fullWidth
                onClick={() => navigate('/assignments')}
              >
                View Assignments
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Grade />}
                fullWidth
                onClick={() => navigate('/grades')}
              >
                Check Grades
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                fullWidth
                onClick={() => navigate('/schedule')}
              >
                View Schedule
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Message />}
                fullWidth
                onClick={() => navigate('/messages')}
              >
                Send Message
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
        onClick={() => navigate('/assignments')}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default StudentDashboard;
