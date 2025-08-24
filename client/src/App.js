import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import store from './store';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import Dashboard from './pages/Dashboard/Dashboard';
import Courses from './pages/Courses/Courses';
import Users from './pages/Users/Users';
import Tests from './pages/Tests/Tests';
import Attendance from './pages/Attendance/Attendance';
import Grades from './pages/Grades/Grades';
import Assignments from './pages/Assignments/Assignments';
import Messages from './pages/Messages/Messages';
import Events from './pages/Events/Events';
import Fees from './pages/Fees/Fees';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Role-based route helper
const RoleRoute = ({ roles, children }) => {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/users" element={<RoleRoute roles={['admin']}><Users /></RoleRoute>} />
                <Route path="/courses" element={<RoleRoute roles={['admin', 'teacher', 'student']}><Courses /></RoleRoute>} />
                <Route path="/classes" element={<RoleRoute roles={['admin', 'teacher', 'student']}><Attendance /></RoleRoute>} />
                <Route path="/attendance" element={<RoleRoute roles={['admin', 'teacher', 'student', 'parent']}><Attendance /></RoleRoute>} />
                <Route path="/grades" element={<RoleRoute roles={['admin', 'teacher', 'student', 'parent']}><Grades /></RoleRoute>} />
                <Route path="/assignments" element={<RoleRoute roles={['admin', 'teacher', 'student']}><Assignments /></RoleRoute>} />
                <Route path="/tests" element={<RoleRoute roles={['admin', 'teacher', 'student']}><Tests /></RoleRoute>} />
                <Route path="/messages" element={<RoleRoute roles={['admin', 'teacher', 'student', 'parent']}><Messages /></RoleRoute>} />
                <Route path="/events" element={<RoleRoute roles={['admin', 'teacher', 'student', 'parent']}><Events /></RoleRoute>} />
                <Route path="/fees" element={<RoleRoute roles={['admin', 'parent']}><Fees /></RoleRoute>} />
                
                {/* Teacher Routes */}
                <Route path="/students" element={<RoleRoute roles={['admin', 'teacher']}><Users /></RoleRoute>} />
                
                {/* Student Routes */}
                <Route path="/teachers" element={<RoleRoute roles={['admin', 'student']}><Users /></RoleRoute>} />
                
                {/* Common Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Redirect to dashboard by default */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
