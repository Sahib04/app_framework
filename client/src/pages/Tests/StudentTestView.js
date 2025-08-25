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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemAvatar,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const StudentTestView = () => {
  const { user, token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [comment, setComment] = useState('');

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

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const getFilteredTests = () => {
    switch (tab) {
      case 0: // Active Tests
        return tests.filter(test => test.status === 'active');
      case 1: // Upcoming Tests
        return tests.filter(test => test.status === 'upcoming');
      case 2: // Completed Tests
        return tests.filter(test => test.status === 'completed');
      default:
        return tests;
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

  const handleTakeTest = (test) => {
    setSelectedTest(test);
    setOpenTestDialog(true);
  };

  const handleSubmitTest = async () => {
    try {
      const response = await fetch(`${API_BASE}/tests/${selectedTest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit test');
      }

      setSuccess('Test submitted successfully!');
      setOpenTestDialog(false);
      loadTests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit test: ' + err.message);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/tests/${selectedTest.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }

      setComment('');
      setOpenCommentDialog(false);
      loadTests();
      setSuccess('Comment added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment: ' + err.message);
    }
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

  const filteredTests = getFilteredTests();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Available Tests
        </Typography>
        
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab 
              label={`Active Tests (${tests.filter(t => t.status === 'active').length})`} 
              icon={<PlayIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Upcoming Tests (${tests.filter(t => t.status === 'upcoming').length})`} 
              icon={<ScheduleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Completed Tests (${tests.filter(t => t.status === 'completed').length})`} 
              icon={<GradeIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>
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

      {/* Tests List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Loading tests...</Typography>
        </Box>
      ) : filteredTests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tab === 0 && 'No active tests available'}
            {tab === 1 && 'No upcoming tests scheduled'}
            {tab === 2 && 'No completed tests yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tab === 0 && 'Check back later for new tests'}
            {tab === 1 && 'Teachers will announce tests soon'}
            {tab === 2 && 'Complete some tests to see them here'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredTests.map((test) => (
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

                  {/* Teacher Info */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Teacher:</strong> {test.teacher?.firstName} {test.teacher?.lastName}
                    </Typography>
                  </Box>

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

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {test.status === 'active' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayIcon />}
                        fullWidth
                        onClick={() => handleTakeTest(test)}
                      >
                        Take Test
                      </Button>
                    )}
                    {test.status === 'upcoming' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        fullWidth
                        onClick={() => setSelectedTest(test)}
                      >
                        View Details
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTest(test);
                        setOpenCommentDialog(true);
                      }}
                      color="primary"
                    >
                      <CommentIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Test Details Dialog */}
      <Dialog 
        open={openTestDialog} 
        onClose={() => setOpenTestDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Test: {selectedTest?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Typography variant="h6" gutterBottom>Instructions</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedTest.instructions || 'No specific instructions provided.'}
              </Typography>
              
              <Typography variant="h6" gutterBottom>Test Details</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Subject:</strong> {selectedTest.subject}</Typography>
                <Typography variant="body2"><strong>Topic:</strong> {selectedTest.topic}</Typography>
                <Typography variant="body2"><strong>Total Marks:</strong> {selectedTest.totalMarks}</Typography>
                <Typography variant="body2"><strong>Duration:</strong> {selectedTest.duration} minutes</Typography>
                <Typography variant="body2"><strong>Conduct Date:</strong> {new Date(selectedTest.conductDate).toLocaleString()}</Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Once you start the test, you cannot pause or restart it. 
                  Make sure you have enough time to complete the test.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitTest}
            startIcon={<PlayIcon />}
          >
            Start Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog 
        open={openCommentDialog} 
        onClose={() => setOpenCommentDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Add Comment to: {selectedTest?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment or Question"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ask a question about the test or share your thoughts..."
            sx={{ mt: 1 }}
          />
          
          {selectedTest?.comments && selectedTest.comments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Previous Comments</Typography>
              <List dense>
                {selectedTest.comments.map((comment) => (
                  <ListItem key={comment.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: comment.isTeacherReply ? 'primary.main' : 'grey.500' }}>
                        {comment.user?.firstName?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {comment.user?.firstName} {comment.user?.lastName}
                          </Typography>
                          {comment.isTeacherReply && (
                            <Chip label="Teacher" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">{comment.content}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddComment}
            startIcon={<SendIcon />}
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentTestView;
