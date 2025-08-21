import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  IconButton,
  Fab,
  CardActions,
  TextField
} from '@mui/material';
import {
  Class,
  Assignment,
  Grade,
  Schedule,
  People,
  Book,
  Add,
  Edit,
  Visibility,
  Person,
  Group,
  VideoCall,
  Message,
  Event,
  Assessment,
  School
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [guardiansByStudent, setGuardiansByStudent] = useState({});

  useEffect(() => {
    const loadStudents = async () => {
      if (!token) return;
      try {
        setStudentsLoading(true);
        const qs = search ? `?search=${encodeURIComponent(search)}` : '';
        const res = await fetch(`${API_BASE}/users/peers${qs}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        // peers for teacher => students
        setStudents(Array.isArray(data) ? data : []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load students', e);
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [token, search]);

  const toggleGuardians = async (student) => {
    const id = student?.id;
    if (!id) return;
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
      return;
    }
    setExpandedStudentId(id);
    if (!guardiansByStudent[id]) {
      try {
        const res = await fetch(`${API_BASE}/users/guardians-of/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setGuardiansByStudent(prev => ({ ...prev, [id]: Array.isArray(data?.guardians) ? data.guardians : [] }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load guardians', e);
        setGuardiansByStudent(prev => ({ ...prev, [id]: [] }));
      }
    }
  };

  const stats = {
    totalClasses: 6,
    totalStudents: 180,
    averageGrade: 85.2,
    attendanceRate: 94.5
  };

  const classes = [
    { id: 1, name: 'Advanced Mathematics', time: '9:00 AM', students: 25, grade: 'A', attendance: 92 },
    { id: 2, name: 'Physics 101', time: '11:00 AM', students: 30, grade: 'B+', attendance: 88 },
    { id: 3, name: 'Calculus II', time: '2:00 PM', students: 20, grade: 'A-', attendance: 95 }
  ];

  // Feature navigation cards for teachers
  const featureCards = [
    {
      title: 'My Classes',
      description: 'View and manage your assigned classes and schedules',
      icon: <Class />,
      color: '#4CAF50',
      path: '/classes',
      stats: `${stats.totalClasses} active classes`
    },
    {
      title: 'Students',
      description: 'View student profiles, performance, and contact information',
      icon: <People />,
      color: '#2196F3',
      path: '/students',
      stats: `${stats.totalStudents} students`
    },
    {
      title: 'Assignments',
      description: 'Create, manage, and grade student assignments',
      icon: <Assignment />,
      color: '#FF9800',
      path: '/assignments',
      stats: 'Active assignments'
    },
    {
      title: 'Grades',
      description: 'Record and manage student grades and assessments',
      icon: <Grade />,
      color: '#9C27B0',
      path: '/grades',
      stats: 'Grade management'
    },
    {
      title: 'Attendance',
      description: 'Track student attendance and generate reports',
      icon: <Schedule />,
      color: '#607D8B',
      path: '/attendance',
      stats: `${stats.attendanceRate}% avg attendance`
    },
    {
      title: 'Communication',
      description: 'Send messages and announcements to students and parents',
      icon: <Message />,
      color: '#00BCD4',
      path: '/messages',
      stats: 'Active conversations'
    },
    {
      title: 'Events',
      description: 'View and participate in school events and activities',
      icon: <Event />,
      color: '#8BC34A',
      path: '/events',
      stats: 'Upcoming events'
    },
    {
      title: 'Reports',
      description: 'Generate academic and performance reports',
      icon: <Assessment />,
      color: '#E91E63',
      path: '/reports',
      stats: 'Analytics & insights'
    }
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const FeatureCard = ({ title, description, icon, color, path, stats }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          '& .feature-icon': {
            transform: 'scale(1.1)'
          }
        }
      }}
      onClick={() => navigate(path)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: color, 
              width: 48, 
              height: 48, 
              mr: 2,
              transition: 'transform 0.3s ease'
            }}
            className="feature-icon"
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" fullWidth>
          Access {title}
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's your teaching overview and quick access to all features.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={<Class />}
            color="#4CAF50"
            subtitle="Active courses"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People />}
            color="#2196F3"
            subtitle="Enrolled students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#FF9800"
            subtitle="Class performance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Schedule />}
            color="#9C27B0"
            subtitle="Overall attendance"
          />
        </Grid>
      </Grid>

      {/* Feature Navigation Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Quick Access to Features
        </Typography>
        <Grid container spacing={3}>
          {featureCards.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Students List with Guardians */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Students</Typography>
            <TextField
              size="small"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
          {studentsLoading ? (
            <Typography variant="body2">Loading...</Typography>
          ) : (
            <List>
              {students.map((s) => (
                <React.Fragment key={s.id}>
                  <ListItem
                    secondaryAction={
                      <Button size="small" variant="outlined" onClick={() => toggleGuardians(s)}>
                        {expandedStudentId === s.id ? 'Hide Guardians' : 'View Guardians'}
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <Avatar src={s.profilePicture}>{s.firstName?.[0]}{s.lastName?.[0]}</Avatar>
                    </ListItemIcon>
                    <ListItemText primary={`${s.firstName} ${s.lastName}`} secondary={s.email} />
                  </ListItem>
                  {expandedStudentId === s.id && (
                    <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Guardians</Typography>
                      <List dense>
                        {(guardiansByStudent[s.id] || []).length === 0 && (
                          <ListItem><ListItemText primary="No guardians found" /></ListItem>
                        )}
                        {(guardiansByStudent[s.id] || []).map(g => (
                          <ListItem key={g.id}>
                            <ListItemIcon>
                              <Avatar src={g.profilePicture}>{g.firstName?.[0]}{g.lastName?.[0]}</Avatar>
                            </ListItemIcon>
                            <ListItemText primary={`${g.firstName} ${g.lastName}`} secondary={g.email} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Current Classes */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Current Classes
            </Typography>
            <Grid container spacing={2}>
              {classes.map((cls) => (
                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {cls.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Time: {cls.time}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Students</Typography>
                        <Typography variant="body2">{cls.students}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Grade</Typography>
                        <Chip label={cls.grade} size="small" color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Attendance</Typography>
                        <Typography variant="body2">{cls.attendance}%</Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" variant="outlined" fullWidth>
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/assignments')}
                >
                  Create Assignment
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Grade />}
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/grades')}
                >
                  Record Grades
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Schedule />}
                  fullWidth
                  sx={{ mb: 2 }}
                  onClick={() => navigate('/attendance')}
                >
                  Mark Attendance
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  startIcon={<Message />}
                  fullWidth
                  onClick={() => navigate('/messages')}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/assignments')}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default TeacherDashboard;
