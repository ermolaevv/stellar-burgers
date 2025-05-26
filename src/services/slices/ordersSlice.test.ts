import ordersReducer, {
  setCurrentOrder,
  clearCurrentOrder,
  createOrder,
  fetchOrderByNumber,
  fetchOrders,
  fetchFeed
} from './ordersSlice';
import { TOrder } from '@utils-types';
import * as burgerApi from '@api';
import { RootState } from '../store';

interface OrdersState {
  orders: TOrder[];
  currentOrder: TOrder | null;
  feed: {
    orders: TOrder[];
    total: number;
    totalToday: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
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

const mockOrder: TOrder = {
  _id: '60d3b41abdacab0026a733c6',
  status: 'done',
  name: 'Burger Example',
  createdAt: '2021-06-24T17:00:00.000Z',
  updatedAt: '2021-06-24T17:00:00.000Z',
  number: 12345,
  ingredients: ['ing1', 'ing2', 'ing3']
};


jest.mock('@api', () => ({
  getOrdersApi: jest.fn(),
  getFeedsApi: jest.fn(),
  orderBurgerApi: jest.fn(), 
  getOrderByNumberApi: jest.fn()
}));


const mockedGetOrdersApi = burgerApi.getOrdersApi as jest.Mock;
const mockedGetFeedsApi = burgerApi.getFeedsApi as jest.Mock;
const mockedCreateOrderApi = burgerApi.orderBurgerApi as jest.Mock;
const mockedGetOrderByNumberApi = burgerApi.getOrderByNumberApi as jest.Mock;

describe('Редьюсер ordersSlice', () => {
  describe('Начальное состояние и синхронные редьюсеры', () => {
    it('should return the initial state', () => {
      expect(ordersReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('should handle setCurrentOrder', () => {
      const nextState = ordersReducer(initialState, setCurrentOrder(mockOrder));
      expect(nextState.currentOrder).toEqual(mockOrder);
    });

    it('should handle setCurrentOrder with null', () => {
      const stateWithOrder = { ...initialState, currentOrder: mockOrder };
      const nextState = ordersReducer(stateWithOrder, setCurrentOrder(null));
      expect(nextState.currentOrder).toBeNull();
    });

    it('should handle clearCurrentOrder', () => {
      const stateWithOrder = { ...initialState, currentOrder: mockOrder };
      const nextState = ordersReducer(stateWithOrder, clearCurrentOrder());
      expect(nextState.currentOrder).toBeNull();
    });
  });

  describe('createOrder (extraReducers)', () => {
    it('should handle createOrder.pending', () => {
      const action = { type: createOrder.pending.type };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle createOrder.fulfilled', () => {
      const action = { type: createOrder.fulfilled.type, payload: mockOrder };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.currentOrder).toEqual(mockOrder);
    });

    it('should handle createOrder.rejected', () => {
      const errorMessage = 'Ошибка создания заказа';
      const action = {
        type: createOrder.rejected.type,
        error: { message: errorMessage }
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });

    it('should handle createOrder.rejected with default message if error.message is missing', () => {
      const action = { type: createOrder.rejected.type, error: {} };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка создания заказа');
    });
  });

  describe('fetchOrderByNumber (extraReducers)', () => {
    it('should handle fetchOrderByNumber.pending', () => {
      const action = { type: fetchOrderByNumber.pending.type };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchOrderByNumber.fulfilled', () => {
      const action = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: mockOrder
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.currentOrder).toEqual(mockOrder);
    });

    it('should handle fetchOrderByNumber.rejected', () => {
      const errorMessage = 'Ошибка получения заказа';
      const action = {
        type: fetchOrderByNumber.rejected.type,
        error: { message: errorMessage }
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });

    it('should handle fetchOrderByNumber.rejected with default message if error.message is missing', () => {
      const action = { type: fetchOrderByNumber.rejected.type, error: {} };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка получения заказа');
    });
  });

  describe('fetchOrders (extraReducers)', () => {
    const mockOrdersList: TOrder[] = [
      mockOrder,
      { ...mockOrder, _id: 'order2', number: 12346 }
    ];
    it('should handle fetchOrders.pending', () => {
      const action = { type: fetchOrders.pending.type };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchOrders.fulfilled', () => {
      const action = {
        type: fetchOrders.fulfilled.type,
        payload: mockOrdersList
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.orders).toEqual(mockOrdersList);
    });

    it('should handle fetchOrders.rejected', () => {
      const errorMessage = 'Ошибка получения заказа';
      const action = {
        type: fetchOrders.rejected.type,
        error: { message: errorMessage }
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });

    
    it('should handle fetchOrders.rejected with default message if error.message is missing', () => {
      const action = { type: fetchOrders.rejected.type, error: {} }; 
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка получения заказов'); 
    });
  });

  describe('fetchFeed (extraReducers)', () => {
    const mockFeedData = { orders: [mockOrder], total: 1, totalToday: 1 };
    it('should handle fetchFeed.pending', () => {
      const action = { type: fetchFeed.pending.type };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchFeed.fulfilled', () => {
      const action = { type: fetchFeed.fulfilled.type, payload: mockFeedData };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.feed).toEqual(mockFeedData);
    });

    it('should handle fetchFeed.rejected', () => {
      const errorMessage = 'Ошибка получения ленты заказов';
      const action = {
        type: fetchFeed.rejected.type,
        error: { message: errorMessage }
      };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
    });

    it('should handle fetchFeed.rejected with default message if error.message is missing', () => {
      const action = { type: fetchFeed.rejected.type, error: {} };
      const newState = ordersReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Ошибка получения ленты заказов');
    });
  });

  describe('Логика асинхронных thunks', () => {
    const dispatch = jest.fn();
    const getState = jest.fn(); 

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedGetOrdersApi.mockClear();
      mockedGetFeedsApi.mockClear();
      mockedCreateOrderApi.mockClear();
      mockedGetOrderByNumberApi.mockClear();
    });

    describe('Thunk: fetchOrders', () => {
      const mockOrdersList: TOrder[] = [
        mockOrder,
        { ...mockOrder, _id: 'order2', number: 12346 }
      ];

      it('should fetch orders, dispatch pending and fulfilled actions on success', async () => {
        mockedGetOrdersApi.mockResolvedValue(mockOrdersList);

        await fetchOrders()(dispatch, getState, undefined);

        expect(mockedGetOrdersApi).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(fetchOrders.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(fetchOrders.fulfilled.type);
        expect(dispatch.mock.calls[1][0].payload).toEqual(mockOrdersList);
      });

      it('should dispatch pending and rejected actions on fetchOrders failure', async () => {
        const errorMessage = 'Failed to fetch orders';
        mockedGetOrdersApi.mockRejectedValue(new Error(errorMessage));

        await fetchOrders()(dispatch, getState, undefined);

        expect(mockedGetOrdersApi).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(fetchOrders.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(fetchOrders.rejected.type);
        expect(dispatch.mock.calls[1][0].error.message).toBe(errorMessage);
      });
    });

    describe('Thunk: fetchFeed', () => {
      const mockFeedResponse = {
        orders: [mockOrder],
        total: 1,
        totalToday: 1
      };

      it('should fetch feed, dispatch pending and fulfilled actions on success', async () => {
        mockedGetFeedsApi.mockResolvedValue(mockFeedResponse);

        await fetchFeed()(dispatch, getState, undefined);

        expect(mockedGetFeedsApi).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(fetchFeed.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(fetchFeed.fulfilled.type);
        expect(dispatch.mock.calls[1][0].payload).toEqual(mockFeedResponse);
      });

      it('should dispatch pending and rejected actions on fetchFeed failure', async () => {
        const errorMessage = 'Failed to fetch feed';
        mockedGetFeedsApi.mockRejectedValue(new Error(errorMessage));

        await fetchFeed()(dispatch, getState, undefined);

        expect(mockedGetFeedsApi).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(fetchFeed.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(fetchFeed.rejected.type);
        expect(dispatch.mock.calls[1][0].error.message).toBe(errorMessage);
      });
    });

    describe('Thunk: createOrder', () => {
      const mockIngredients: string[] = ['ing1', 'ing2'];
      
      
      const mockApiCreateOrderResponse = {
        success: true,
        name: 'Test Burger',
        order: mockOrder
      };

      it('should create order, dispatch pending and fulfilled actions on success', async () => {
        mockedCreateOrderApi.mockResolvedValue(mockApiCreateOrderResponse);

        await createOrder(mockIngredients)(dispatch, getState, undefined);

        expect(mockedCreateOrderApi).toHaveBeenCalledWith(mockIngredients);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(createOrder.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(createOrder.fulfilled.type);
        
        expect(dispatch.mock.calls[1][0].payload).toEqual(mockOrder);
      });

      it('should dispatch pending and rejected actions on createOrder failure', async () => {
        const errorMessage = 'Failed to create order';
        mockedCreateOrderApi.mockRejectedValue(new Error(errorMessage));

        await createOrder(mockIngredients)(dispatch, getState, undefined);

        expect(mockedCreateOrderApi).toHaveBeenCalledWith(mockIngredients);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(createOrder.pending.type);
        expect(dispatch.mock.calls[1][0].type).toBe(createOrder.rejected.type);
        expect(dispatch.mock.calls[1][0].error.message).toBe(errorMessage);
      });
    });

    describe('Thunk: fetchOrderByNumber', () => {
      const orderNumber = 12345;
      
      
      const mockApiFetchOrderResponse = { success: true, orders: [mockOrder] };

      it('should fetch order by number, dispatch pending and fulfilled actions on success', async () => {
        mockedGetOrderByNumberApi.mockResolvedValue(mockApiFetchOrderResponse);

        await fetchOrderByNumber(orderNumber)(dispatch, getState, undefined);

        expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          fetchOrderByNumber.pending.type
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          fetchOrderByNumber.fulfilled.type
        );
        
        expect(dispatch.mock.calls[1][0].payload).toEqual(mockOrder);
      });

      it('should dispatch pending and rejected actions on fetchOrderByNumber failure', async () => {
        const errorMessage = 'Failed to fetch order by number';
        mockedGetOrderByNumberApi.mockRejectedValue(new Error(errorMessage));

        await fetchOrderByNumber(orderNumber)(dispatch, getState, undefined);

        expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          fetchOrderByNumber.pending.type
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          fetchOrderByNumber.rejected.type
        );
        expect(dispatch.mock.calls[1][0].error.message).toBe(errorMessage);
      });

      it('should handle case where API returns empty orders array for fetchOrderByNumber', async () => {
        
        const emptyOrdersResponse = { success: true, orders: [] };
        mockedGetOrderByNumberApi.mockResolvedValue(emptyOrdersResponse);

        await fetchOrderByNumber(orderNumber)(dispatch, getState, undefined);

        expect(mockedGetOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0][0].type).toBe(
          fetchOrderByNumber.pending.type
        );
        expect(dispatch.mock.calls[1][0].type).toBe(
          fetchOrderByNumber.fulfilled.type
        );
        
        expect(dispatch.mock.calls[1][0].payload).toBeUndefined();
      });
    });
  });

  describe('orders selectors', () => {
    
    const selectOrdersList = (state: RootState) => state.orders.orders;
    const selectFeedData = (state: RootState) => state.orders.feed; 
    const selectCurrentOrderDetails = (state: RootState) =>
      state.orders.currentOrder;
    const selectOrdersLoading = (state: RootState) => state.orders.loading;
    const selectOrdersError = (state: RootState) => state.orders.error;

    const mockUserOrderList: TOrder[] = [
      mockOrder,
      { ...mockOrder, _id: 'userOrder2' }
    ];
    const mockFeedContent = {
      orders: [{ ...mockOrder, _id: 'feedOrder1' }],
      total: 50,
      totalToday: 5
    };

    const testOrdersState: OrdersState = {
      orders: mockUserOrderList,
      currentOrder: mockOrder,
      feed: mockFeedContent,
      loading: true,
      error: 'Test Orders Error'
    };

    const testRootState: RootState = {
      orders: testOrdersState,
      auth: {} as any,
      user: {} as any,
      ingredients: {} as any,
      burger: {} as any,
      burgerConstructor: {} as any,
      feed: {} as any, 
      userOrders: {} as any,
      order: {} as any 
    };

    it('selectOrdersList should return the list of user orders', () => {
      expect(selectOrdersList(testRootState)).toEqual(mockUserOrderList);
    });

    it('selectFeedData should return the feed data object', () => {
      expect(selectFeedData(testRootState)).toEqual(mockFeedContent);
    });

    it('selectCurrentOrderDetails should return the current order', () => {
      expect(selectCurrentOrderDetails(testRootState)).toEqual(mockOrder);
    });

    it('selectOrdersLoading should return loading status', () => {
      expect(selectOrdersLoading(testRootState)).toBe(true);
    });

    it('selectOrdersError should return error message', () => {
      expect(selectOrdersError(testRootState)).toBe('Test Orders Error');
    });

    it('selectCurrentOrderDetails should return null if currentOrder is null', () => {
      const stateWithNullCurrentOrder: RootState = {
        ...testRootState,
        orders: { ...testOrdersState, currentOrder: null }
      };
      expect(selectCurrentOrderDetails(stateWithNullCurrentOrder)).toBeNull();
    });

    it('selectOrdersError should return null if error is null', () => {
      const stateWithNullError: RootState = {
        ...testRootState,
        orders: { ...testOrdersState, error: null }
      };
      expect(selectOrdersError(stateWithNullError)).toBeNull();
    });
  });
});
