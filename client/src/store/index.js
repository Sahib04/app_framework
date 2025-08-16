import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import courseReducer from './slices/courseSlice';
import classReducer from './slices/classSlice';
import gradeReducer from './slices/gradeSlice';
import attendanceReducer from './slices/attendanceSlice';
import feeReducer from './slices/feeSlice';
import messageReducer from './slices/messageSlice';
import assignmentReducer from './slices/assignmentSlice';
import eventReducer from './slices/eventSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    courses: courseReducer,
    classes: classReducer,
    grades: gradeReducer,
    attendance: attendanceReducer,
    fees: feeReducer,
    messages: messageReducer,
    assignments: assignmentReducer,
    events: eventReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
