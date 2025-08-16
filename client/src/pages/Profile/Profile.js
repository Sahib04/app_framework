import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Paper,
  Alert,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  FormGroup,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Assignment as AssignmentIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || 'No bio available.',
    dateOfBirth: user?.dateOfBirth || '',
    emergencyContact: user?.emergencyContact || '',
    emergencyPhone: user?.emergencyPhone || ''
  });

  // Mock data - replace with actual API calls
  const userStats = {
    coursesEnrolled: 5,
    assignmentsCompleted: 23,
    averageGrade: 3.8,
    attendanceRate: 94,
    messagesUnread: 3,
    upcomingEvents: 2
  };

  const recentActivity = [
    {
      id: 1,
      type: 'assignment',
      title: 'Submitted Calculus Assignment',
      time: '2 hours ago',
      icon: <AssignmentIcon />,
      color: 'success'
    },
    {
      id: 2,
      type: 'grade',
      title: 'Received grade for Physics Quiz',
      time: '1 day ago',
      icon: <GradeIcon />,
      color: 'primary'
    },
    {
      id: 3,
      type: 'course',
      title: 'Enrolled in Advanced Mathematics',
      time: '3 days ago',
      icon: <BookIcon />,
      color: 'info'
    }
  ];

  const notifications = [
    { id: 1, title: 'New assignment posted', time: '1 hour ago', read: false },
    { id: 2, title: 'Grade updated for Math test', time: '2 hours ago', read: false },
    { id: 3, title: 'Parent-teacher meeting reminder', time: '1 day ago', read: true }
  ];

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      updateProfile(profileData);
    }
    setEditMode(!editMode);
  };

  const handleCancelEdit = () => {
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || 'No bio available.',
      dateOfBirth: user?.dateOfBirth || '',
      emergencyContact: user?.emergencyContact || '',
      emergencyPhone: user?.emergencyPhone || ''
    });
    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'teacher': return 'primary';
      case 'student': return 'success';
      case 'parent': return 'warning';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <SettingsIcon />;
      case 'teacher': return <SchoolIcon />;
      case 'student': return <BookIcon />;
      case 'parent': return <PeopleIcon />;
      default: return <PersonIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          {/* Profile Card */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'primary.main', color: 'white', width: 24, height: 24 }}
                    onClick={handleOpenDialog}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Avatar
                  src={user?.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </Badge>
              
              <Typography variant="h5" component="h2" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              
              <Chip
                label={user?.role}
                color={getRoleColor(user?.role)}
                icon={getRoleIcon(user?.role)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user?.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <BookIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${userStats.coursesEnrolled} Courses`}
                    secondary="Currently enrolled"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${userStats.assignmentsCompleted} Assignments`}
                    secondary="Completed this semester"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GradeIcon color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${userStats.averageGrade} GPA`}
                    secondary="Current average"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ScheduleIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${userStats.attendanceRate}% Attendance`}
                    secondary="This semester"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Notifications
                </Typography>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="primary">
                  <NotificationsIcon />
                </Badge>
              </Box>
              <List dense>
                {notifications.slice(0, 3).map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={notification.title}
                      secondary={notification.time}
                      primaryTypographyProps={{
                        fontWeight: notification.read ? 'normal' : 'bold'
                      }}
                    />
                    {!notification.read && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Main Content */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Personal Info" />
                <Tab label="Academic" />
                <Tab label="Settings" />
                <Tab label="Activity" />
              </Tabs>
            </Box>
          </Card>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Personal Information
                  </Typography>
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={handleEditToggle}
                  >
                    {editMode ? 'Save' : 'Edit'}
                  </Button>
                </Box>

                {editMode && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You are in edit mode. Make your changes and click Save to update your profile.
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!editMode}
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!editMode}
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      value={profileData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!editMode}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Emergency Contact"
                      value={profileData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Emergency Phone"
                      value={profileData.emergencyPhone}
                      onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Academic Information
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Current Semester
                        </Typography>
                        <Typography variant="h4" color="primary">
                          Fall 2024
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Progress: 60% Complete
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={60}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Overall GPA
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {userStats.averageGrade}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Academic Standing: Good
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Academic Activity
                  </Typography>
                  <List>
                    {recentActivity.map((activity) => (
                      <ListItem key={activity.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${activity.color}.main` }}>
                            {activity.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.title}
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Settings
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Academic Updates"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Marketing Communications"
                  />
                </FormGroup>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Privacy Settings
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Profile Visibility"
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Academic Records Visibility"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Contact Information Visibility"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                
                <Timeline>
                  {recentActivity.map((activity, index) => (
                    <TimelineItem key={activity.id}>
                      <TimelineSeparator>
                        <TimelineDot color={activity.color}>
                          {activity.icon}
                        </TimelineDot>
                        {index < recentActivity.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Change Avatar Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a new profile picture to personalize your account.
          </Typography>
          {/* Add file upload component here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Upload Picture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
