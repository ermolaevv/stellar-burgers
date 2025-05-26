import userOrdersReducer, {
  fetchUserOrders,
  selectUserOrders,
  selectUserOrdersStatus,
  selectUserOrdersError
} from './userOrdersSlice';
import { TOrder } from '../../utils/types';
import { RootState } from '../store';
import * as burgerApi from '../../utils/burger-api';

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

const mockOrder: TOrder = {
  _id: 'userOrder1',
  status: 'done',
  name: 'User Test Order',
  createdAt: '2023-01-01T12:00:00.000Z',
  updatedAt: '2023-01-01T12:00:00.000Z',
  number: 777,
  ingredients: ['bun', 'cutlet']
};

const mockOrdersList: TOrder[] = [
  mockOrder,
  { ...mockOrder, _id: 'userOrder2', number: 778 }
];

jest.mock('../../utils/burger-api', () => ({
  getOrdersApi: jest.fn()
}));

const mockedGetOrdersApi = burgerApi.getOrdersApi as jest.Mock;

describe('Слайс userOrdersSlice', () => {
  beforeEach(() => {
    mockedGetOrdersApi.mockClear();
  });

  describe('Редьюсер и начальное состояние', () => {
    it('should return the initial state', () => {
      expect(userOrdersReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });
  });

  describe('fetchUserOrders (extraReducers)', () => {
    it('should handle fetchUserOrders.pending', () => {
      const action = { type: fetchUserOrders.pending.type };
      const state = userOrdersReducer(initialState, action);
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should handle fetchUserOrders.fulfilled', () => {
      const action = {
        type: fetchUserOrders.fulfilled.type,
        payload: mockOrdersList
      };
      const state = userOrdersReducer(initialState, action);
      expect(state.status).toBe('succeeded');
      expect(state.orders).toEqual(mockOrdersList);
      expect(state.error).toBeNull();
    });

    it('should handle fetchUserOrders.rejected', () => {
      const errorMessage = 'Failed to fetch user orders';
      const action = {
        type: fetchUserOrders.rejected.type,
        payload: errorMessage
      };
      const newState = userOrdersReducer(initialState, action);
      expect(newState.status).toBe('failed');
      expect(newState.error).toBe(errorMessage);
      expect(newState.orders).toEqual(initialState.orders); 
    });
  });

  describe('Логика Thunk: fetchUserOrders', () => {
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({
      userOrders: initialState,
      auth: {} as any,
      user: {} as any,
      orders: {} as any,
      burger: {} as any,
      burgerConstructor: {} as any,
      feed: {} as any,
      ingredients: {} as any,
      order: {} as any
    })) as jest.MockedFunction<() => RootState>;

    beforeEach(() => {
      dispatch.mockClear();
      mockedGetOrdersApi.mockClear();
    });

    it('should fetch user orders and dispatch fulfilled on success', async () => {
      mockedGetOrdersApi.mockResolvedValue(mockOrdersList);

      await fetchUserOrders()(dispatch, getState, undefined);

      expect(mockedGetOrdersApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(fetchUserOrders.pending.type);
      expect(dispatch.mock.calls[1][0].type).toBe(
        fetchUserOrders.fulfilled.type
      );
      expect(dispatch.mock.calls[1][0].payload).toEqual(mockOrdersList);
    });

    it('should dispatch rejected on getOrdersApi failure with error message', async () => {
      const errorMessage = 'API Error: Failed to get orders';
      mockedGetOrdersApi.mockRejectedValue(new Error(errorMessage));

      await fetchUserOrders()(dispatch, getState, undefined);

      expect(mockedGetOrdersApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[0][0].type).toBe(fetchUserOrders.pending.type);
      expect(dispatch.mock.calls[1][0].type).toBe(
        fetchUserOrders.rejected.type
      );
      expect(dispatch.mock.calls[1][0].payload).toBe(errorMessage);
    });

    it('should dispatch rejected with default message if API error has no message', async () => {
      mockedGetOrdersApi.mockRejectedValue({});

      await fetchUserOrders()(dispatch, getState, undefined);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[1][0].type).toBe(
        fetchUserOrders.rejected.type
      );
      expect(dispatch.mock.calls[1][0].payload).toBe(
        'Failed to fetch user orders'
      );
    });
  });

  describe('Селекторы userOrdersSlice', () => {
    const testRootState: RootState = {
      userOrders: {
        orders: mockOrdersList,
        status: 'succeeded',
        error: null
      },
      auth: {} as any,
      user: {} as any,
      orders: {} as any,
      burger: {} as any,
      burgerConstructor: {} as any,
      feed: {} as any,
      ingredients: {} as any,
      order: {} as any
    };

    it('should select user orders', () => {
      expect(selectUserOrders(testRootState)).toEqual(mockOrdersList);
    });

    it('should select user orders status', () => {
      expect(selectUserOrdersStatus(testRootState)).toBe('succeeded');
    });

    it('should select user orders error when error is present', () => {
      const errorMsg = 'Some error';
      const stateWithError: RootState = {
        ...testRootState,
        userOrders: {
          ...testRootState.userOrders,
          status: 'failed',
          error: errorMsg
        }
      };
      expect(selectUserOrdersError(stateWithError)).toBe(errorMsg);
    });

    it('should select user orders error as null when no error', () => {
      expect(selectUserOrdersError(testRootState)).toBeNull();
    });
  });
});
