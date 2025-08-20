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
  ListItemAvatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Payment as PaymentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Fees = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [viewMode, setViewMode] = useState(0);

  // Mock data - replace with actual API calls
  const feeRecords = [
    {
      id: 1,
      studentName: 'Alex Johnson',
      studentId: 'STU001',
      feeType: 'Tuition Fee',
      amount: 2500.00,
      paidAmount: 2000.00,
      dueAmount: 500.00,
      dueDate: '2024-03-15',
      status: 'Partial',
      paymentMethod: 'Credit Card',
      lastPaymentDate: '2024-02-01',
      course: 'Advanced Mathematics',
      semester: 'Fall 2024',
      image: 'https://source.unsplash.com/100x100/?student',
      paymentHistory: [
        { date: '2024-01-15', amount: 1000.00, method: 'Credit Card', status: 'Completed' },
        { date: '2024-02-01', amount: 1000.00, method: 'Credit Card', status: 'Completed' }
      ]
    },
    {
      id: 2,
      studentName: 'Maria Garcia',
      studentId: 'STU002',
      feeType: 'Tuition Fee',
      amount: 2500.00,
      paidAmount: 2500.00,
      dueAmount: 0.00,
      dueDate: '2024-03-15',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      lastPaymentDate: '2024-01-20',
      course: 'Computer Science Fundamentals',
      semester: 'Fall 2024',
      image: 'https://source.unsplash.com/100x100/?student-female',
      paymentHistory: [
        { date: '2024-01-20', amount: 2500.00, method: 'Bank Transfer', status: 'Completed' }
      ]
    },
    {
      id: 3,
      studentName: 'David Chen',
      studentId: 'STU003',
      feeType: 'Tuition Fee',
      amount: 2500.00,
      paidAmount: 0.00,
      dueAmount: 2500.00,
      dueDate: '2024-03-15',
      status: 'Unpaid',
      paymentMethod: '',
      lastPaymentDate: '',
      course: 'English Literature',
      semester: 'Fall 2024',
      image: 'https://source.unsplash.com/100x100/?student-male',
      paymentHistory: []
    },
    {
      id: 4,
      studentName: 'Sarah Wilson',
      studentId: 'STU004',
      feeType: 'Lab Fee',
      amount: 150.00,
      paidAmount: 150.00,
      dueAmount: 0.00,
      dueDate: '2024-02-28',
      status: 'Paid',
      paymentMethod: 'Cash',
      lastPaymentDate: '2024-01-25',
      course: 'Chemistry Lab',
      semester: 'Fall 2024',
      image: 'https://source.unsplash.com/100x100/?student-female',
      paymentHistory: [
        { date: '2024-01-25', amount: 150.00, method: 'Cash', status: 'Completed' }
      ]
    }
  ];

  const statuses = ['all', 'Paid', 'Partial', 'Unpaid', 'Overdue'];
  const feeTypes = ['all', 'Tuition Fee', 'Lab Fee', 'Library Fee', 'Sports Fee', 'Other'];

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesType = filterType === 'all' || record.feeType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddFee = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Partial': return 'warning';
      case 'Unpaid': return 'error';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getPaymentProgress = (paid, total) => {
    return total > 0 ? (paid / total) * 100 : 0;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalRevenue = () => {
    return feeRecords.reduce((total, record) => total + record.paidAmount, 0);
  };

  const getTotalOutstanding = () => {
    return feeRecords.reduce((total, record) => total + record.dueAmount, 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
            Fees & Payments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage student fees, track payments, and monitor financial records
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'accountant') && (
          <Fab
            color="primary"
            aria-label="add fee"
            onClick={handleAddFee}
            sx={{ boxShadow: 3 }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(getTotalRevenue())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(getTotalOutstanding())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Outstanding Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {feeRecords.filter(r => r.status === 'Paid').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fully Paid
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {feeRecords.filter(r => r.status === 'Unpaid' || r.status === 'Partial').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payment
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
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
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={filterType}
                label="Fee Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                {feeTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
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
                setFilterStatus('all');
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
          <Tab label="Card View" />
          <Tab label="Table View" />
          <Tab label="Timeline View" />
        </Tabs>
      </Box>

      {/* Card View */}
      {viewMode === 0 && (
        <Grid container spacing={3}>
          {filteredRecords.map((record) => (
            <Grid item xs={12} md={6} lg={4} key={record.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={record.image}
                      sx={{ width: 50, height: 50, mr: 2 }}
                    >
                      {record.studentName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {record.studentName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {record.studentId}
                      </Typography>
                      <Chip
                        label={record.status}
                        color={getStatusColor(record.status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  {/* Course Info */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BookIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {record.course}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {record.semester}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Fee Details */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Fee Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(record.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Fee
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(record.paidAmount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Paid Amount
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Payment Progress */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getPaymentProgress(record.paidAmount, record.amount).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getPaymentProgress(record.paidAmount, record.amount)}
                      color={getStatusColor(record.status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Due Amount */}
                  {record.dueAmount > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        Due Amount: {formatCurrency(record.dueAmount)}
                      </Alert>
                      <Typography variant="body2" color="text.secondary">
                        Due Date: {new Date(record.dueDate).toLocaleDateString()}
                      </Typography>
                      {isOverdue(record.dueDate) && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Overdue!
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Payment History */}
                  {record.paymentHistory.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Payments
                      </Typography>
                      <List dense>
                        {record.paymentHistory.slice(0, 2).map((payment, index) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                                <ReceiptIcon fontSize="small" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={formatCurrency(payment.amount)}
                              secondary={`${payment.method} - ${new Date(payment.date).toLocaleDateString()}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button size="small" variant="outlined" startIcon={<ViewIcon />} fullWidth>
                    View Details
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'accountant') && (
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

      {/* Table View */}
      {viewMode === 1 && (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Fee Type</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Paid Amount</TableCell>
                <TableCell>Due Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={record.image} sx={{ mr: 2 }}>
                        {record.studentName.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {record.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.studentId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{record.course}</TableCell>
                  <TableCell>{record.feeType}</TableCell>
                  <TableCell>{formatCurrency(record.amount)}</TableCell>
                  <TableCell>{formatCurrency(record.paidAmount)}</TableCell>
                  <TableCell>
                    <Typography color={record.dueAmount > 0 ? 'error.main' : 'success.main'}>
                      {formatCurrency(record.dueAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(record.dueDate).toLocaleDateString()}
                    </Typography>
                    {isOverdue(record.dueDate) && (
                      <Chip label="Overdue" color="error" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(user?.role === 'admin' || user?.role === 'accountant') && (
                        <>
                          <Tooltip title="Edit Record">
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Record">
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

      {/* Timeline View */}
      {viewMode === 2 && (
        <Paper sx={{ p: 3, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Timeline
      </Typography>
          {/* Timeline component was removed, so this section is now a placeholder */}
          <Typography variant="body2" color="text.secondary">
            Timeline view is not available in this version.
        </Typography>
      </Paper>
      )}

      {/* Add Fee Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Fee Record</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a new fee record for a student.
          </Typography>
          {/* Add form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Add Fee Record
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Fees;
