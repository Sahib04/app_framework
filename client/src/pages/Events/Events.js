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
  Paper,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Event as EventIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Group as GroupIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);

  // Mock data - replace with actual API calls
  const events = [
    {
      id: 1,
      title: 'Parent-Teacher Conference',
      description: 'Annual parent-teacher conference to discuss student progress and academic performance.',
      category: 'Academic',
      type: 'Conference',
      startDate: '2024-02-15T09:00:00',
      endDate: '2024-02-15T17:00:00',
      location: 'Main Auditorium',
      organizer: 'Dr. Sarah Johnson',
      maxParticipants: 100,
      currentParticipants: 45,
      image: 'https://source.unsplash.com/300x200/?conference',
      status: 'Upcoming',
      tags: ['Parent Meeting', 'Academic', 'Conference'],
      requirements: 'Registration required',
      contact: 'conference@school.edu',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      title: 'Science Fair 2024',
      description: 'Annual science fair showcasing student projects and innovations in various scientific fields.',
      category: 'Academic',
      type: 'Fair',
      startDate: '2024-02-20T10:00:00',
      endDate: '2024-02-20T16:00:00',
      location: 'Science Building & Gymnasium',
      organizer: 'Prof. Michael Chen',
      maxParticipants: 200,
      currentParticipants: 150,
      image: 'https://source.unsplash.com/300x200/?science-fair',
      status: 'Upcoming',
      tags: ['Science', 'Student Projects', 'Innovation'],
      requirements: 'Open to all students and parents',
      contact: 'sciencefair@school.edu',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 3,
      title: 'Basketball Championship Game',
      description: 'Final game of the inter-school basketball tournament. Come support our team!',
      category: 'Sports',
      type: 'Game',
      startDate: '2024-02-18T19:00:00',
      endDate: '2024-02-18T21:00:00',
      location: 'School Gymnasium',
      organizer: 'Coach John Davis',
      maxParticipants: 500,
      currentParticipants: 300,
      image: 'https://source.unsplash.com/300x200/?basketball',
      status: 'Upcoming',
      tags: ['Sports', 'Basketball', 'Tournament'],
      requirements: 'Free entry, school spirit encouraged',
      contact: 'sports@school.edu',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 4,
      title: 'Art Exhibition Opening',
      description: 'Opening night of the student art exhibition featuring works from all grade levels.',
      category: 'Arts',
      type: 'Exhibition',
      startDate: '2024-02-22T18:00:00',
      endDate: '2024-02-22T21:00:00',
      location: 'Art Gallery',
      organizer: 'Ms. Emily Wilson',
      maxParticipants: 80,
      currentParticipants: 65,
      image: 'https://source.unsplash.com/300x200/?art-exhibition',
      status: 'Upcoming',
      tags: ['Art', 'Exhibition', 'Student Work'],
      requirements: 'RSVP recommended',
      contact: 'art@school.edu',
      phone: '+1 (555) 456-7890'
    }
  ];

  const categories = ['all', 'Academic', 'Sports', 'Arts', 'Social', 'Technology'];
  const dateFilters = ['all', 'Today', 'This Week', 'This Month', 'Upcoming'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    const matchesDate = filterDate === 'all' || event.startDate === filterDate;
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleAddEvent = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Academic': return 'primary';
      case 'Sports': return 'success';
      case 'Arts': return 'secondary';
      case 'Social': return 'info';
      case 'Technology': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'success';
      case 'Ongoing': return 'primary';
      case 'Completed': return 'default';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventToday = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isEventUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and participate in school events and activities
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <Fab
            color="primary"
            aria-label="add event"
            onClick={handleAddEvent}
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
              placeholder="Search events..."
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
              <InputLabel>Date</InputLabel>
              <Select
                value={filterDate}
                label="Date"
                onChange={(e) => setFilterDate(e.target.value)}
              >
                {dateFilters.map((date) => (
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
                setFilterCategory('all');
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
          <Tab label="Card View" />
          <Tab label="Timeline View" />
          <Tab label="List View" />
        </Tabs>
      </Box>

      {/* Card View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${event.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      display: 'flex',
                      gap: 1
                    }}
                  >
                    <Chip
                      label={event.category}
                      color={getCategoryColor(event.category)}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                    />
                    {isEventToday(event.startDate) && (
                      <Chip
                        label="Today"
                        color="error"
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8
                    }}
                  >
                    <Chip
                      label={event.status}
                      color={getStatusColor(event.status)}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {event.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(event.startDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {event.organizer}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Tags */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {event.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Participation */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Participants
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.currentParticipants}/{event.maxParticipants}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(event.currentParticipants / event.maxParticipants) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Requirements */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.requirements}
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

      {/* Timeline View */}
      {viewMode === 1 && (
        <Paper sx={{ p: 3, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Event Timeline
          </Typography>
          <List>
            {filteredEvents.map((event) => (
              <ListItem key={event.id} sx={{ py: 2 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getCategoryColor(event.category) }}>
                    <EventIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{event.title}</Typography>
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={event.category}
                          color={getCategoryColor(event.category)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={event.location}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(event.startDate)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* List View */}
      {viewMode === 2 && (
        <Box>
          {filteredEvents.map((event) => (
            <Card key={event.id} sx={{ mb: 2, boxShadow: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Typography variant="h6" component="h2">
                      {event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={event.category}
                        color={getCategoryColor(event.category)}
                        size="small"
                      />
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(event.startDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      {event.organizer}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="body2" color="text.secondary">
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(event.currentParticipants / event.maxParticipants) * 100}
                      sx={{ height: 6, borderRadius: 3, mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(user?.role === 'admin' || user?.role === 'teacher') && (
                        <>
                          <Tooltip title="Edit Event">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Event">
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
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

      {/* Add Event Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new event for the school community.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Events;
