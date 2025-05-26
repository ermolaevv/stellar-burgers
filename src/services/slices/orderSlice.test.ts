import orderReducer, {
  createOrder,
  fetchOrderDetails,
  clearOrder,
  clearOrderDetails,
  selectOrderData,
  selectOrderRequest,
  selectOrderError,
  selectCurrentOrderDetails,
  selectOrderDetailsRequest,
  selectOrderDetailsError
} from './orderSlice';
import { RootState } from '../store'; 
import { TOrder } from '../../utils/types';
import * as burgerApi from '../../utils/burger-api';


jest.mock('../../utils/burger-api', () => ({
  orderBurgerApi: jest.fn(),
  getOrderByNumberApi: jest.fn()
}));

const mockedOrderBurgerApi = burgerApi.orderBurgerApi as jest.Mock;
const mockedGetOrderByNumberApi = burgerApi.getOrderByNumberApi as jest.Mock;

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

const mockIngredientIDs = ['id_bun', 'id_meat', 'id_sauce'];

const mockOrder: TOrder = {
  _id: 'order123',
  ingredients: mockIngredientIDs,
  status: 'done',
  name: 'Test Burger Order',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  number: 12345
};

describe('Слайс orderSlice', () => {
  beforeEach(() => {
    
    mockedOrderBurgerApi.mockClear();
    mockedGetOrderByNumberApi.mockClear();
  });

  describe('Редьюсер и начальное состояние', () => {
    it('should return the initial state', () => {
      expect(orderReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('should handle clearOrder', () => {
      const stateWithOrder: OrderState = {
        ...initialState,
        order: mockOrder,
        orderError: 'some error'
      };
      const nextState = orderReducer(stateWithOrder, clearOrder());
      expect(nextState.order).toBeNull();
      expect(nextState.orderError).toBeNull();
    });

    it('should handle clearOrderDetails', () => {
      const stateWithDetails: OrderState = {
        ...initialState,
        currentOrderDetails: mockOrder,
        orderDetailsError: 'some details error'
      };
      const nextState = orderReducer(stateWithDetails, clearOrderDetails());
      expect(nextState.currentOrderDetails).toBeNull();
      expect(nextState.orderDetailsError).toBeNull();
    });
  });

  describe('Thunk: createOrder', () => {
    it('should handle pending state', () => {
      const action = { type: createOrder.pending.type };
      const state = orderReducer(initialState, action);
      expect(state.orderRequest).toBe(true);
      expect(state.orderError).toBeNull();
      expect(state.order).toBeNull();
    });

    it('should handle fulfilled state', async () => {
      
      const expectedPayload = { order: mockOrder };
      mockedOrderBurgerApi.mockResolvedValueOnce({
        order: mockOrder,
        success: true,
        name: 'Test Order'
      }); 

      
      const mockDispatch = jest.fn();
      const thunk = createOrder(mockIngredientIDs);

      
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: createOrder.pending.type })
      );
      
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createOrder.fulfilled.type,
          payload: { order: mockOrder } 
        })
      );

      
      
      const fulfilledAction = {
        type: createOrder.fulfilled.type,
        payload: { order: mockOrder }
      };
      const stateAfterFulfilled = orderReducer(initialState, fulfilledAction);
      expect(stateAfterFulfilled.orderRequest).toBe(false);
      expect(stateAfterFulfilled.order).toEqual(mockOrder);
    });

    it('should handle rejected state when API returns error object', async () => {
      const errorMessage = 'Failed to process order';
      
      
      
      
      
      
      
    });

    it('should handle rejected state when orderBurgerApi throws (covers catch block)', async () => {
      const errorMessage = 'Network Error';
      mockedOrderBurgerApi.mockRejectedValueOnce(new Error(errorMessage));

      const mockDispatch = jest.fn();
      const thunk = createOrder(mockIngredientIDs);
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: createOrder.pending.type })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createOrder.rejected.type,
          payload: errorMessage 
        })
      );

      
      const rejectedAction = {
        type: createOrder.rejected.type,
        payload: errorMessage
      };
      const stateAfterRejected = orderReducer(initialState, rejectedAction);
      expect(stateAfterRejected.orderRequest).toBe(false);
      expect(stateAfterRejected.orderError).toEqual(errorMessage);
      expect(stateAfterRejected.order).toBeNull();
    });
  });

  describe('Thunk: fetchOrderDetails', () => {
    const orderNumber = 12345;

    it('should handle pending state', () => {
      const action = { type: fetchOrderDetails.pending.type };
      const state = orderReducer(initialState, action);
      expect(state.orderDetailsRequest).toBe(true);
      expect(state.orderDetailsError).toBeNull();
      expect(state.currentOrderDetails).toBeNull();
    });

    it('should handle fulfilled state', async () => {
      mockedGetOrderByNumberApi.mockResolvedValueOnce({
        orders: [mockOrder],
        success: true
      });

      const mockDispatch = jest.fn();
      const thunk = fetchOrderDetails(orderNumber);
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchOrderDetails.pending.type })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchOrderDetails.fulfilled.type,
          payload: mockOrder 
        })
      );

      
      const fulfilledAction = {
        type: fetchOrderDetails.fulfilled.type,
        payload: mockOrder
      };
      const stateAfterFulfilled = orderReducer(initialState, fulfilledAction);
      expect(stateAfterFulfilled.orderDetailsRequest).toBe(false);
      expect(stateAfterFulfilled.currentOrderDetails).toEqual(mockOrder);
    });

    it('should handle rejected state when order not found (empty orders array)', async () => {
      mockedGetOrderByNumberApi.mockResolvedValueOnce({
        orders: [],
        success: true
      }); 

      const mockDispatch = jest.fn();
      const thunk = fetchOrderDetails(orderNumber);
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchOrderDetails.pending.type })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchOrderDetails.rejected.type,
          payload: 'Order not found or API error' 
        })
      );

      
      const rejectedAction = {
        type: fetchOrderDetails.rejected.type,
        payload: 'Order not found or API error'
      };
      const stateAfterRejected = orderReducer(initialState, rejectedAction);
      expect(stateAfterRejected.orderDetailsRequest).toBe(false);
      expect(stateAfterRejected.orderDetailsError).toEqual(
        'Order not found or API error'
      );
      expect(stateAfterRejected.currentOrderDetails).toBeNull();
    });

    it('should handle rejected state when getOrderByNumberApi returns success: false', async () => {
      
      
      mockedGetOrderByNumberApi.mockResolvedValueOnce({
        success: false,
        message: 'Simulated API error'
      });

      const mockDispatch = jest.fn();
      const thunk = fetchOrderDetails(orderNumber);
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchOrderDetails.pending.type })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchOrderDetails.rejected.type,
          payload: 'Order not found or API error'
        })
      );
    });

    it('should handle rejected state when getOrderByNumberApi throws (covers catch block)', async () => {
      const errorMessage = 'Network Error Fetching Details';
      mockedGetOrderByNumberApi.mockRejectedValueOnce(new Error(errorMessage));

      const mockDispatch = jest.fn();
      const thunk = fetchOrderDetails(orderNumber);
      await thunk(mockDispatch, () => ({}) as RootState, undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: fetchOrderDetails.pending.type })
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: fetchOrderDetails.rejected.type,
          payload: errorMessage
        })
      );

      
      const rejectedAction = {
        type: fetchOrderDetails.rejected.type,
        payload: errorMessage
      };
      const stateAfterRejected = orderReducer(initialState, rejectedAction);
      expect(stateAfterRejected.orderDetailsRequest).toBe(false);
      expect(stateAfterRejected.orderDetailsError).toEqual(errorMessage);
      expect(stateAfterRejected.currentOrderDetails).toBeNull();
    });
  });

  describe('Селекторы orderSlice', () => {
    const minimalIngredientsState = {
      ingredients: [],
      constructorIngredients: { bun: null, ingredients: [] },
      items: [],
      status: 'idle',
      error: null
    };
    const minimalFeedState = {
      orders: [],
      total: 0,
      totalToday: 0,
      status: 'idle',
      error: null
    };
    const minimalUserState = {
      user: null,
      status: 'idle',
      error: null,
      isAuthChecked: false
    };
    const minimalUserOrdersState = { orders: [], status: 'idle', error: null };
    const minimalBurgerState = {
      buns: [],
      ingredients: [],
      constructorItems: { bun: null, ingredients: [] },
      isLoading: false,
      loading: false,
      error: null
    };
    const minimalAuthState = {
      user: null,
      isLoading: false,
      error: null,
      isAuthChecked: false,
      loginRequest: false,
      loginError: null,
      registerRequest: false,
      registerError: null,
      logoutRequest: false,
      logoutError: null,
      updateRequest: false,
      updateError: null
    };
    const minimalOrdersState = {
      orders: [],
      total: 0,
      totalToday: 0,
      status: 'idle',
      error: null
    };
    const minimalBurgerConstructorState = {
      bun: null,
      ingredients: [],
      totalPrice: 0,
      items: [],
      bunItem: null
    };

    const testState: RootState = {
      order: {
        order: mockOrder,
        currentOrderDetails: mockOrder,
        orderRequest: true,
        orderDetailsRequest: false,
        orderError: 'Test Order Error',
        orderDetailsError: null
      },
      ingredients: minimalIngredientsState as any,
      feed: minimalFeedState as any,
      user: minimalUserState as any,
      userOrders: minimalUserOrdersState as any,
      burger: minimalBurgerState as any,
      auth: minimalAuthState as any,
      orders: minimalOrdersState as any,
      burgerConstructor: minimalBurgerConstructorState as any
    } as RootState;

    it('selectOrderData should return order data', () => {
      expect(selectOrderData(testState)).toEqual(mockOrder);
    });

    it('selectOrderRequest should return order request status', () => {
      expect(selectOrderRequest(testState)).toBe(true);
    });

    it('selectOrderError should return order error', () => {
      expect(selectOrderError(testState)).toBe('Test Order Error');
    });

    it('selectCurrentOrderDetails should return current order details', () => {
      expect(selectCurrentOrderDetails(testState)).toEqual(mockOrder);
    });

    it('selectOrderDetailsRequest should return order details request status', () => {
      expect(selectOrderDetailsRequest(testState)).toBe(false);
    });

    it('selectOrderDetailsError should return order details error', () => {
      expect(selectOrderDetailsError(testState)).toBeNull();
    });
  });
});
