import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const VerifyEmail = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper sx={{ p: 4, maxWidth: 400 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verify Email
        </Typography>
        <Typography variant="body1">
          Email verification page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
