import React from 'react';
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
  Fab
} from '@mui/material';
import {
  School,
  Assignment,
  Grade,
  Schedule,
  Book,
  Add,
  Person,
  Group,
  Notifications,
  Payment,
  Message
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ParentDashboard = () => {
  const { user } = useAuth();

  const stats = {
    totalChildren: 2,
    averageGrade: 88.5,
    attendanceRate: 94.8,
    pendingPayments: 1
  };

  const children = [
    { 
      id: 1, 
      name: 'Alice Johnson', 
      grade: '10th Grade', 
      averageGrade: 92, 
      attendance: 96,
      courses: 6
    },
    { 
      id: 2, 
      name: 'Bob Johnson', 
      grade: '8th Grade', 
      averageGrade: 85, 
      attendance: 93,
      courses: 5
    }
  ];

  const payments = [
    { id: 1, description: 'Tuition Fee - January', amount: 1200, status: 'paid', date: '2024-01-05' },
    { id: 2, description: 'Lab Fee - Physics', amount: 150, status: 'pending', date: '2024-01-15' }
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

  const ChildCard = ({ child }) => (
    <Card sx={{ mb: 2, cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {child.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {child.grade} • {child.courses} courses
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip label={`Grade: ${child.averageGrade}%`} color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              {child.attendance}% attendance
            </Typography>
          </Box>
        </Box>
      </CardContent>
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
          Here's an overview of your children's academic progress.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Children"
            value={stats.totalChildren}
            icon={<Person />}
            color="#4CAF50"
            subtitle="Enrolled students"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Grade"
            value={`${stats.averageGrade}%`}
            icon={<Grade />}
            color="#2196F3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={<Schedule />}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<Payment />}
            color="#9C27B0"
            subtitle="Requires attention"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Children's Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Children's Progress
              </Typography>
              <Button variant="outlined" size="small">
                View Details
              </Button>
            </Box>

            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </Paper>
        </Grid>

        {/* Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Recent Payments
              </Typography>
              <Button variant="contained" size="small">
                Make Payment
              </Button>
            </Box>

            {payments.map((payment) => (
              <Card key={payment.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {payment.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Due: {payment.date}
                      </Typography>
                      <Chip 
                        label={payment.status} 
                        color={payment.status === 'paid' ? 'success' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary">
                        ${payment.amount}
                      </Typography>
                      {payment.status === 'pending' && (
                        <Button variant="contained" size="small" sx={{ mt: 1 }}>
                          Pay Now
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem button>
                <ListItemIcon>
                  <Message />
                </ListItemIcon>
                <ListItemText primary="Message Teacher" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Grade />
                </ListItemIcon>
                <ListItemText primary="Check Grades" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Payment />
                </ListItemIcon>
                <ListItemText primary="Make Payment" />
              </ListItem>
              <ListItem button>
                <ListItemIcon>
                  <Schedule />
                </ListItemIcon>
                <ListItemText primary="View Schedule" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Notifications
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem>
                <ListItemText 
                  primary="Parent-Teacher Conference" 
                  secondary="Scheduled for next week - 3:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Payment Reminder" 
                  secondary="Lab fee due in 3 days - $150"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Grade Update" 
                  secondary="Alice's math grade updated to A"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Attendance Alert" 
                  secondary="Bob missed Physics class yesterday"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default ParentDashboard;
