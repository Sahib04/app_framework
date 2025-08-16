import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Grades = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Grades
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Grades management page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Grades;
