import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getFeedsApi } from '../../utils/burger-api';
import { TOrder, TOrdersData } from '../../utils/types';
import { RootState } from '../store';

interface FeedState extends TOrdersData {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  status: 'idle',
  error: null
};

export const fetchAllOrders = createAsyncThunk<
  TOrdersData,
  void,
  { rejectValue: string }
>('feed/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await getFeedsApi();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch all orders');
  }
});

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchAllOrders.fulfilled,
        (state, action: PayloadAction<TOrdersData>) => {
          state.status = 'succeeded';
          state.orders = action.payload.orders;
          state.total = action.payload.total;
          state.totalToday = action.payload.totalToday;
        }
      )
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedTotal = (state: RootState) => state.feed.total;
export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;
export const selectFeedStatus = (state: RootState) => state.feed.status;
export const selectFeedError = (state: RootState) => state.feed.error;

export default feedSlice.reducer;
