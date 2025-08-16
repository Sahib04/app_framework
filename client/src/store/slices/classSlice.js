import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  classes: [],
  loading: false,
  error: null,
};

const classSlice = createSlice({
  name: 'classes',
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

export const { setLoading, setError, clearError } = classSlice.actions;
export default classSlice.reducer;
