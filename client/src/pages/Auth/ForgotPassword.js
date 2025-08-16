import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ForgotPassword = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Forgot Password
        </Typography>
        <Typography variant="body1">
          Forgot password page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
