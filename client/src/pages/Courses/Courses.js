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
  Divider
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
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Courses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);

  // Mock data - replace with actual API calls
  const courses = [
    {
      id: 1,
      title: 'Advanced Mathematics',
      description: 'Comprehensive course covering calculus, linear algebra, and mathematical analysis.',
      category: 'Mathematics',
      level: 'Advanced',
      instructor: 'Dr. Sarah Johnson',
      students: 24,
      rating: 4.8,
      progress: 75,
      image: 'https://source.unsplash.com/300x200/?mathematics',
      startDate: '2024-01-15',
      duration: '16 weeks'
    },
    {
      id: 2,
      title: 'Computer Science Fundamentals',
      description: 'Introduction to programming, algorithms, and data structures.',
      category: 'Computer Science',
      level: 'Beginner',
      instructor: 'Prof. Michael Chen',
      students: 32,
      rating: 4.6,
      progress: 60,
      image: 'https://source.unsplash.com/300x200/?computer-science',
      startDate: '2024-01-20',
      duration: '12 weeks'
    },
    {
      id: 3,
      title: 'English Literature',
      description: 'Study of classic and contemporary literature from various periods.',
      category: 'Humanities',
      level: 'Intermediate',
      instructor: 'Dr. Emily Davis',
      students: 18,
      rating: 4.9,
      progress: 45,
      image: 'https://source.unsplash.com/300x200/?literature',
      startDate: '2024-02-01',
      duration: '14 weeks'
    }
  ];

  const categories = ['all', 'Mathematics', 'Computer Science', 'Humanities', 'Sciences', 'Arts'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleAddCourse = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Courses
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and explore all available courses
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Fab
            color="primary"
            aria-label="add course"
            onClick={handleAddCourse}
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={filterLevel}
                label="Level"
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                {levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
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
                setFilterCategory('all');
                setFilterLevel('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Course Grid */}
      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${course.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  {user?.role === 'admin' && (
                    <>
                      <Tooltip title="Edit Course">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="View Course">
                    <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8
                  }}
                >
                  <Chip
                    label={course.level}
                    size="small"
                    color="primary"
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                  />
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {course.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {course.description}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={course.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {course.rating}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.students} students
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.duration}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                    {course.instructor.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {course.instructor}
                  </Typography>
                </Box>

                {user?.role === 'student' && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={course.progress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                {user?.role === 'student' ? (
                  <Button size="small" variant="contained" fullWidth>
                    Continue Learning
                  </Button>
                ) : (
                  <Button size="small" variant="outlined" fullWidth>
                    View Details
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Course Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new course for students to enroll in.
        </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Create Course
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses;
