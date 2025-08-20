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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Radio,
  RadioGroup,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Storage as StorageIcon,
  Help as HelpIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [settings, setSettings] = useState({
    // Account Settings
    email: user?.email || '',
    phone: user?.phone || '',
    language: 'en',
    timezone: 'UTC',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    academicUpdates: true,
    marketingCommunications: false,
    eventReminders: true,
    gradeUpdates: true,
    assignmentDeadlines: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    academicRecordsVisibility: 'private',
    contactInfoVisibility: 'friends',
    allowMessages: true,
    showOnlineStatus: true,
    
    // Appearance Settings
    theme: 'light',
    fontSize: 'medium',
    colorScheme: 'default',
    compactMode: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  });

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    // Reset to original settings
    setEditMode(false);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'public': return 'success';
      case 'friends': return 'primary';
      case 'private': return 'warning';
      default: return 'default';
    }
  };

  const getThemeColor = (theme) => {
    switch (theme) {
      case 'light': return 'primary';
      case 'dark': return 'secondary';
      case 'auto': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your account preferences and system settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Navigation */}
        <Grid item xs={12} md={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings Categories
              </Typography>
              <List dense>
                <ListItem
                  button
                  selected={activeTab === 0}
                  onClick={() => setActiveTab(0)}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Account" />
                </ListItem>
                <ListItem
                  button
                  selected={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                >
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" />
                </ListItem>
                <ListItem
                  button
                  selected={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Privacy & Security" />
                </ListItem>
                <ListItem
                  button
                  selected={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                >
                  <ListItemIcon>
                    <PaletteIcon />
                  </ListItemIcon>
                  <ListItemText primary="Appearance" />
                </ListItem>
                <ListItem
                  button
                  selected={activeTab === 4}
                  onClick={() => setActiveTab(4)}
                >
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText primary="Language & Region" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Content */}
        <Grid item xs={12} md={9}>
          {/* Account Settings */}
          {activeTab === 0 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Account Settings
                  </Typography>
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                    onClick={editMode ? handleSaveSettings : () => setEditMode(true)}
                  >
                    {editMode ? 'Save Changes' : 'Edit'}
                  </Button>
                </Box>

                {editMode && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You are in edit mode. Make your changes and click Save Changes to update your settings.
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('email', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange('phone', e.target.value)}
                      disabled={!editMode}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={settings.language}
                        label="Language"
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        disabled={!editMode}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={settings.timezone}
                        label="Timezone"
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        disabled={!editMode}
                      >
                        <MenuItem value="UTC">UTC</MenuItem>
                        <MenuItem value="EST">Eastern Time</MenuItem>
                        <MenuItem value="CST">Central Time</MenuItem>
                        <MenuItem value="PST">Pacific Time</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {editMode && (
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Account Actions
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      startIcon={<SecurityIcon />}
                      onClick={() => handleOpenDialog('password')}
                      fullWidth
                    >
                      Change Password
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={() => handleOpenDialog('email')}
                      fullWidth
                    >
                      Change Email
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDialog('delete')}
                      fullWidth
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 1 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                    }
                    label="Push Notifications"
                  />
                </FormGroup>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Academic Notifications
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.academicUpdates}
                        onChange={(e) => handleSettingChange('academicUpdates', e.target.checked)}
                      />
                    }
                    label="Academic Updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.gradeUpdates}
                        onChange={(e) => handleSettingChange('gradeUpdates', e.target.checked)}
                      />
                    }
                    label="Grade Updates"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.assignmentDeadlines}
                        onChange={(e) => handleSettingChange('assignmentDeadlines', e.target.checked)}
                      />
                    }
                    label="Assignment Deadlines"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.eventReminders}
                        onChange={(e) => handleSettingChange('eventReminders', e.target.checked)}
                      />
                    }
                    label="Event Reminders"
                  />
                </FormGroup>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Marketing & Communications
                </Typography>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.marketingCommunications}
                        onChange={(e) => handleSettingChange('marketingCommunications', e.target.checked)}
                      />
                    }
                    label="Marketing Communications"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Security Settings */}
          {activeTab === 2 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Privacy & Security Settings
                </Typography>
                
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Profile Visibility</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      >
                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                        <FormControlLabel value="friends" control={<Radio />} label="Friends Only" />
                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                      </RadioGroup>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Academic Records</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={settings.academicRecordsVisibility}
                        onChange={(e) => handleSettingChange('academicRecordsVisibility', e.target.value)}
                      >
                        <FormControlLabel value="public" control={<Radio />} label="Public" />
                        <FormControlLabel value="friends" control={<Radio />} label="Friends Only" />
                        <FormControlLabel value="private" control={<Radio />} label="Private" />
                      </RadioGroup>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Security Features</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.twoFactorAuth}
                            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          />
                        }
                        label="Two-Factor Authentication"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.loginNotifications}
                            onChange={(e) => handleSettingChange('loginNotifications', e.target.checked)}
                          />
                        }
                        label="Login Notifications"
                      />
                    </FormGroup>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Session Timeout (minutes)
                      </Typography>
                      <Slider
                        value={settings.sessionTimeout}
                        onChange={(e, value) => handleSettingChange('sessionTimeout', value)}
                        min={15}
                        max={120}
                        step={15}
                        marks
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 3 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appearance & Display
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle1" gutterBottom>
                        Theme
                      </Typography>
                      <RadioGroup
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                      >
                        <FormControlLabel value="light" control={<Radio />} label="Light" />
                        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                        <FormControlLabel value="auto" control={<Radio />} label="Auto (System)" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle1" gutterBottom>
                        Font Size
                      </Typography>
                      <RadioGroup
                        value={settings.fontSize}
                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      >
                        <FormControlLabel value="small" control={<Radio />} label="Small" />
                        <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                        <FormControlLabel value="large" control={<Radio />} label="Large" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.compactMode}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                      />
                    }
                    label="Compact Mode"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          )}

          {/* Language & Region Settings */}
          {activeTab === 4 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Language & Regional Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Primary Language</InputLabel>
                      <Select
                        value={settings.language}
                        label="Primary Language"
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <MenuItem value="en">English (US)</MenuItem>
                        <MenuItem value="en-gb">English (UK)</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                        <MenuItem value="de">German</MenuItem>
                        <MenuItem value="it">Italian</MenuItem>
                        <MenuItem value="pt">Portuguese</MenuItem>
                        <MenuItem value="ru">Russian</MenuItem>
                        <MenuItem value="zh">Chinese</MenuItem>
                        <MenuItem value="ja">Japanese</MenuItem>
                        <MenuItem value="ko">Korean</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Time Zone</InputLabel>
                      <Select
                        value={settings.timezone}
                        label="Time Zone"
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      >
                        <MenuItem value="UTC">UTC (Coordinated Universal Time)</MenuItem>
                        <MenuItem value="EST">EST (Eastern Standard Time)</MenuItem>
                        <MenuItem value="CST">CST (Central Standard Time)</MenuItem>
                        <MenuItem value="MST">MST (Mountain Standard Time)</MenuItem>
                        <MenuItem value="PST">PST (Pacific Standard Time)</MenuItem>
                        <MenuItem value="GMT">GMT (Greenwich Mean Time)</MenuItem>
                        <MenuItem value="CET">CET (Central European Time)</MenuItem>
                        <MenuItem value="JST">JST (Japan Standard Time)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Date & Time Format
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <Typography variant="body2" gutterBottom>
                        Date Format
                      </Typography>
                      <RadioGroup defaultValue="mm/dd/yyyy">
                        <FormControlLabel value="mm/dd/yyyy" control={<Radio />} label="MM/DD/YYYY" />
                        <FormControlLabel value="dd/mm/yyyy" control={<Radio />} label="DD/MM/YYYY" />
                        <FormControlLabel value="yyyy-mm-dd" control={<Radio />} label="YYYY-MM-DD" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl component="fieldset">
                      <Typography variant="body2" gutterBottom>
                        Time Format
        </Typography>
                      <RadioGroup defaultValue="12h">
                        <FormControlLabel value="12h" control={<Radio />} label="12-hour (AM/PM)" />
                        <FormControlLabel value="24h" control={<Radio />} label="24-hour" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'password' && 'Change Password'}
          {dialogType === 'email' && 'Change Email Address'}
          {dialogType === 'delete' && 'Delete Account'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'password' && (
            <Box>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {dialogType === 'email' && (
            <Box>
              <TextField
                fullWidth
                type="email"
                label="New Email Address"
                sx={{ mb: 2, mt: 1 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          
          {dialogType === 'delete' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              This action cannot be undone. All your data will be permanently deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color={dialogType === 'delete' ? 'error' : 'primary'}
            onClick={handleCloseDialog}
          >
            {dialogType === 'delete' ? 'Delete Account' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
