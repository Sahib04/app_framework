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
  Rating,
  LinearProgress,
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
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
  Assessment as AssessmentIcon,
  Book as BookIcon,
  Star as StarIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Teachers = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data - replace with actual API calls
  const teachers = [
    {
      id: 1,
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@school.edu',
      phone: '+1 (555) 123-4567',
      department: 'Mathematics',
      status: 'Active',
      specialization: 'Calculus, Linear Algebra',
      experience: '15 years',
      rating: 4.9,
      courses: ['Advanced Mathematics', 'Calculus I', 'Linear Algebra'],
      students: 45,
      image: 'https://source.unsplash.com/100x100/?teacher-female',
      address: '123 Main St, City, State',
      education: 'Ph.D. Mathematics, Stanford University',
      officeHours: 'Mon, Wed 2-4 PM',
      office: 'Room 201, Math Building'
    },
    {
      id: 2,
      firstName: 'Prof. Michael',
      lastName: 'Chen',
      email: 'michael.chen@school.edu',
      phone: '+1 (555) 234-5678',
      department: 'Computer Science',
      status: 'Active',
      specialization: 'Programming, Algorithms',
      experience: '12 years',
      rating: 4.7,
      courses: ['Computer Science Fundamentals', 'Data Structures', 'Algorithms'],
      students: 38,
      image: 'https://source.unsplash.com/100x100/?teacher-male',
      address: '456 Oak Ave, City, State',
      education: 'Ph.D. Computer Science, MIT',
      officeHours: 'Tue, Thu 3-5 PM',
      office: 'Room 305, CS Building'
    },
    {
      id: 3,
      firstName: 'Dr. Emily',
      lastName: 'Davis',
      email: 'emily.davis@school.edu',
      phone: '+1 (555) 345-6789',
      department: 'Humanities',
      status: 'Active',
      specialization: 'Literature, Creative Writing',
      experience: '18 years',
      rating: 4.8,
      courses: ['English Literature', 'Creative Writing', 'Poetry'],
      students: 32,
      image: 'https://source.unsplash.com/100x100/?teacher-humanities',
      address: '789 Pine Rd, City, State',
      education: 'Ph.D. English Literature, Harvard University',
      officeHours: 'Mon, Fri 1-3 PM',
      office: 'Room 102, Humanities Building'
    }
  ];

  const departments = ['all', 'Mathematics', 'Computer Science', 'Humanities', 'Sciences', 'Arts', 'Physical Education'];
  const statuses = ['all', 'Active', 'Inactive', 'On Leave', 'Retired'];

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || teacher.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddTeacher = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'On Leave': return 'info';
      case 'Retired': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Teachers
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage faculty information and course assignments
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="add teacher"
            onClick={handleAddTeacher}
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
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                label="Department"
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
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
                setFilterDepartment('all');
                setFilterStatus('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Teachers Grid */}
      <Grid container spacing={3}>
        {filteredTeachers.map((teacher) => (
          <Grid item xs={12} md={6} lg={4} key={teacher.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header with Avatar and Basic Info */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                  <Avatar
                    src={teacher.image}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  >
                    {teacher.firstName[0]}{teacher.lastName[0]}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {teacher.firstName} {teacher.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {teacher.department}
                    </Typography>
                    <Chip
                      label={teacher.status}
                      color={getStatusColor(teacher.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                {/* Rating and Experience */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={teacher.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {teacher.rating}
                  </Typography>
                  <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.experience}
                    </Typography>
                  </Box>
                </Box>

                {/* Contact Information */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {teacher.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {teacher.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {teacher.office}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Specialization */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Specialization
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teacher.specialization}
                  </Typography>
                </Box>

                {/* Education */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Education
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teacher.education}
                  </Typography>
                </Box>

                {/* Office Hours */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Office Hours
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {teacher.officeHours}
                  </Typography>
                </Box>

                {/* Current Courses */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Courses ({teacher.courses.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {teacher.courses.map((course, index) => (
                      <Chip
                        key={index}
                        label={course}
                        size="small"
                        variant="outlined"
                        icon={<BookIcon />}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Statistics */}
                <Box sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {teacher.students}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Students
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="secondary">
                          {teacher.courses.length}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Courses
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button size="small" variant="outlined" startIcon={<ViewIcon />} fullWidth>
                  View Profile
                </Button>
                {user?.role === 'admin' && (
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

      {/* Add Teacher Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Teacher</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Register a new teacher in the system.
        </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Add Teacher
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers;
