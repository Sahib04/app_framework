import React, { useMemo, useState, useEffect } from 'react';
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
  Tabs,
  Tab,
  Alert
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
import { coursesAPI } from '../../services/api';

const Courses = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [tab, setTab] = useState(0);
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin CRUD state
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    credits: 3,
    duration: 12,
    level: 'beginner',
    subject: '',
    maxCapacity: 30,
    fee: 0
  });
  const [editingCourseId, setEditingCourseId] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterCategory !== 'all') params.subject = filterCategory;
      if (filterLevel !== 'all') params.level = filterLevel;
      if (searchTerm) params.search = searchTerm;
      const res = await coursesAPI.getCourses(params);
      const list = Array.isArray(res.data?.courses) ? res.data.courses : (Array.isArray(res.data) ? res.data : []);
      setCourses(list.map((c) => ({
        id: c.id || c._id || c.code || Math.random().toString(36).slice(2),
        title: c.title,
        description: c.description,
        category: c.subject || c.category,
        level: c.level,
        instructor: c.instructorId ? `${c.instructorId.firstName} ${c.instructorId.lastName}` : c.instructor || '—',
        students: (c.enrolledStudents && c.enrolledStudents.length) || c.students || 0,
        rating: (c.rating && typeof c.rating === 'object') ? (Number(c.rating.average) || 0) : (Number(c.rating) || 0),
        progress: 0,
        image: c.image || 'https://source.unsplash.com/300x200/?education',
        startDate: c.startDate || '',
        duration: c.duration ? `${c.duration} weeks` : c.durationText || ''
      })));
    } catch (e) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadCourses();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterLevel]);

  const openAdminCreate = () => {
    setAdminEditMode(false);
    setEditingCourseId(null);
    setFormData({
      title: '', code: '', description: '', credits: 3, duration: 12,
      level: 'beginner', subject: '', maxCapacity: 30, fee: 0
    });
    setAdminDialogOpen(true);
  };

  const openAdminEdit = (course) => {
    setAdminEditMode(true);
    setEditingCourseId(course.id);
    setFormData({
      title: course.title || '',
      code: course.code || '',
      description: course.description || '',
      credits: Number(course.credits) || 3,
      duration: Number((course.duration || '').toString().split(' ')[0]) || 12,
      level: (course.level || 'beginner').toLowerCase(),
      subject: course.category || '',
      maxCapacity: Number(course.maxCapacity) || 30,
      fee: Number(course.fee) || 0
    });
    setAdminDialogOpen(true);
  };

  const handleAdminDelete = async (course) => {
    if (!window.confirm(`Delete course "${course.title}"?`)) return;
    try {
      await coursesAPI.deleteCourse(course.id);
      setSuccess('Course deleted');
      await loadCourses();
      setTimeout(() => setSuccess(''), 2000);
    } catch (_) {
      setError('Failed to delete course');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      setAdminSubmitting(true);
      setError('');
      if (adminEditMode) {
        await coursesAPI.updateCourse(editingCourseId, formData);
        setSuccess('Course updated');
      } else {
        await coursesAPI.createCourse(formData);
        setSuccess('Course created');
      }
      setAdminDialogOpen(false);
      await loadCourses();
      setTimeout(() => setSuccess(''), 2000);
    } catch (_) {
      setError('Failed to save course');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const [myCourseIds, setMyCourseIds] = useState([]);
  useEffect(() => {
    const loadMine = async () => {
      if (!isStudent) return;
      try {
        const res = await coursesAPI.getCourses({ page: 1, limit: 1000 });
        const list = Array.isArray(res.data?.courses) ? res.data.courses : [];
        const mine = list.filter(c => Array.isArray(c.enrolledStudents) && c.enrolledStudents.some(s => s === user?.id || s?._id === user?.id));
        setMyCourseIds(mine.map(m => m.id || m._id));
      } catch (_) {}
    };
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent]);

  const categories = ['all', 'Mathematics', 'Computer Science', 'Humanities', 'Sciences', 'Arts'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const myCourses = useMemo(() => filteredCourses.filter(c => myCourseIds.includes(c.id)), [filteredCourses, myCourseIds]);
  const toggleEnroll = async (courseId) => {
    try {
      const isEnrolled = myCourseIds.includes(courseId);
      if (isEnrolled) {
        await coursesAPI.unenrollCourse(courseId);
        setMyCourseIds(prev => prev.filter(id => id !== courseId));
      } else {
        await coursesAPI.enrollCourse(courseId);
        setMyCourseIds(prev => [...prev, courseId]);
      }
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Action failed');
    }
  };

  const handleAddCourse = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Courses
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and explore all available courses
          </Typography>
        </Box>
        {isAdmin && (
          <Fab
            color="primary"
            aria-label="add course"
            onClick={openAdminCreate}
            sx={{ boxShadow: 3 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>
      )}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}
      {isStudent && (
        <Box sx={{ mb: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="All Courses" />
            <Tab label="My Courses" />
          </Tabs>
        </Box>
      )}

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
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}
      {loading && (
        <Typography sx={{ mb: 2 }}>Loading courses...</Typography>
      )}
      <Grid container spacing={3}>
        {(isStudent && tab === 1 ? myCourses : filteredCourses).map((course) => (
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
                  {isAdmin && (
                    <>
                      <Tooltip title="Edit Course">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }} onClick={() => openAdminEdit(course)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.9)' }} onClick={() => handleAdminDelete(course)}>
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

                {isStudent && (
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
                {isStudent && (
                  <Button size="small" variant={myCourseIds.includes(course.id) ? 'outlined' : 'contained'} fullWidth onClick={() => toggleEnroll(course.id)}>
                    {myCourseIds.includes(course.id) ? 'Remove from My Courses' : 'Add to My Courses'}
                  </Button>
                )}
                {isAdmin && (
                  <Button size="small" variant="outlined" fullWidth>
                    Manage Access
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

      {/* Admin Create/Edit Course Dialog */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{adminEditMode ? 'Edit Course' : 'Create Course'}</DialogTitle>
        <form onSubmit={handleAdminSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth required label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Level</InputLabel>
                  <Select value={formData.level} label="Level" onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Credits" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Duration (weeks)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required label="Subject/Category" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Max Capacity" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth required type="number" label="Fee" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline minRows={3} label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={adminSubmitting}>{adminEditMode ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Courses;
