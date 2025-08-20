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
  ListItemAvatar,
  Calendar,
  CalendarGrid,
  CalendarCell
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Schedule as ScheduleIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - replace with actual API calls
  const attendanceRecords = [
    {
      id: 1,
      date: '2024-02-10',
      course: 'Advanced Mathematics',
      instructor: 'Dr. Sarah Johnson',
      totalStudents: 30,
      present: 28,
      absent: 1,
      late: 1,
      excused: 0,
      students: [
        { id: 1, name: 'Alex Johnson', status: 'present', time: '09:00 AM', note: '' },
        { id: 2, name: 'Maria Garcia', status: 'present', time: '09:02 AM', note: '' },
        { id: 3, name: 'David Chen', status: 'late', time: '09:15 AM', note: 'Traffic delay' },
        { id: 4, name: 'Sarah Wilson', status: 'absent', time: '', note: 'Sick leave' }
      ]
    },
    {
      id: 2,
      date: '2024-02-09',
      course: 'Computer Science Fundamentals',
      instructor: 'Prof. Michael Chen',
      totalStudents: 32,
      present: 30,
      absent: 1,
      late: 1,
      excused: 0,
      students: [
        { id: 1, name: 'Alex Johnson', status: 'present', time: '10:00 AM', note: '' },
        { id: 2, name: 'Maria Garcia', status: 'present', time: '10:01 AM', note: '' },
        { id: 3, name: 'David Chen', status: 'present', time: '10:00 AM', note: '' },
        { id: 4, name: 'Sarah Wilson', status: 'late', time: '10:10 AM', note: 'Bus delay' }
      ]
    },
    {
      id: 3,
      date: '2024-02-08',
      course: 'English Literature',
      instructor: 'Dr. Emily Davis',
      totalStudents: 18,
      present: 17,
      absent: 1,
      late: 0,
      excused: 0,
      students: [
        { id: 1, name: 'Alex Johnson', status: 'present', time: '02:00 PM', note: '' },
        { id: 2, name: 'Maria Garcia', status: 'present', time: '02:00 PM', note: '' },
        { id: 3, name: 'David Chen', status: 'present', time: '02:00 PM', note: '' },
        { id: 4, name: 'Sarah Wilson', status: 'absent', time: '', note: 'Family emergency' }
      ]
    }
  ];

  const courses = ['all', 'Advanced Mathematics', 'Computer Science Fundamentals', 'English Literature'];
  const dates = ['all', 'Today', 'This Week', 'This Month'];

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || record.course === filterCourse;
    const matchesDate = filterDate === 'all' || record.date === filterDate;
    
    return matchesSearch && matchesCourse && matchesDate;
  });

  const handleAddAttendance = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      case 'excused': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircleIcon />;
      case 'absent': return <CancelIcon />;
      case 'late': return <HelpIcon />;
      case 'excused': return <HelpIcon />;
      default: return <HelpIcon />;
    }
  };

  const calculateAttendanceRate = (present, total) => {
    return total > 0 ? (present / total) * 100 : 0;
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 80) return 'primary';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Attendance
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage student attendance records
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Fab
            color="primary"
            aria-label="add attendance"
            onClick={handleAddAttendance}
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
              placeholder="Search courses or instructors..."
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
              <InputLabel>Date</InputLabel>
              <Select
                value={filterDate}
                label="Date"
                onChange={(e) => setFilterDate(e.target.value)}
              >
                {dates.map((date) => (
                  <MenuItem key={date} value={date}>
                    {date === 'all' ? 'All Dates' : date}
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
                setFilterDate('all');
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
          <Tab label="Summary View" />
          <Tab label="Detailed View" />
          <Tab label="Calendar View" />
        </Tabs>
      </Box>

      {/* Summary View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} md={6} lg={4} key={record.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {record.course}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(record.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${calculateAttendanceRate(record.present, record.totalStudents).toFixed(1)}%`}
                      color={getAttendanceRateColor(calculateAttendanceRate(record.present, record.totalStudents))}
                      size="small"
                    />
                  </Box>

                  {/* Instructor */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {record.instructor}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Attendance Statistics */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {record.present}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Present
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="error.main">
                            {record.absent}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Absent
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Additional Stats */}
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="warning.main">
                            {record.late}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Late
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="info.main">
                            {record.excused}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Excused
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Attendance Rate Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Attendance Rate
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {calculateAttendanceRate(record.present, record.totalStudents).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateAttendanceRate(record.present, record.totalStudents)}
                      color={getAttendanceRateColor(calculateAttendanceRate(record.present, record.totalStudents))}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Quick Student List */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Students ({record.students.length})
                    </Typography>
                    <List dense>
                      {record.students.slice(0, 3).map((student) => (
                        <ListItem key={student.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={student.name}
                            secondary={student.status}
                          />
                          <Chip
                            label={student.status}
                            color={getStatusColor(student.status)}
                            size="small"
                            icon={getStatusIcon(student.status)}
                          />
                        </ListItem>
                      ))}
                      {record.students.length > 3 && (
                        <ListItem sx={{ px: 0 }}>
                          <ListItemText
                            primary={`+${record.students.length - 3} more students`}
                            sx={{ textAlign: 'center' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="outlined" startIcon={<ViewIcon />} fullWidth>
                    View Details
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <>
                      <Button size="small" variant="outlined" startIcon={<EditIcon />} fullWidth>
                        Edit
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

      {/* Detailed View */}
      {viewMode === 1 && (
        <Box>
          {filteredRecords.map((record) => (
            <Card key={record.id} sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2">
                      {record.course} - {new Date(record.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Instructor: {record.instructor}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary">
                      {calculateAttendanceRate(record.present, record.totalStudents).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Attendance Rate
                    </Typography>
                  </Box>
                </Box>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {record.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="subtitle2">
                                {student.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={student.status}
                              color={getStatusColor(student.status)}
                              size="small"
                              icon={getStatusIcon(student.status)}
                            />
                          </TableCell>
                          <TableCell>{student.time || '-'}</TableCell>
                          <TableCell>{student.note || '-'}</TableCell>
                          <TableCell>
                            {(user?.role === 'admin' || user?.role === 'teacher') && (
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Calendar View */}
      {viewMode === 2 && (
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a date to view attendance records
            </Typography>
            {/* Add calendar component here */}
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Calendar view coming soon...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Add Attendance Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Record Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Record attendance for a specific course and date.
        </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Record Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;
