import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi, getOrderByNumberApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';
import { RootState } from '../store';

interface OrderState {
  order: TOrder | null;
  currentOrderDetails: TOrder | null;
  orderRequest: boolean;
  orderDetailsRequest: boolean;
  orderError: string | null | undefined;
  orderDetailsError: string | null | undefined;
}

const initialState: OrderState = {
  order: null,
  currentOrderDetails: null,
  orderRequest: false,
  orderDetailsRequest: false,
  orderError: null,
  orderDetailsError: null
};

export const createOrder = createAsyncThunk<
  { order: TOrder },
  string[],
  { rejectValue: string; state: RootState }
>('order/create', async (ingredientIds, { rejectWithValue }) => {
  try {
    const res = await orderBurgerApi(ingredientIds);
    return { order: res.order };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create order');
  }
});

export const fetchOrderDetails = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('order/fetchDetails', async (orderNumber, { rejectWithValue }) => {
  try {
    const response = await getOrderByNumberApi(orderNumber);
    if (response.orders && response.orders.length > 0) {
      return response.orders[0];
    }
    return rejectWithValue('Order not found or API error');
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch order details');
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      state.order = null;
      state.orderError = null;
    },
    clearOrderDetails: (state) => {
      state.currentOrderDetails = null;
      state.orderDetailsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.orderError = null;
        state.order = null;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<{ order: TOrder }>) => {
          state.orderRequest = false;
          state.order = action.payload.order;
        }
      )
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.orderError = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.orderDetailsRequest = true;
        state.orderDetailsError = null;
        state.currentOrderDetails = null;
      })
      .addCase(
        fetchOrderDetails.fulfilled,
        (state, action: PayloadAction<TOrder>) => {
          state.orderDetailsRequest = false;
          state.currentOrderDetails = action.payload;
        }
      )
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.orderDetailsRequest = false;
        state.orderDetailsError = action.payload;
      });
  }
});

export const { clearOrder, clearOrderDetails } = orderSlice.actions;

export const selectOrderData = (state: RootState) => state.order.order;
export const selectOrderRequest = (state: RootState) =>
  state.order.orderRequest;
export const selectOrderError = (state: RootState) => state.order.orderError;

export const selectCurrentOrderDetails = (state: RootState) =>
  state.order.currentOrderDetails;
export const selectOrderDetailsRequest = (state: RootState) =>
  state.order.orderDetailsRequest;
export const selectOrderDetailsError = (state: RootState) =>
  state.order.orderDetailsError;

export default orderSlice.reducer;
