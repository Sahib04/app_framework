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
  Fab
} from '@mui/material';
import {
  Class,
  Assignment,
  Grade,
  Schedule,
  People,
  Book,
  Add,
  Edit,
  Visibility,
  Person,
  Group,
  VideoCall
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalClasses: 6,
    totalStudents: 180,
    averageGrade: 85.2,
    attendanceRate: 94.5
  };

  const classes = [
    { id: 1, name: 'Advanced Mathematics', time: '9:00 AM', students: 25, grade: 'A', attendance: 92 },
    { id: 2, name: 'Physics 101', time: '11:00 AM', students: 30, grade: 'B+', attendance: 88 },
    { id: 3, name: 'Calculus II', time: '2:00 PM', students: 20, grade: 'A-', attendance: 95 }
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
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
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
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
          Here's your teaching overview for today.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={<Class />}
            color="#4CAF50"
            subtitle="Active courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="#2196F3"
            subtitle="Enrolled students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Schedule />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Today's Classes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Today's Classes
              </Typography>
              <Button variant="contained" startIcon={<Add />}>
                Create Class
              </Button>
            </Box>

            {classes.map((classItem) => (
              <Card key={classItem.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {classItem.time} • {classItem.students} students
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={`Grade: ${classItem.grade}`} color="primary" size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {classItem.attendance}% attendance
                      </Typography>
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
                <ListItemText primary="Create Assignment" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText primary="Schedule Class" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Grade />
                </ListItemIcon>
                <ListItemText primary="Grade Assignments" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <VideoCall />
                </ListItemIcon>
                <ListItemText primary="Start Video Call" />
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

export default TeacherDashboard;
