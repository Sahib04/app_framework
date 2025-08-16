import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Courses = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Courses
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Courses management page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Courses;
