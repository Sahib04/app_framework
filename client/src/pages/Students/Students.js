import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Students = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Students
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Students management page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Students;
