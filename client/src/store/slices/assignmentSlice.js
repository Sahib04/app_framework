import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assignments: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError } = assignmentSlice.actions;
export default assignmentSlice.reducer;
