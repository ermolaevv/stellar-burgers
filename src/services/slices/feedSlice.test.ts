import feedReducer, {
  fetchAllOrders,
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedStatus,
  selectFeedError
} from './feedSlice';
import { TOrder, TOrdersData } from '@utils-types';

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

const mockOrder: TOrder = {
  _id: 'feedOrder1',
  status: 'done',
  name: 'Feed Test Burger Order',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  number: 77777,
  ingredients: ['bun_id', 'main_id']
};

const mockOrdersData: TOrdersData = {
  orders: [mockOrder, { ...mockOrder, _id: 'feedOrder2', number: 77778 }],
  total: 150,
  totalToday: 25
};

describe('Редьюсер feedSlice', () => {
  it('should return the initial state', () => {
    expect(feedReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Экстра-редьюсеры для fetchAllOrders', () => {
    it('should handle fetchAllOrders.pending', () => {
      const action = { type: fetchAllOrders.pending.type };
      const newState = feedReducer(initialState, action);
      expect(newState.status).toBe('loading');
      expect(newState.error).toBeNull();
    });

    it('should handle fetchAllOrders.fulfilled', () => {
      const action = {
        type: fetchAllOrders.fulfilled.type,
        payload: mockOrdersData
      };
      const newState = feedReducer(initialState, action);
      expect(newState.status).toBe('succeeded');
      expect(newState.orders).toEqual(mockOrdersData.orders);
      expect(newState.total).toBe(mockOrdersData.total);
      expect(newState.totalToday).toBe(mockOrdersData.totalToday);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchAllOrders.rejected', () => {
      const errorMessage = 'Failed to fetch all orders';
      const action = {
        type: fetchAllOrders.rejected.type,
        payload: errorMessage
      };
      const newState = feedReducer(initialState, action);
      expect(newState.status).toBe('failed');
      expect(newState.error).toBe(errorMessage);
      
      expect(newState.orders).toEqual(initialState.orders);
      expect(newState.total).toBe(initialState.total);
      expect(newState.totalToday).toBe(initialState.totalToday);
    });
  });

  describe('Селекторы feedSlice', () => {
    const mockState: { feed: FeedState } = {
      feed: {
        ...mockOrdersData,
        status: 'succeeded',
        error: null
      }
    };

    it('should select feed orders', () => {
      expect(selectFeedOrders(mockState as any)).toEqual(mockOrdersData.orders);
    });

    it('should select feed total', () => {
      expect(selectFeedTotal(mockState as any)).toBe(mockOrdersData.total);
    });

    it('should select feed totalToday', () => {
      expect(selectFeedTotalToday(mockState as any)).toBe(
        mockOrdersData.totalToday
      );
    });

    it('should select feed status', () => {
      expect(selectFeedStatus(mockState as any)).toBe('succeeded');
    });

    it('should select feed error', () => {
      const errorState: { feed: FeedState } = {
        feed: {
          ...initialState,
          status: 'failed',
          error: 'Test Error'
        }
      };
      expect(selectFeedError(errorState as any)).toBe('Test Error');
    });
  });
});
