import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  grades: [],
  loading: false,
  error: null,
};

const gradeSlice = createSlice({
  name: 'grades',
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

export const { setLoading, setError, clearError } = gradeSlice.actions;
export default gradeSlice.reducer;
