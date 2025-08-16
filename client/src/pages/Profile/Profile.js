import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Profile management page coming soon...
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile;
