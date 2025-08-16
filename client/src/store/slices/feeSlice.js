import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fees: [],
  loading: false,
  error: null,
};

const feeSlice = createSlice({
  name: 'fees',
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

export const { setLoading, setError, clearError } = feeSlice.actions;
export default feeSlice.reducer;
