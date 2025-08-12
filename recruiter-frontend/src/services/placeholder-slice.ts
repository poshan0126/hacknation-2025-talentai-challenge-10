import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface PlaceholderState {
  loading: boolean;
  success: boolean;
  fetched: boolean;
}

const initialState: PlaceholderState = {
  loading: false,
  success: false,
  fetched: false,
};

const placeholderSlice = createSlice({
  name: 'placeholder',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
    },
    setFetched: (state, action: PayloadAction<boolean>) => {
      state.fetched = action.payload;
    },
  },
});

export const { setLoading, setSuccess, setFetched } = placeholderSlice.actions;

export default placeholderSlice.reducer;