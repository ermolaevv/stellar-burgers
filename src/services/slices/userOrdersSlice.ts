import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';
import { RootState } from '../store';

interface UserOrdersState {
  orders: TOrder[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: UserOrdersState = {
  orders: [],
  status: 'idle',
  error: null
};

export const fetchUserOrders = createAsyncThunk<
  TOrder[],
  void,
  { rejectValue: string; state: RootState }
>('userOrders/fetch', async (_, { rejectWithValue, getState }) => {
  try {
    const orders = await getOrdersApi();
    return orders;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch user orders');
  }
});

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchUserOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.status = 'succeeded';
          state.orders = action.payload;
        }
      )
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const selectUserOrders = (state: RootState) => state.userOrders.orders;
export const selectUserOrdersStatus = (state: RootState) =>
  state.userOrders.status;
export const selectUserOrdersError = (state: RootState) =>
  state.userOrders.error;

export default userOrdersSlice.reducer;
