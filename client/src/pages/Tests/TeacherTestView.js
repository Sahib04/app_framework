import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const TeacherTestView = () => {
  const { user, token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    totalMarks: '',
    duration: '',
    announcementDate: new Date(),
    conductDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    instructions: ''
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load tests');
      
      const data = await response.json();
      setTests(data.tests || []);
    } catch (err) {
      setError('Failed to load tests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!');
    console.log('Form data:', formData);
    
    // Client-side validation
    if (!formData.title.trim()) {
      console.log('Validation failed: Title is required');
      setError('Title is required');
      return;
    }
    if (!formData.subject) {
      console.log('Validation failed: Subject is required');
      setError('Subject is required');
      return;
    }
    if (!formData.topic.trim() || formData.topic.trim().length < 3) {
      console.log('Validation failed: Topic must be at least 3 characters');
      setError('Topic must be at least 3 characters');
      return;
    }
    if (!formData.totalMarks || formData.totalMarks < 1 || formData.totalMarks > 100) {
      console.log('Validation failed: Total marks must be between 1 and 100');
      setError('Total marks must be between 1 and 100');
      return;
    }
    if (!formData.duration || formData.duration < 15 || formData.duration > 300) {
      console.log('Validation failed: Duration must be between 15 and 300 minutes');
      setError('Duration must be between 15 and 300 minutes');
      return;
    }
    if (!formData.announcementDate || !formData.conductDate) {
      console.log('Validation failed: Both announcement and conduct dates are required');
      setError('Both announcement and conduct dates are required');
      return;
    }
    if (formData.conductDate <= formData.announcementDate) {
      console.log('Validation failed: Conduct date must be after announcement date');
      setError('Conduct date must be after announcement date');
      return;
    }
    
    console.log('Validation passed, proceeding with API call');
    
    try {
      const url = editMode ? `${API_BASE}/tests/${selectedTest.id}` : `${API_BASE}/tests`;
      const method = editMode ? 'PUT' : 'POST';
      
      console.log('API URL:', url);
      console.log('API Method:', method);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      // Prepare data for API - convert dates to ISO strings and ensure proper types
      const apiData = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        duration: parseInt(formData.duration),
        announcementDate: formData.announcementDate.toISOString(),
        conductDate: formData.conductDate.toISOString()
      };
      
      console.log('Submitting test data:', apiData);
      
      console.log('Making API request...');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || errorData.errors?.[0]?.msg || 'Failed to save test');
      }

      setSuccess(editMode ? 'Test updated successfully!' : 'Test created successfully!');
      setOpenDialog(false);
      resetForm();
      loadTests();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to save test: ' + err.message);
    }
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setFormData({
      title: test.title,
      subject: test.subject,
      topic: test.topic,
      totalMarks: test.totalMarks.toString(),
      duration: test.duration.toString(),
      announcementDate: new Date(test.announcementDate),
      conductDate: new Date(test.conductDate),
      instructions: test.instructions || ''
    });
    setEditMode(true);
    setError(''); // Clear any previous errors
    setOpenDialog(true);
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/tests/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete test');

      setSuccess('Test deleted successfully!');
      loadTests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete test: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      topic: '',
      totalMarks: '',
      duration: '',
      announcementDate: new Date(),
      conductDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      instructions: ''
    });
    setEditMode(false);
    setSelectedTest(null);
  };

  const openCreateDialog = () => {
    console.log('Opening create dialog...');
    resetForm();
    setError(''); // Clear any previous errors
    setOpenDialog(true);
    console.log('Dialog state should be open now');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatTimeLeft = (conductDate) => {
    const now = new Date();
    const testDate = new Date(conductDate);
    const diff = testDate - now;
    
    if (diff <= 0) return 'Test time passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header with Create Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            My Tests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{ borderRadius: 2 }}
          >
            Create New Test
          </Button>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tests Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading tests...</Typography>
          </Box>
        ) : tests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tests created yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first test to get started
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {tests.map((test) => (
              <Grid item xs={12} md={6} lg={4} key={test.id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip 
                        label={test.status} 
                        color={getStatusColor(test.status)}
                        size="small"
                      />
                    </Box>

                    {/* Test Info */}
                    <Typography variant="h6" gutterBottom sx={{ pr: 8 }}>
                      {test.title}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={test.subject} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={`${test.totalMarks} marks`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip 
                        label={`${test.duration} min`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {test.topic}
                    </Typography>

                    {/* Time Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(test.conductDate).toLocaleDateString()} at {new Date(test.conductDate).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatTimeLeft(test.conductDate)}
                      </Typography>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {test.comments?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Comments
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {test.submissions?.length || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Submissions
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        fullWidth
                      >
                        View Details
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(test)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(test.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create/Edit Test Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => {
            console.log('Dialog closing...');
            setOpenDialog(false);
          }} 
          maxWidth="md" 
          fullWidth
        >
          <DialogTitle>
            {editMode ? 'Edit Test' : 'Create New Test'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Test Title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (error) setError(''); // Clear error when user starts typing
                    }}
                    required
                    helperText="Enter a descriptive title for the test"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      label="Subject"
                    >
                      {subjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    required
                    inputProps={{ min: 1, max: 100 }}
                    helperText="1-100 marks"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    inputProps={{ min: 15, max: 300 }}
                    helperText="15-300 minutes"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Announcement Date"
                    value={formData.announcementDate}
                    onChange={(newValue) => setFormData({ ...formData, announcementDate: newValue })}
                    minDateTime={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Conduct Date"
                    value={formData.conductDate}
                    onChange={(newValue) => setFormData({ ...formData, conductDate: newValue })}
                    minDateTime={new Date()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Topic/Description"
                    multiline
                    rows={3}
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                    helperText="Describe what the test will cover (minimum 3 characters)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Instructions (Optional)"
                    multiline
                    rows={2}
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    helperText="Any special instructions for students"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setOpenDialog(false);
                setError(''); // Clear errors when closing dialog
              }}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editMode ? 'Update Test' : 'Create Test'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TeacherTestView;
