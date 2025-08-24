import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TeacherTestView from './TeacherTestView';
import StudentTestView from './StudentTestView';
import AdminTestView from './AdminTestView';

const Tests = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  // Determine which view to show based on user role
  const renderView = () => {
    if (user?.role === 'teacher') {
      return <TeacherTestView />;
    } else if (user?.role === 'student') {
      return <StudentTestView />;
    } else if (user?.role === 'admin') {
      return <AdminTestView />;
    } else {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Access denied. Only teachers, students, and admins can view tests.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Test Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {user?.role === 'teacher' && 'Create and manage tests for your students'}
          {user?.role === 'student' && 'View and take tests assigned by your teachers'}
          {user?.role === 'admin' && 'Monitor all tests and student performance'}
        </Typography>
      </Box>

      {renderView()}
    </Container>
  );
};

export default Tests;
