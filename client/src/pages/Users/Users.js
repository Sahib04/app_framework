import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Grid, Card, CardContent, Typography, Avatar, Chip, TextField, InputAdornment, IconButton, Divider, List, ListItem, ListItemAvatar, ListItemText, CardActions, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Search as SearchIcon, People as PeopleIcon, School as SchoolIcon, Email as EmailIcon, Phone as PhoneIcon, FamilyRestroom as GuardianIcon, Info as InfoIcon, Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api';

const Users = () => {
  const { token, user } = useAuth();
  const [tab, setTab] = useState(0);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [guardiansByStudent, setGuardiansByStudent] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [error, setError] = useState('');

  // Detail Dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [detailType, setDetailType] = useState(null); // 'student' | 'teacher'
  const [detailGuardians, setDetailGuardians] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create/Edit Dialog
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const [editOpen, setEditOpen] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'student' | 'teacher'
  const [editData, setEditData] = useState({});
  const [editGuardians, setEditGuardians] = useState([{ firstName:'', lastName:'', email:'', phone:'', relation:'parent' }]);
  const [saving, setSaving] = useState(false);

  const openCreate = (mode) => {
    setEditMode(mode);
    setEditData({ role: mode, firstName:'', lastName:'', email:'', phone:'', grade:'', section:'', studentId:'', department:'', specialization:'', password:'' });
    setEditGuardians([{ firstName:'', lastName:'', email:'', phone:'', relation:'parent' }]);
    setEditOpen(true);
  };
  const openEdit = (mode, item) => {
    setEditMode(mode);
    setEditData({ ...item, password:'' });
    setEditGuardians([{ firstName:'', lastName:'', email:'', phone:'', relation:'parent' }]);
    setEditOpen(true);
  };
  const closeEdit = () => { setEditOpen(false); setEditMode(null); setEditData({}); setEditGuardians([{ firstName:'', lastName:'', email:'', phone:'', relation:'parent' }]); };

  const saveUser = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!editData.firstName || !editData.lastName || !editData.email || !editData.password) {
        alert('Please fill in all required fields (First Name, Last Name, Email, Password)');
        return;
      }

      if (editMode === 'student' && !editData.id) {
        // create student with guardians
        const payload = { 
          student: { 
            firstName: editData.firstName, 
            lastName: editData.lastName, 
            email: editData.email, 
            phone: editData.phone, 
            grade: editData.grade, 
            section: editData.section, 
            studentId: editData.studentId, 
            password: editData.password 
          }, 
          guardians: editGuardians.filter(g => g.email && g.firstName && g.lastName) 
        };
        console.log('Creating student with payload:', payload);
        const res = await fetch(`${API_BASE}/users/students`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Create failed');
        }
        alert('Student created successfully!');
        await loadStudents();
      } else if (editMode === 'student' && editData.id) {
        const res = await fetch(`${API_BASE}/users/${editData.id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(editData) 
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Update failed');
        }
        alert('Student updated successfully!');
        await loadStudents();
      } else if (editMode === 'teacher' && !editData.id) {
        const payload = { 
          role: 'teacher', 
          firstName: editData.firstName, 
          lastName: editData.lastName, 
          email: editData.email, 
          phone: editData.phone, 
          department: editData.department, 
          specialization: editData.specialization, 
          password: editData.password 
        };
        console.log('Creating teacher with payload:', payload);
        const res = await fetch(`${API_BASE}/users`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(payload) 
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Create failed');
        }
        alert('Teacher created successfully!');
        await loadTeachers();
      } else if (editMode === 'teacher' && editData.id) {
        const res = await fetch(`${API_BASE}/users/${editData.id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
          body: JSON.stringify(editData) 
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Update failed');
        }
        alert('Teacher updated successfully!');
        await loadTeachers();
      }
      closeEdit();
    } catch (e) {
      console.error('Save failed', e);
      alert(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setError('');
      let url = '';
      if (isAdmin) {
        url = `${API_BASE}/users/students/list`;
      } else if (isTeacher) {
        // Teacher sees students via peers
        url = `${API_BASE}/users/peers`;
      } else {
        // Others not allowed
        setStudents([]);
        return;
      }
      console.log('Loading students from:', url);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Students response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Students response data:', data);
      
      let list = [];
      if (isAdmin) {
        list = Array.isArray(data.students) ? data.students : (Array.isArray(data) ? data : []);
      } else {
        list = Array.isArray(data) ? data : [];
      }
      
      console.log('Setting students list:', list);
      setStudents(list);
    } catch (e) {
      console.error('Failed to load students', e);
      setError(`Failed to load students: ${e.message}`);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      setError('');
      let url = '';
      if (isAdmin) {
        url = `${API_BASE}/users/teachers/list`;
      } else if (isStudent) {
        // Student sees teachers via peers
        url = `${API_BASE}/users/peers`;
      } else {
        setTeachers([]);
        return;
      }
      console.log('Loading teachers from:', url);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Teachers response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Teachers response data:', data);
      
      let list = [];
      if (isAdmin) {
        list = Array.isArray(data.teachers) ? data.teachers : (Array.isArray(data) ? data : []);
      } else {
        list = Array.isArray(data) ? data : [];
      }
      
      console.log('Setting teachers list:', list);
      setTeachers(list);
    } catch (e) {
      console.error('Failed to load teachers', e);
      setError(`Failed to load teachers: ${e.message}`);
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => { 
    console.log('Users useEffect triggered:', { token, isAdmin, isTeacher, isStudent, user });
    if (!token) return;
    if (isAdmin || isTeacher) loadStudents();
    if (isAdmin || isStudent) loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAdmin, isTeacher, isStudent]);

  const filteredStudents = (students || []).filter(s => (`${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase())));
  const filteredTeachers = (teachers || []).filter(t => (`${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) || (t.email || '').toLowerCase().includes(search.toLowerCase())));

  const loadGuardians = async (student) => {
    try {
      const idOrStudentId = student.studentId || student.id;
      const res = await fetch(`${API_BASE}/users/guardians-of/${idOrStudentId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setGuardiansByStudent(prev => ({ ...prev, [student.id]: data.guardians || [] }));
      return data.guardians || [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed guardians', e);
      return [];
    }
  };

  const openDetails = async (user, type) => {
    setDetailUser(user);
    setDetailType(type);
    setDetailOpen(true);
    if (type === 'student') {
      setDetailLoading(true);
      const gs = await loadGuardians(user);
      setDetailGuardians(gs);
      setDetailLoading(false);
    } else {
      setDetailGuardians([]);
    }
  };

  const closeDetails = () => {
    setDetailOpen(false);
    setDetailUser(null);
    setDetailType(null);
    setDetailGuardians([]);
    setDetailLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Users</Typography>
        <Box sx={{ display:'flex', gap:1, alignItems:'center' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          {isAdmin && (
            <>
              <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => openCreate('student')}>New Student</Button>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openCreate('teacher')}>New Teacher</Button>
            </>
          )}
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {isAdmin && (
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Students" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Teachers" icon={<SchoolIcon />} iconPosition="start" />
        </Tabs>
      )}

      {/* Students */}
      {(isAdmin && tab === 0) || isTeacher ? (
        <Box>
          {loadingStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading students...</Typography>
            </Box>
          ) : filteredStudents.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                {isAdmin ? 'No students found. Create your first student!' : 'No students available.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredStudents.map(st => (
                <Grid item xs={12} md={6} lg={4} key={st.id}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={st.profilePicture} sx={{ mr: 2 }}>{st.firstName?.[0]}{st.lastName?.[0]}</Avatar>
                        <Box>
                          <Typography variant="h6">{st.firstName} {st.lastName}</Typography>
                          <Typography variant="body2" color="text.secondary">{st.email}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {st.studentId && <Chip label={`ID: ${st.studentId}`} size="small" />}
                        {st.grade && <Chip label={`Grade: ${st.grade}`} size="small" />}
                        {st.section && <Chip label={`Section: ${st.section}`} size="small" />}
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" />
                          <Typography variant="body2">{st.email || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="body2">{st.phone || 'N/A'}</Typography>
                        </Box>
                      </Box>

                      {/* Guardians quick view button */}
                      <Box sx={{ mt: 2 }}>
                        <Button size="small" variant="outlined" onClick={() => openDetails(st, 'student')} startIcon={<InfoIcon />}>View Details</Button>
                        {isAdmin && (
                          <Button size="small" sx={{ ml:1 }} variant="contained" startIcon={<EditIcon />} onClick={() => openEdit('student', st)}>Edit</Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : null}

      {/* Teachers */}
      {(isAdmin && tab === 1) || isStudent ? (
        <Box>
          {loadingTeachers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading teachers...</Typography>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography color="text.secondary">
                {isAdmin ? 'No teachers found. Create your first teacher!' : 'No teachers available.'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredTeachers.map(tc => (
                <Grid item xs={12} md={6} lg={4} key={tc.id}>
                  <Card sx={{ boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={tc.profilePicture} sx={{ mr: 2 }}>{tc.firstName?.[0]}{tc.lastName?.[0]}</Avatar>
                        <Box>
                          <Typography variant="h6">{tc.firstName} {tc.lastName}</Typography>
                          <Typography variant="body2" color="text.secondary">{tc.email}</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`Role: ${tc.role}`} size="small" />
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" />
                          <Typography variant="body2">{tc.email || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" />
                          <Typography variant="body2">{tc.phone || 'N/A'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Button size="small" variant="outlined" onClick={() => openDetails(tc, 'teacher')} startIcon={<InfoIcon />}>View Details</Button>
                        {isAdmin && (
                          <Button size="small" sx={{ ml:1 }} variant="contained" startIcon={<EditIcon />} onClick={() => openEdit('teacher', tc)}>Edit</Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : null}

      {/* Details Dialog (read-only) */}
      <Dialog open={detailOpen} onClose={closeDetails} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {detailUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={detailUser.profilePicture} sx={{ mr: 2 }}>
                  {detailUser.firstName?.[0]}{detailUser.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{detailUser.firstName} {detailUser.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{detailUser.email}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {detailType === 'teacher' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Teacher Information</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip label={`Role: ${detailUser.role}`} size="small" />
                    {detailUser.department && <Chip label={`Dept: ${detailUser.department}`} size="small" />}
                    {detailUser.specialization && <Chip label={`Spec: ${detailUser.specialization}`} size="small" />}
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{detailUser.email || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{detailUser.phone || 'N/A'}</Typography>
                  </Box>
                </Box>
              )}

              {detailType === 'student' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Student Information</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {detailUser.studentId && <Chip label={`ID: ${detailUser.studentId}`} size="small" />}
                    {detailUser.grade && <Chip label={`Grade: ${detailUser.grade}`} size="small" />}
                    {detailUser.section && <Chip label={`Section: ${detailUser.section}`} size="small" />}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>Contact</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <Typography variant="body2">{detailUser.email || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PhoneIcon fontSize="small" />
                    <Typography variant="body2">{detailUser.phone || 'N/A'}</Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>Guardians</Typography>
                  {detailLoading ? (
                    <Typography variant="body2" color="text.secondary">Loading guardians...</Typography>
                  ) : (
                    <List dense>
                      {(guardiansByStudent[detailUser.id] || detailGuardians || []).map(g => (
                        <ListItem key={g.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar src={g.profilePicture}>
                              <GuardianIcon fontSize="small" />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={`${g.firstName} ${g.lastName}`} secondary={`${g.email} • ${g.phone || 'N/A'}`} />
                        </ListItem>
                      ))}
                      {((guardiansByStudent[detailUser.id] || detailGuardians || []).length === 0) && (
                        <Typography variant="body2" color="text.secondary">No guardians found.</Typography>
                      )}
                    </List>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>{editData?.id ? `Edit ${editMode}` : `Create ${editMode}`}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
            <TextField label="First Name" value={editData.firstName||''} onChange={e=>setEditData(d=>({...d, firstName:e.target.value}))} fullWidth />
            <TextField label="Last Name" value={editData.lastName||''} onChange={e=>setEditData(d=>({...d, lastName:e.target.value}))} fullWidth />
            <TextField label="Email" value={editData.email||''} onChange={e=>setEditData(d=>({...d, email:e.target.value}))} fullWidth />
            <TextField label="Phone" value={editData.phone||''} onChange={e=>setEditData(d=>({...d, phone:e.target.value}))} fullWidth />
            <TextField label="Password" type="password" value={editData.password||''} onChange={e=>setEditData(d=>({...d, password:e.target.value}))} fullWidth />
            {editMode==='student' && (
              <>
                <TextField label="Student ID" value={editData.studentId||''} onChange={e=>setEditData(d=>({...d, studentId:e.target.value}))} fullWidth />
                <TextField label="Grade" value={editData.grade||''} onChange={e=>setEditData(d=>({...d, grade:e.target.value}))} fullWidth />
                <TextField label="Section" value={editData.section||''} onChange={e=>setEditData(d=>({...d, section:e.target.value}))} fullWidth />
                <Divider sx={{ my:1 }} />
                <Typography variant="subtitle2">Guardians</Typography>
                {editGuardians.map((g, idx)=> (
                  <Box key={idx} sx={{ display:'flex', gap:1, mb:1 }}>
                    <TextField label="First Name" value={g.firstName} onChange={e=>{
                      const next=[...editGuardians]; next[idx]={...next[idx], firstName:e.target.value}; setEditGuardians(next);
                    }} />
                    <TextField label="Last Name" value={g.lastName} onChange={e=>{
                      const next=[...editGuardians]; next[idx]={...next[idx], lastName:e.target.value}; setEditGuardians(next);
                    }} />
                    <TextField label="Email" value={g.email} onChange={e=>{
                      const next=[...editGuardians]; next[idx]={...next[idx], email:e.target.value}; setEditGuardians(next);
                    }} />
                    <TextField label="Phone" value={g.phone} onChange={e=>{
                      const next=[...editGuardians]; next[idx]={...next[idx], phone:e.target.value}; setEditGuardians(next);
                    }} />
                    <TextField label="Relation" value={g.relation} onChange={e=>{
                      const next=[...editGuardians]; next[idx]={...next[idx], relation:e.target.value}; setEditGuardians(next);
                    }} />
                  </Box>
                ))}
                <Button size="small" onClick={()=>setEditGuardians(prev=>[...prev,{ firstName:'', lastName:'', email:'', phone:'', relation:'parent' }])}>Add Guardian</Button>
              </>
            )}
            {editMode==='teacher' && (
              <>
                <TextField label="Department" value={editData.department||''} onChange={e=>setEditData(d=>({...d, department:e.target.value}))} fullWidth />
                <TextField label="Specialization" value={editData.specialization||''} onChange={e=>setEditData(d=>({...d, specialization:e.target.value}))} fullWidth />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={saveUser} disabled={saving} variant="contained">{editData?.id ? 'Save' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
