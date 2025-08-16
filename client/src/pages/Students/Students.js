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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  LinearProgress,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Students = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);

  // Mock data - replace with actual API calls
  const students = [
    {
      id: 1,
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex.johnson@school.edu',
      phone: '+1 (555) 123-4567',
      grade: '10th Grade',
      status: 'Active',
      courses: ['Mathematics', 'Physics', 'English'],
      attendance: 95,
      gpa: 3.8,
      image: 'https://source.unsplash.com/100x100/?student',
      address: '123 Main St, City, State',
      parentName: 'Sarah Johnson',
      parentPhone: '+1 (555) 987-6543'
    },
    {
      id: 2,
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@school.edu',
      phone: '+1 (555) 234-5678',
      grade: '11th Grade',
      status: 'Active',
      courses: ['Chemistry', 'Biology', 'Spanish'],
      attendance: 88,
      gpa: 3.9,
      image: 'https://source.unsplash.com/100x100/?student-female',
      address: '456 Oak Ave, City, State',
      parentName: 'Carlos Garcia',
      parentPhone: '+1 (555) 876-5432'
    },
    {
      id: 3,
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@school.edu',
      phone: '+1 (555) 345-6789',
      grade: '9th Grade',
      status: 'Active',
      courses: ['Algebra', 'History', 'Art'],
      attendance: 92,
      gpa: 3.7,
      image: 'https://source.unsplash.com/100x100/?student-male',
      address: '789 Pine Rd, City, State',
      parentName: 'Lisa Chen',
      parentPhone: '+1 (555) 765-4321'
    }
  ];

  const grades = ['all', '9th Grade', '10th Grade', '11th Grade', '12th Grade'];
  const statuses = ['all', 'Active', 'Inactive', 'Suspended', 'Graduated'];

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleAddStudent = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Suspended': return 'error';
      case 'Graduated': return 'info';
      default: return 'default';
    }
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
            Students
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student information and academic records
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="add student"
            onClick={handleAddStudent}
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
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Grade</InputLabel>
              <Select
                value={filterGrade}
                label="Grade"
                onChange={(e) => setFilterGrade(e.target.value)}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : grade}
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
                setFilterGrade('all');
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
          <Tab label="Table View" />
        </Tabs>
      </Box>

      {/* Card View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredStudents.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={student.image}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {student.firstName[0]}{student.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {student.firstName} {student.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.grade}
                      </Typography>
                      <Chip
                        label={student.status}
                        color={getStatusColor(student.status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {student.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {student.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {student.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Academic Performance
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color={getGPAColor(student.gpa)}>
                            {student.gpa}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            GPA
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {student.attendance}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Attendance
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Courses
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {student.courses.map((course, index) => (
                        <Chip
                          key={index}
                          label={course}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="outlined" startIcon={<ViewIcon />}>
                    View Details
                  </Button>
                  {user?.role === 'admin' && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}>
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

      {/* Table View */}
      {viewMode === 1 && (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>GPA</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Courses</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={student.image} sx={{ mr: 2 }}>
                        {student.firstName[0]}{student.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      color={getStatusColor(student.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography color={getGPAColor(student.gpa)}>
                      {student.gpa}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={student.attendance}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {student.attendance}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {student.courses.slice(0, 2).map((course, index) => (
                        <Chip
                          key={index}
                          label={course}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {student.courses.length > 2 && (
                        <Chip
                          label={`+${student.courses.length - 2}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="caption" display="block">
                        {student.parentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.parentPhone}
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
                      {user?.role === 'admin' && (
                        <>
                          <Tooltip title="Edit Student">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Student">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
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

      {/* Add Student Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Register a new student in the system.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Add Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
