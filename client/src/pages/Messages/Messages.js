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
  Divider,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  InputAdornment,
  Tabs,
  Tab,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Block as BlockIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mock data - replace with actual API calls
  const conversations = [
    {
      id: 1,
      type: 'individual',
      participants: [
        { id: 1, name: 'Dr. Sarah Johnson', role: 'teacher', avatar: 'https://source.unsplash.com/100x100/?teacher-female', online: true },
        { id: user?.id, name: user?.firstName + ' ' + user?.lastName, role: user?.role, avatar: user?.avatar }
      ],
      lastMessage: 'Please submit your assignment by Friday.',
      lastMessageTime: '2024-02-10T14:30:00',
      unreadCount: 2,
      course: 'Advanced Mathematics',
      messages: [
        { id: 1, sender: 1, text: 'Hello! How is your progress on the calculus assignment?', time: '2024-02-10T14:00:00', read: true },
        { id: 2, sender: user?.id, text: 'I\'m working on it. Should be done by Thursday.', time: '2024-02-10T14:15:00', read: true },
        { id: 3, sender: 1, text: 'Great! Please submit your assignment by Friday.', time: '2024-02-10T14:30:00', read: false }
      ]
    },
    {
      id: 2,
      type: 'group',
      participants: [
        { id: 1, name: 'Dr. Sarah Johnson', role: 'teacher', avatar: 'https://source.unsplash.com/100x100/?teacher-female', online: true },
        { id: 2, name: 'Alex Johnson', role: 'student', avatar: 'https://source.unsplash.com/100x100/?student', online: false },
        { id: 3, name: 'Maria Garcia', role: 'student', avatar: 'https://source.unsplash.com/100x100/?student-female', online: true },
        { id: user?.id, name: user?.firstName + ' ' + user?.lastName, role: user?.role, avatar: user?.avatar }
      ],
      name: 'Math Study Group',
      lastMessage: 'Let\'s meet tomorrow at 3 PM in the library.',
      lastMessageTime: '2024-02-10T13:45:00',
      unreadCount: 0,
      course: 'Advanced Mathematics',
      messages: [
        { id: 1, sender: 1, text: 'Welcome everyone to the study group!', time: '2024-02-10T13:00:00', read: true },
        { id: 2, sender: 2, text: 'Thanks for organizing this!', time: '2024-02-10T13:15:00', read: true },
        { id: 3, sender: 3, text: 'Let\'s meet tomorrow at 3 PM in the library.', time: '2024-02-10T13:45:00', read: true }
      ]
    },
    {
      id: 3,
      type: 'individual',
      participants: [
        { id: 4, name: 'Prof. Michael Chen', role: 'teacher', avatar: 'https://source.unsplash.com/100x100/?teacher-male', online: false },
        { id: user?.id, name: user?.firstName + ' ' + user?.lastName, role: user?.role, avatar: user?.avatar }
      ],
      lastMessage: 'Your project looks great! Keep up the good work.',
      lastMessageTime: '2024-02-09T16:20:00',
      unreadCount: 0,
      course: 'Computer Science Fundamentals',
      messages: [
        { id: 1, sender: user?.id, text: 'Hi Professor, I\'ve submitted my project. Could you take a look?', time: '2024-02-09T16:00:00', read: true },
        { id: 2, sender: 4, text: 'Your project looks great! Keep up the good work.', time: '2024-02-09T16:20:00', read: true }
      ]
    }
  ];

  const conversationTypes = ['all', 'individual', 'group'];
  const courses = ['all', 'Advanced Mathematics', 'Computer Science Fundamentals', 'English Literature'];

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = 
      conversation.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (conversation.name && conversation.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || conversation.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleNewMessage = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // Add message logic here
      setNewMessage('');
    }
  };

  const getOtherParticipant = (conversation) => {
    if (conversation.type === 'individual') {
      return conversation.participants.find(p => p.id !== user?.id);
    }
    return null;
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Messages
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Communicate with teachers, students, and study groups
          </Typography>
        </Box>
        <Fab
          color="primary"
          aria-label="new message"
          onClick={handleNewMessage}
          sx={{ boxShadow: 3 }}
        >
          <AddIcon />
        </Fab>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search conversations or people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {conversationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type === 'individual' ? 'Individual' : 'Group'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
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
          <Tab label="Conversations" />
          <Tab label="Chat View" />
        </Tabs>
      </Box>

      {/* Conversations View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredConversations.map((conversation) => (
            <Grid item xs={12} md={6} lg={4} key={conversation.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: 3,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => {
                  setSelectedChat(conversation);
                  setViewMode(1);
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    {conversation.type === 'individual' ? (
                      <Avatar
                        src={getOtherParticipant(conversation)?.avatar}
                        sx={{ width: 50, height: 50, mr: 2 }}
                      >
                        {getOtherParticipant(conversation)?.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                    ) : (
                      <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" component="h2" noWrap>
                          {conversation.type === 'individual' 
                            ? getOtherParticipant(conversation)?.name 
                            : conversation.name
                          }
                        </Typography>
                        {conversation.unreadCount > 0 && (
                          <Badge badgeContent={conversation.unreadCount} color="primary">
                            <MessageIcon fontSize="small" />
                          </Badge>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conversation.type === 'individual' 
                          ? getOtherParticipant(conversation)?.role 
                          : `${conversation.participants.length} participants`
                        }
                      </Typography>
                      <Chip
                        label={conversation.course}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Last Message */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {conversation.lastMessage}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(conversation.lastMessageTime)}
                    </Typography>
                  </Box>

                  {/* Participants (for group chats) */}
                  {conversation.type === 'group' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Participants
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {conversation.participants.slice(0, 3).map((participant) => (
                          <Chip
                            key={participant.id}
                            label={participant.name}
                            size="small"
                            variant="outlined"
                            avatar={
                              <Avatar src={participant.avatar} sx={{ width: 20, height: 20 }}>
                                {participant.name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                            }
                          />
                        ))}
                        {conversation.participants.length > 3 && (
                          <Chip
                            label={`+${conversation.participants.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Online Status */}
                  {conversation.type === 'individual' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: getOtherParticipant(conversation)?.online ? 'success.main' : 'text.disabled',
                          mr: 1
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {getOtherParticipant(conversation)?.online ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="outlined" startIcon={<MessageIcon />} fullWidth>
                    Open Chat
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Chat View */}
      {viewMode === 1 && selectedChat && (
        <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Card sx={{ mb: 2, boxShadow: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => setViewMode(0)} sx={{ mr: 1 }}>
                    <MessageIcon />
                  </IconButton>
                  {selectedChat.type === 'individual' ? (
                    <Avatar
                      src={getOtherParticipant(selectedChat)?.avatar}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {getOtherParticipant(selectedChat)?.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  ) : (
                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                      <PeopleIcon />
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="h6">
                      {selectedChat.type === 'individual' 
                        ? getOtherParticipant(selectedChat)?.name 
                        : selectedChat.name
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedChat.course}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card sx={{ flexGrow: 1, mb: 2, boxShadow: 3 }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Messages List */}
                <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                  {selectedChat.messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === user?.id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.sender === user?.id ? 'primary.main' : 'grey.100',
                          color: message.sender === user?.id ? 'white' : 'text.primary',
                          p: 2,
                          borderRadius: 2,
                          position: 'relative'
                        }}
                      >
                        <Typography variant="body2">
                          {message.text}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            display: 'block',
                            mt: 1,
                            textAlign: 'right'
                          }}
                        >
                          {formatTime(message.time)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton>
                              <AttachFileIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* New Message Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start a new conversation or send a message.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
