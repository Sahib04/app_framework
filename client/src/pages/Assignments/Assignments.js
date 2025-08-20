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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Assignments = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);

  // Mock data - replace with actual API calls
  const assignments = [
    {
      id: 1,
      title: 'Calculus Problem Set 1',
      description: 'Complete problems 1-20 from Chapter 2. Show all work and justify your answers.',
      course: 'Advanced Mathematics',
      instructor: 'Dr. Sarah Johnson',
      dueDate: '2024-02-15',
      status: 'Active',
      type: 'Problem Set',
      points: 100,
      submissions: 24,
      totalStudents: 30,
      attachments: ['problem_set_1.pdf', 'solutions_template.docx'],
      requirements: 'PDF submission, handwritten work accepted',
      rubric: 'Accuracy (60%), Work shown (25%), Neatness (15%)'
    },
    {
      id: 2,
      title: 'Programming Project: Data Structures',
      description: 'Implement a binary search tree with insertion, deletion, and search operations.',
      course: 'Computer Science Fundamentals',
      instructor: 'Prof. Michael Chen',
      dueDate: '2024-02-20',
      status: 'Active',
      type: 'Project',
      points: 150,
      submissions: 18,
      totalStudents: 32,
      attachments: ['project_requirements.pdf', 'test_cases.zip'],
      requirements: 'Java/Python code, documentation, test results',
      rubric: 'Functionality (50%), Code quality (25%), Documentation (15%), Testing (10%)'
    },
    {
      id: 3,
      title: 'Essay: Literary Analysis',
      description: 'Write a 5-page analysis of the themes in "To Kill a Mockingbird".',
      course: 'English Literature',
      instructor: 'Dr. Emily Davis',
      dueDate: '2024-02-18',
      status: 'Active',
      type: 'Essay',
      points: 80,
      submissions: 15,
      totalStudents: 18,
      attachments: ['essay_guidelines.pdf', 'rubric.pdf'],
      requirements: '5 pages, MLA format, works cited',
      rubric: 'Analysis (40%), Writing (30%), Evidence (20%), Format (10%)'
    }
  ];

  const courses = ['all', 'Advanced Mathematics', 'Computer Science Fundamentals', 'English Literature'];
  const statuses = ['all', 'Active', 'Draft', 'Archived'];
  const types = ['all', 'Problem Set', 'Project', 'Essay', 'Quiz', 'Exam'];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || assignment.course === filterCourse;
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleAddAssignment = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'warning';
      case 'Archived': return 'default';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Problem Set': return 'primary';
      case 'Project': return 'secondary';
      case 'Essay': return 'info';
      case 'Quiz': return 'warning';
      case 'Exam': return 'error';
      default: return 'default';
    }
  };

  const getSubmissionProgress = (submissions, total) => {
    return (submissions / total) * 100;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Assignments
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track academic assignments and submissions
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Fab
            color="primary"
            aria-label="add assignment"
            onClick={handleAddAssignment}
            sx={{ boxShadow: 3 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Course</InputLabel>
              <Select
                value={filterCourse}
                label="Course"
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                {courses.map((course) => (
                  <MenuItem key={course} value={course}>
                    {course === 'all' ? 'All Courses' : course}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setFilterCourse('all');
                setFilterStatus('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
          <Tab label="Card View" />
          <Tab label="List View" />
        </Tabs>
      </Box>

      {/* Card View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredAssignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {assignment.title}
                      </Typography>
                      <Chip
                        label={assignment.type}
                        color={getTypeColor(assignment.type)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        {assignment.points} pts
                      </Typography>
                    </Box>
                  </Box>

                  {/* Course and Instructor */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {assignment.course}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {assignment.instructor}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {assignment.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Due Date */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {isOverdue(assignment.dueDate) && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        Overdue!
                      </Alert>
                    )}
                  </Box>

                  {/* Submission Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Submissions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.submissions}/{assignment.totalStudents}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getSubmissionProgress(assignment.submissions, assignment.totalStudents)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Attachments */}
                  {assignment.attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments ({assignment.attachments.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {assignment.attachments.map((attachment, index) => (
                          <Chip
                            key={index}
                            label={attachment}
                            size="small"
                            variant="outlined"
                            icon={<DownloadIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Requirements */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.requirements}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  {user?.role === 'student' ? (
                    <Button size="small" variant="contained" startIcon={<UploadIcon />} fullWidth>
                      Submit Assignment
                    </Button>
                  ) : (
                    <Button size="small" variant="outlined" startIcon={<ViewIcon />} fullWidth>
                      View Submissions
                    </Button>
                  )}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />} fullWidth>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} fullWidth>
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* List View */}
      {viewMode === 1 && (
        <Box>
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} sx={{ mb: 2, boxShadow: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6" component="h2">
                      {assignment.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={assignment.type}
                        color={getTypeColor(assignment.type)}
                        size="small"
                      />
                      <Chip
                        label={assignment.status}
                        color={getStatusColor(assignment.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.course}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.instructor}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </Typography>
                    {isOverdue(assignment.dueDate) && (
                      <Chip label="Overdue" color="error" size="small" />
                    )}
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="h6" color="primary">
                      {assignment.points} pts
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignment.submissions}/{assignment.totalStudents} submitted
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {user?.role === 'student' ? (
                        <Tooltip title="Submit Assignment">
                          <IconButton color="primary">
                            <UploadIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="View Submissions">
                          <IconButton>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                          <Tooltip title="Edit Assignment">
                            <IconButton>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Assignment">
                            <IconButton color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Assignment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new assignment for your students.
        </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Create Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Assignments;
