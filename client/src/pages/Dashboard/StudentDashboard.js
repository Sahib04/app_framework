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
  LinearProgress,
  Fab,
  Badge
} from '@mui/material';
import {
  School,
  Assignment,
  Grade,
  Schedule,
  Book,
  Add,
  Edit,
  Visibility,
  Person,
  Group,
  Notifications,
  VideoCall,
  Upload,
  Download,
  CalendarToday,
  AccessTime,
  LocationOn,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalCourses: 6,
    averageGrade: 87.5,
    attendanceRate: 96.2,
    pendingAssignments: 3,
    completedAssignments: 24
  };

  const courses = [
    { id: 1, name: 'Advanced Mathematics', teacher: 'Dr. Smith', grade: 'A', attendance: 95, nextClass: '9:00 AM' },
    { id: 2, name: 'Physics 101', teacher: 'Prof. Davis', grade: 'B+', attendance: 92, nextClass: '11:00 AM' },
    { id: 3, name: 'English Literature', teacher: 'Ms. Johnson', grade: 'A-', attendance: 98, nextClass: '2:00 PM' }
  ];

  const assignments = [
    { id: 1, title: 'Calculus Quiz #3', course: 'Advanced Mathematics', dueDate: '2024-01-15', status: 'pending', progress: 0 },
    { id: 2, title: 'Physics Lab Report', course: 'Physics 101', dueDate: '2024-01-18', status: 'in-progress', progress: 60 },
    { id: 3, title: 'Essay Draft', course: 'English Literature', dueDate: '2024-01-20', status: 'completed', progress: 100 }
  ];

  const upcomingClasses = [
    { id: 1, name: 'Advanced Mathematics', time: '9:00 AM', date: 'Today', room: 'Room 201', teacher: 'Dr. Smith' },
    { id: 2, name: 'Physics 101', time: '11:00 AM', date: 'Today', room: 'Lab 105', teacher: 'Prof. Davis' },
    { id: 3, name: 'English Literature', time: '2:00 PM', date: 'Today', room: 'Room 203', teacher: 'Ms. Johnson' }
  ];

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
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
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend > 0 ? (
                  <TrendingUp sx={{ color: '#4CAF50', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="body2" color={trend > 0 ? '#4CAF50' : '#f44336'}>
                  {Math.abs(trend)}% from last week
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

  const CourseCard = ({ course }) => (
    <Card sx={{ mb: 2, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {course.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {course.teacher} • Next: {course.nextClass}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip label={`Grade: ${course.grade}`} color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {course.attendance}% attendance
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const AssignmentCard = ({ assignment }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {assignment.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {assignment.course} • Due: {assignment.dueDate}
            </Typography>
            <Chip 
              label={assignment.status} 
              color={assignment.status === 'completed' ? 'success' : assignment.status === 'in-progress' ? 'warning' : 'default'}
              size="small"
            />
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 100 }}>
            <Typography variant="h6" color="primary">
              {assignment.progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={assignment.progress}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      </CardContent>
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
          Here's your academic overview for today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#4CAF50"
            trend={2.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Schedule />}
            color="#2196F3"
            trend={1.5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Assignments"
            value={stats.pendingAssignments}
            icon={<Assignment />}
            color="#FF9800"
            subtitle="Due this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<Book />}
            color="#9C27B0"
            subtitle="Enrolled courses"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* My Courses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                My Courses
              </Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>

            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Paper>
        </Grid>

        {/* Assignments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Assignments
              </Typography>
              <Button variant="outlined" size="small">
                View All
              </Button>
            </Box>

            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </Paper>
        </Grid>

        {/* Today's Schedule */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Today's Schedule
            </Typography>

            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {classItem.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {classItem.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          {classItem.room}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {classItem.teacher}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Button variant="contained" size="small" startIcon={<VideoCall />}>
                        Join
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem button>
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="Submit Assignment" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText primary="View Schedule" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Grade />
                </ListItemIcon>
                <ListItemText primary="Check Grades" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <VideoCall />
                </ListItemIcon>
                <ListItemText primary="Join Class" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Upload />
                </ListItemIcon>
                <ListItemText primary="Upload Files" />
              </ListItem>
            </List>
          </Paper>

          {/* Notifications */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Notifications
              </Typography>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </Box>
            <List sx={{ p: 0 }}>
              <ListItem>
                <ListItemText 
                  primary="New assignment posted" 
                  secondary="Calculus Quiz #4 - Due in 3 days"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Grade updated" 
                  secondary="Physics Lab Report - A-"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Class reminder" 
                  secondary="English Literature - 2:00 PM today"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

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

export default StudentDashboard;
