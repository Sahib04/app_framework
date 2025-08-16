import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Debug logging
  console.log('=== DASHBOARD DEBUG ===');
  console.log('User object:', user);
  console.log('User role:', user?.role);
  console.log('User ID:', user?.id);
  console.log('User email:', user?.email);
  console.log('Is user truthy?', !!user);
  console.log('======================');

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'parent':
      return <ParentDashboard />;
    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Welcome to School Management System</h2>
          <p>Please contact an administrator to set up your role.</p>
          
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', textAlign: 'left' }}>
            <h3>Debug Info:</h3>
            <p><strong>User:</strong> {JSON.stringify(user, null, 2)}</p>
            <p><strong>Role:</strong> {user?.role || 'undefined'}</p>
            <p><strong>Is Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'undefined'}</p>
            <p><strong>User Email:</strong> {user?.email || 'undefined'}</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
