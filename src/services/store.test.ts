import { store } from './store';

const burgerInitialState = {
  ingredients: [],
  constructorItems: {
    bun: null,
    ingredients: []
  },
  loading: false,
  error: null
};

const authInitialState = {
  user: null,
  isAuthChecked: false,
  loading: false,
  error: null
};

const ordersInitialState = {
  orders: [],
  currentOrder: null,
  feed: {
    orders: [],
    total: 0,
    totalToday: 0
  },
  loading: false,
  error: null
};

const burgerConstructorInitialState = {
  bun: null,
  ingredients: [],
  totalPrice: 0
};

const feedInitialState = {
  orders: [],
  total: 0,
  totalToday: 0,
  status: 'idle',
  error: null
};

const ingredientsInitialState = {
  items: [],
  status: 'idle',
  error: null
};

const orderInitialState = {
  order: null,
  currentOrderDetails: null,
  orderRequest: false,
  orderDetailsRequest: false,
  orderError: null,
  orderDetailsError: null
};

const userOrdersInitialState = {
  orders: [],
  status: 'idle',
  error: null
};

const userInitialStateForStoreUserField = {
  user: null,
  isAuthChecked: false,
  loginUserRequest: false,
  loginUserError: null,
  registerUserRequest: false,
  registerUserError: null,
  logoutUserRequest: false,
  logoutUserError: null,
  getUserRequest: false,
  getUserError: null,
  updateUserRequest: false,
  updateUserError: null,
  forgotPasswordRequest: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
  resetPasswordRequest: false,
  resetPasswordSuccess: false,
  resetPasswordError: null
};

describe('Корневой редьюсер (store)', () => {
  it('должен возвращать корректное начальное состояние при неизвестном action', () => {
    const expectedInitialRootState = {
      burger: burgerInitialState,
      auth: authInitialState,
      orders: ordersInitialState,
      burgerConstructor: burgerConstructorInitialState,
      feed: feedInitialState,
      ingredients: ingredientsInitialState,
      order: orderInitialState,
      userOrders: userOrdersInitialState,
      user: userInitialStateForStoreUserField
    };

    const actualInitialState = store.getState();

    store.dispatch({ type: '@@UNKNOWN_ACTION_FOR_TEST' });
    const stateAfterUnknownAction = store.getState();

    expect(actualInitialState).toEqual(expectedInitialRootState);
    expect(stateAfterUnknownAction).toEqual(expectedInitialRootState);
  });
});
