import { configureStore } from '@reduxjs/toolkit';
import burgerReducer from './slices/burgerSlice';
import authReducer from './slices/authSlice';
import ordersReducer from './slices/ordersSlice';
import burgerConstructorReducer from './slices/burgerConstructorSlice';
import feedReducer from './slices/feedSlice';
import ingredientsReducer from './slices/ingredientsSlice';
import orderReducer from './slices/orderSlice';
import userOrdersReducer from './slices/userOrdersSlice';
import userReducer from './slices/userSlice';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

export const store = configureStore({
  reducer: {
    burger: burgerReducer,
    auth: authReducer,
    orders: ordersReducer,
    burgerConstructor: burgerConstructorReducer,
    feed: feedReducer,
    ingredients: ingredientsReducer,
    order: orderReducer,
    userOrders: userOrdersReducer,
    user: userReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
