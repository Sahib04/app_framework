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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Grade as GradeIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Grades = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);

  // Mock data - replace with actual API calls
  const grades = [
    {
      id: 1,
      studentName: 'Alex Johnson',
      studentId: 'STU001',
      course: 'Advanced Mathematics',
      instructor: 'Dr. Sarah Johnson',
      semester: 'Fall 2024',
      assignments: [
        { name: 'Problem Set 1', score: 95, maxScore: 100, weight: 0.15 },
        { name: 'Midterm Exam', score: 88, maxScore: 100, weight: 0.30 },
        { name: 'Final Project', score: 92, maxScore: 100, weight: 0.25 },
        { name: 'Participation', score: 90, maxScore: 100, weight: 0.10 },
        { name: 'Final Exam', score: 89, maxScore: 100, weight: 0.20 }
      ],
      finalGrade: 'A-',
      gpa: 3.7,
      image: 'https://source.unsplash.com/100x100/?student',
      lastUpdated: '2024-02-10'
    },
    {
      id: 2,
      studentName: 'Maria Garcia',
      studentId: 'STU002',
      course: 'Computer Science Fundamentals',
      instructor: 'Prof. Michael Chen',
      semester: 'Fall 2024',
      assignments: [
        { name: 'Programming Project 1', score: 85, maxScore: 100, weight: 0.20 },
        { name: 'Midterm Exam', score: 92, maxScore: 100, weight: 0.30 },
        { name: 'Final Project', score: 88, maxScore: 100, weight: 0.30 },
        { name: 'Participation', score: 95, maxScore: 100, weight: 0.10 },
        { name: 'Final Exam', score: 90, maxScore: 100, weight: 0.10 }
      ],
      finalGrade: 'A-',
      gpa: 3.8,
      image: 'https://source.unsplash.com/100x100/?student-female',
      lastUpdated: '2024-02-10'
    },
    {
      id: 3,
      studentName: 'David Chen',
      studentId: 'STU003',
      course: 'English Literature',
      instructor: 'Dr. Emily Davis',
      semester: 'Fall 2024',
      assignments: [
        { name: 'Essay 1', score: 78, maxScore: 100, weight: 0.25 },
        { name: 'Midterm Exam', score: 82, maxScore: 100, weight: 0.25 },
        { name: 'Final Essay', score: 85, maxScore: 100, weight: 0.30 },
        { name: 'Participation', score: 88, maxScore: 100, weight: 0.10 },
        { name: 'Final Exam', score: 80, maxScore: 100, weight: 0.10 }
      ],
      finalGrade: 'B+',
      gpa: 3.3,
      image: 'https://source.unsplash.com/100x100/?student-male',
      lastUpdated: '2024-02-10'
    }
  ];

  const courses = ['all', 'Advanced Mathematics', 'Computer Science Fundamentals', 'English Literature'];
  const semesters = ['all', 'Fall 2024', 'Spring 2024', 'Summer 2024'];

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || grade.course === filterCourse;
    const matchesSemester = filterSemester === 'all' || grade.semester === filterSemester;
    
    return matchesSearch && matchesCourse && matchesSemester;
  });

  const handleAddGrade = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const calculateWeightedScore = (assignments) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    assignments.forEach(assignment => {
      totalWeightedScore += (assignment.score / assignment.maxScore) * assignment.weight;
      totalWeight += assignment.weight;
    });
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'warning';
    if (grade.startsWith('D')) return 'error';
    return 'default';
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.8) return 'success';
    if (gpa >= 3.5) return 'primary';
    if (gpa >= 3.0) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Grades
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage student academic performance
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Fab
            color="primary"
            aria-label="add grade"
            onClick={handleAddGrade}
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
              placeholder="Search students or courses..."
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
              <InputLabel>Semester</InputLabel>
              <Select
                value={filterSemester}
                label="Semester"
                onChange={(e) => setFilterSemester(e.target.value)}
              >
                {semesters.map((semester) => (
                  <MenuItem key={semester} value={semester}>
                    {semester === 'all' ? 'All Semesters' : semester}
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
                setFilterSemester('all');
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
          <Tab label="Table View" />
        </Tabs>
      </Box>

      {/* Card View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredGrades.map((grade) => (
            <Grid item xs={12} md={6} lg={4} key={grade.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      src={grade.image}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {grade.studentName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {grade.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {grade.studentId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {grade.course}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Course Info */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {grade.course}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {grade.instructor}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {grade.semester}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Final Grade and GPA */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={getGradeColor(grade.finalGrade)}>
                            {grade.finalGrade}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Final Grade
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color={getGPAColor(grade.gpa)}>
                            {grade.gpa}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            GPA
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Weighted Score */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Weighted Score
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {calculateWeightedScore(grade.assignments).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateWeightedScore(grade.assignments)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Assignment Breakdown */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Assignment Breakdown
                    </Typography>
                    <List dense>
                      {grade.assignments.map((assignment, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={assignment.name}
                            secondary={`${assignment.score}/${assignment.maxScore} (${(assignment.weight * 100).toFixed(0)}%)`}
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="primary">
                              {((assignment.score / assignment.maxScore) * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Last Updated */}
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(grade.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="outlined" startIcon={<ViewIcon />} fullWidth>
                    View Details
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />} fullWidth>
                        Edit Grades
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                        Export
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Table View */}
      {viewMode === 1 && (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Final Grade</TableCell>
                <TableCell>GPA</TableCell>
                <TableCell>Weighted Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGrades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={grade.image} sx={{ mr: 2 }}>
                        {grade.studentName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {grade.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {grade.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{grade.course}</TableCell>
                  <TableCell>{grade.instructor}</TableCell>
                  <TableCell>{grade.semester}</TableCell>
                  <TableCell>
                    <Chip
                      label={grade.finalGrade}
                      color={getGradeColor(grade.finalGrade)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography color={getGPAColor(grade.gpa)}>
                      {grade.gpa}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calculateWeightedScore(grade.assignments)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {calculateWeightedScore(grade.assignments).toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                          <Tooltip title="Edit Grades">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Export">
                            <IconButton size="small">
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Grade Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Grade Entry</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new grade entry for a student.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Add Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Grades;
