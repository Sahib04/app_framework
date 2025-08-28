import React, { useState, useMemo, useEffect } from 'react';
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
// Resolve API base URL similar to services/api
const configuredBase = process.env.REACT_APP_API_URL;
const resolvedBase = configuredBase
  ? configuredBase.replace(/\/$/, '')
  : (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : 'http://localhost:5000';
const API_BASE = resolvedBase.endsWith('/api') ? resolvedBase : `${resolvedBase}/api`;

const Grades = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeLevels = useMemo(() => (
    ['Nursery', 'KG', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)]
  ), []);

  const [serverSummaries, setServerSummaries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const q = selectedGrade && selectedGrade !== 'All' ? `?level=${encodeURIComponent(selectedGrade)}` : '';
        const res = await fetch(`${API_BASE}/grades/summary${q}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data?.summaries) ? data.summaries : [];
        setServerSummaries(arr.map((g, i) => ({
          id: i + 1,
          level: g.level || 'Unassigned',
          students: Number(g.students) || 0,
          averageGpa: Number(g.averageGpa || 0),
          topCourse: g.topCourse || '-',
          lastUpdated: g.lastUpdated || new Date().toISOString()
        })));
      } catch (e) {
        setError('Failed to load grade summaries');
        setServerSummaries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedGrade]);

  const visibleSummaries = useMemo(() => (
    (serverSummaries || []).filter(g => selectedGrade === 'All' || g.level === selectedGrade)
  ), [serverSummaries, selectedGrade]);

  const getGPAColor = (gpa) => {
    if (gpa >= 3.8) return 'success';
    if (gpa >= 3.5) return 'primary';
    if (gpa >= 3.0) return 'warning';
    return 'error';
  };

  // Remove legacy mock and dialog handlers to ensure real data only

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Grades
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage student academic performance by grade level
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Grade Level</InputLabel>
          <Select
            value={selectedGrade}
            label="Grade Level"
            onChange={(e) => setSelectedGrade(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {gradeLevels.map(g => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Admin actions can be added here if needed */}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search grade level or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {loading && (
        <Typography sx={{ mb: 2 }}>Loading summaries...</Typography>
      )}

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
          {visibleSummaries
            .filter(g => g.level.toLowerCase().includes(searchTerm.toLowerCase()) || g.topCourse.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((g) => (
              <Grid item xs={12} md={6} lg={4} key={g.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{g.level}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip label={`${g.students} Students`} size="small" />
                      <Chip label={`Avg GPA: ${g.averageGpa}`} color={getGPAColor(g.averageGpa)} size="small" />
                    </Box>
                  <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                      Top Course: {g.topCourse}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(g.lastUpdated).toLocaleDateString()}
                    </Typography>
                </CardContent>
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
                <TableCell>Grade Level</TableCell>
                <TableCell>Students</TableCell>
                <TableCell>Average GPA</TableCell>
                <TableCell>Top Course</TableCell>
                <TableCell>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleSummaries
                .filter(g => g.level.toLowerCase().includes(searchTerm.toLowerCase()) || g.topCourse.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>{g.level}</TableCell>
                    <TableCell>{g.students}</TableCell>
                  <TableCell>
                      <Chip label={g.averageGpa} color={getGPAColor(g.averageGpa)} size="small" />
                  </TableCell>
                    <TableCell>{g.topCourse}</TableCell>
                    <TableCell>{new Date(g.lastUpdated).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Real data only; admin grade creation UI can be added later */}
    </Box>
  );
};

export default Grades;
