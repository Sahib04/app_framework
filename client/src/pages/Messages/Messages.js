import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { io } from 'socket.io-client';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';
const WS_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const Messages = () => {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [conversations, setConversations] = useState([]);
  const [peers, setPeers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [peerTyping, setPeerTyping] = useState(false);
  const listRef = useRef(null);
  const socketRef = useRef(null);

  // Load peers (teacher sees students, student sees teachers)
  useEffect(() => {
    const loadPeers = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/peers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setPeers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load peers', e);
      }
    };
    if (token) loadPeers();
  }, [token]);

  // Reusable: load conversations
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load conversations', e);
    }
  }, [token]);

  // Socket connect
  useEffect(() => {
    if (!token) return;
    const socket = io(WS_BASE, { auth: { token } });
    socketRef.current = socket;
    socket.on('message', async ({ message }) => {
      // Always refresh conversations so new threads appear/move to top
      await loadConversations();

      // If the incoming message belongs to current chat, append and mark seen
      if (selectedChat && message.conversationId === selectedChat.id) {
        setMessages(prev => [...prev, message]);
        // auto mark seen if I am receiver
        if (message.receiverId === user?.id) {
          fetch(`${API_BASE}/messages/${message.id}/seen`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 0);
        return;
      }

      // If we don't have a conversation selected or it's a placeholder, and message involves me, try to auto-enter that convo
      const involvesMe = message.senderId === user?.id || message.receiverId === user?.id;
      if (involvesMe && (!selectedChat || !selectedChat.id)) {
        // Find conversation in refreshed list
        setConversations(prev => {
          const found = (prev || []).find(c => c.id === message.conversationId);
          if (found) setSelectedChat(found);
          return prev;
        });
      }
    });
    socket.on('typing', ({ from }) => {
      // if typing from current peer, show typing
      const peerId = resolvePeerId(selectedChat || {});
      if (peerId && from === String(peerId)) {
        setPeerTyping(true);
        setTimeout(() => setPeerTyping(false), 1200);
      }
    });
    socket.on('seen', ({ messageId, seenAt }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, seenAt } : m));
    });
    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedChat?.id, loadConversations]);

  // Initial load conversations
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat?.id) return setMessages([]);
      try {
        const res = await fetch(`${API_BASE}/messages/${selectedChat.id}?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
        }, 0);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load messages', e);
      }
    };
    if (token) loadMessages();
  }, [token, selectedChat]);

  const conversationTypes = ['all', 'individual'];

  const filteredConversations = conversations.filter(conversation => {
    const matchesType = filterType === 'all' || 'individual' === filterType;
    const matchesSearch = !searchTerm || String(conversation.id).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handlePeerClick = async (peer) => {
    // prepare placeholder conversation for first message
    setSelectedChat({ id: null, teacherId: user.role === 'teacher' ? user.id : peer.id, studentId: user.role === 'student' ? user.id : peer.id });
    setMessages([]);
    setViewMode(1);
  };

  const handleNewMessage = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const resolvePeerId = (conv) => {
    if (!conv || !user) return null;
    if (conv.id) return user.id === conv.teacherId ? conv.studentId : conv.teacherId;
    // when conv is placeholder (before first message)
    return user.role === 'teacher' ? conv.studentId : conv.teacherId;
  };

  const isUrl = (text) => {
    try {
      const url = new URL(text);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const receiverId = resolvePeerId(selectedChat);
      const contentType = isUrl(newMessage.trim()) ? 'link' : 'text';
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, body: newMessage, contentType })
      });
      const sent = await res.json();
      if (res.ok) {
        // Ensure conversations list updates and selected chat gets real id
        await loadConversations();
        if (!selectedChat.id) {
          setConversations(prev => {
            const found = (prev || []).find(c => c.teacherId === (user.role==='teacher'?user.id:receiverId) && c.studentId === (user.role==='student'?user.id:receiverId));
            if (found) setSelectedChat(found);
            return prev;
          });
        }
        setMessages(prev => [...prev, sent]);
        setNewMessage('');
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 0);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to send', e);
    }
  };

  const emitTyping = () => {
    try {
      if (!socketRef.current || !selectedChat) return;
      const to = resolvePeerId(selectedChat);
      if (!to) return;
      socketRef.current.emit('typing', { to });
    } catch (e) {}
  };

  const onFilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    try {
      const receiverId = resolvePeerId(selectedChat);
      const form = new FormData();
      form.append('file', file);
      form.append('receiverId', receiverId);
      const res = await fetch(`${API_BASE}/messages/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const sent = await res.json();
      if (res.ok) {
        await loadConversations();
        if (!selectedChat.id) {
          setConversations(prev => {
            const found = (prev || []).find(c => c.teacherId === (user.role==='teacher'?user.id:receiverId) && c.studentId === (user.role==='student'?user.id:receiverId));
            if (found) setSelectedChat(found);
            return prev;
          });
        }
        setMessages(prev => [...prev, sent]);
        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 0);
      }
    } catch (err) {
      console.error('image upload failed', err);
    }
  };

  const getConversationTitle = (conversation) => {
    if (!user || !conversation) return 'Conversation';
    const mineIsTeacher = user.role === 'teacher' && user.id === conversation.teacherId;
    if (mineIsTeacher) return 'Chat with student';
    if (user.role === 'student' && user.id === conversation.studentId) return 'Chat with teacher';
    return 'Conversation';
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
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
            Communicate with teachers and students
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

      <Grid container spacing={2}>
        {/* Peers list */}
        <Grid item xs={12} md={4} lg={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user?.role === 'teacher' ? 'Students' : 'Teachers'}
              </Typography>
              <TextField
                size="small"
                placeholder={`Search ${user?.role === 'teacher' ? 'students' : 'teachers'}...`}
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                sx={{ mb: 2 }}
              />
              <List dense>
                {peers
                  .filter(p => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => (
                  <ListItem key={p.id} button onClick={() => handlePeerClick(p)}>
                    <ListItemAvatar>
                      <Avatar src={p.profilePicture}>
                        {p.firstName?.[0]}{p.lastName?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`${p.firstName} ${p.lastName}`} secondary={p.email} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main area */}
        <Grid item xs={12} md={8} lg={9}>
          {/* View Mode Tabs */}
          <Box sx={{ mb: 2 }}>
            <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
              <Tab label="Conversations" />
              <Tab label="Chat View" />
            </Tabs>
          </Box>

          {/* Conversations View */}
          {viewMode === 0 && (
            <Grid container spacing={2}>
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
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ width: 50, height: 50, mr: 2, bgcolor: 'primary.main' }}>
                          <PeopleIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" noWrap>
                            {getConversationTitle(conversation)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            Conversation ID: {conversation.id}
                          </Typography>
                          <Chip label={formatTime(conversation.lastMessageAt)} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
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
              <Card sx={{ mb: 2, boxShadow: 3 }}>
                <CardContent sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => setViewMode(0)} sx={{ mr: 1 }}>
                        <MessageIcon />
                      </IconButton>
                      <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {getConversationTitle(selectedChat)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedChat.id ? `Conversation ID: ${selectedChat.id}` : 'New conversation'}
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

              <Card sx={{ flexGrow: 1, mb: 2, boxShadow: 3 }}>
                <CardContent sx={{ height: '100%', p: 0 }}>
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box ref={listRef} sx={{ flexGrow: 1, p: 2, overflowY: 'auto' }}>
                      {messages.map((message) => (
                        <Box key={message.id} sx={{ display: 'flex', justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start', mb: 2 }}>
                          <Box sx={{ maxWidth: '70%', bgcolor: message.senderId === user?.id ? 'primary.main' : 'grey.100', color: message.senderId === user?.id ? 'white' : 'text.primary', p: 2, borderRadius: 2 }}>
                            {message.contentType === 'image' && (
                              <img src={message.body} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8 }} />
                            )}
                            {message.contentType === 'video' && (
                              <video controls src={message.body} style={{ maxWidth: '100%', borderRadius: 8 }} />
                            )}
                            {message.contentType === 'audio' && (
                              <audio controls src={message.body} style={{ width: '100%' }} />
                            )}
                            {(message.contentType === 'document' || message.contentType === 'file') && (
                              <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>Attachment</Typography>
                                <Button component="a" href={message.body} target="_blank" rel="noopener noreferrer" variant="outlined" size="small">
                                  Download
                                </Button>
                              </Box>
                            )}
                            {message.contentType === 'link' && (
                              <Typography variant="body2">
                                <a href={message.body} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                  {message.body}
                                </a>
                              </Typography>
                            )}
                            {message.contentType === 'text' && (
                              <Typography variant="body2">{message.body}</Typography>
                            )}
                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1, textAlign: 'right' }}>
                              {formatTime(message.sentAt)} {message.senderId === user?.id && (message.seenAt ? '✓✓' : '✓')}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {peerTyping && <Typography variant="caption" color="text.secondary">Typing…</Typography>}
                    </Box>

                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); else emitTyping(); }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton component="label">
                                  <AttachFileIcon />
                                  <input type="file" hidden onChange={onFilePick} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                        <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                          <SendIcon />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* New Message Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Message</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start a new conversation or send a message.
          </Typography>
          {/* TODO: implement user search and select teacher/student */}
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
