import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Register = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        <Typography variant="body1">
          Registration page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
