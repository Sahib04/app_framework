import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const AdminTestView = () => {
  const { token } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' });

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const loadTests = useCallback(async () => {
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
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const getFilteredTests = () => {
    switch (tab) {
      case 0: // All Tests
        return tests;
      case 1: // Active Tests
        return tests.filter(test => test.status === 'active');
      case 2: // Completed Tests
        return tests.filter(test => test.status === 'completed');
      case 3: // Upcoming Tests
        return tests.filter(test => test.status === 'upcoming');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'active': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const handleGradeSubmission = async () => {
    try {
      const response = await fetch(`${API_BASE}/tests/${selectedTest.id}/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(gradeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grade submission');
      }

      setSuccess('Test graded successfully!');
      setOpenGradeDialog(false);
      setGradeData({ score: '', feedback: '' });
      loadTests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to grade submission: ' + err.message);
    }
  };

  const handleOpenGradeDialog = (test, submission) => {
    setSelectedTest(test);
    setSelectedSubmission(submission);
    setGradeData({ 
      score: submission.score?.toString() || '', 
      feedback: submission.feedback || '' 
    });
    setOpenGradeDialog(true);
  };

  const getTestStats = () => {
    const totalTests = tests.length;
    const activeTests = tests.filter(t => t.status === 'active').length;
    const completedTests = tests.filter(t => t.status === 'completed').length;
    const totalSubmissions = tests.reduce((sum, test) => sum + (test.submissions?.length || 0), 0);
    const totalComments = tests.reduce((sum, test) => sum + (test.comments?.length || 0), 0);

    return { totalTests, activeTests, completedTests, totalSubmissions, totalComments };
  };

  const stats = getTestStats();
  const filteredTests = getFilteredTests();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Test Management Dashboard
        </Typography>
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {stats.totalTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {stats.activeTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Tests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="default" sx={{ fontWeight: 'bold' }}>
                {stats.completedTests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed Tests
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {stats.totalSubmissions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Submissions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {stats.totalComments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Comments
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab 
              label={`All Tests (${tests.length})`} 
              icon={<AssessmentIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Active (${tests.filter(t => t.status === 'active').length})`} 
              icon={<PlayIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Completed (${tests.filter(t => t.status === 'completed').length})`} 
              icon={<GradeIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Upcoming (${tests.filter(t => t.status === 'upcoming').length})`} 
              icon={<ScheduleIcon />} 
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
            No tests found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Teachers will create tests that will appear here
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
                      onClick={() => {
                        setSelectedTest(test);
                        setOpenTestDialog(true);
                      }}
                    >
                      View Details
                    </Button>
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
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Test Details: {selectedTest?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTest && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Test Information</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Subject:</strong> {selectedTest.subject}</Typography>
                    <Typography variant="body2"><strong>Topic:</strong> {selectedTest.topic}</Typography>
                    <Typography variant="body2"><strong>Total Marks:</strong> {selectedTest.totalMarks}</Typography>
                    <Typography variant="body2"><strong>Duration:</strong> {selectedTest.duration} minutes</Typography>
                    <Typography variant="body2"><strong>Announcement Date:</strong> {new Date(selectedTest.announcementDate).toLocaleString()}</Typography>
                    <Typography variant="body2"><strong>Conduct Date:</strong> {new Date(selectedTest.conductDate).toLocaleString()}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {selectedTest.status}</Typography>
                  </Box>

                  {selectedTest.instructions && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>Instructions</Typography>
                      <Typography variant="body2">{selectedTest.instructions}</Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Submissions</Typography>
                  {selectedTest.submissions && selectedTest.submissions.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTest.submissions.map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell>
                                {submission.student?.firstName} {submission.student?.lastName}
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={submission.status} 
                                  size="small"
                                  color={submission.status === 'graded' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {submission.score || 'Not graded'}
                              </TableCell>
                              <TableCell>
                                {submission.status !== 'graded' && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenGradeDialog(selectedTest, submission)}
                                  >
                                    Grade
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No submissions yet
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Comments</Typography>
                  {selectedTest.comments && selectedTest.comments.length > 0 ? (
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
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            secondary={comment.content}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No comments yet
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog 
        open={openGradeDialog} 
        onClose={() => setOpenGradeDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Grade Test Submission
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Student:</strong> {selectedSubmission?.student?.firstName} {selectedSubmission?.student?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Test:</strong> {selectedTest?.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Marks:</strong> {selectedTest?.totalMarks}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Score"
            type="number"
            value={gradeData.score}
            onChange={(e) => setGradeData({ ...gradeData, score: e.target.value })}
            required
            inputProps={{ min: 0, max: selectedTest?.totalMarks || 100 }}
            helperText={`Score out of ${selectedTest?.totalMarks || 100} marks`}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Feedback (Optional)"
            multiline
            rows={3}
            value={gradeData.feedback}
            onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
            placeholder="Provide feedback to the student..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleGradeSubmission}
            disabled={!gradeData.score}
          >
            Grade Submission
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTestView;
