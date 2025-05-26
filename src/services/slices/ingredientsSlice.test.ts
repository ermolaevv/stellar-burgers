import ingredientsReducer, {
  fetchIngredients,
  selectAllIngredients,
  selectIngredientsStatus,
  selectIngredientsError,
  selectIngredientById
  
} from './ingredientsSlice';
import { TIngredient } from '../../utils/types';


const currentInitialState: {
  items: TIngredient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
} = {
  items: [],
  status: 'idle',
  error: null
};


const mockIngredientsResponse: TIngredient[] = [
  {
    _id: '1',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'bun_image.png',
    image_mobile: 'bun_image_mobile.png',
    image_large: 'bun_image_large.png'
  },
  {
    _id: '2',
    name: 'Филе Люминесцентного тетраодонтимформа',
    type: 'main',
    proteins: 433,
    fat: 244,
    carbohydrates: 33,
    calories: 643,
    price: 988,
    image: 'main1_image.png',
    image_mobile: 'main1_image_mobile.png',
    image_large: 'main1_image_large.png'
  }
];

describe('Редьюсер ingredientsSlice', () => {
  it('should return the initial state', () => {
    expect(ingredientsReducer(undefined, { type: 'unknown' })).toEqual(
      currentInitialState
    );
  });

  describe('fetchIngredients (extraReducers)', () => {
    it('should handle fetchIngredients.pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const newState = ingredientsReducer(currentInitialState, action);
      expect(newState.status).toBe('loading');
      expect(newState.error).toBeNull();
    });

    it('should handle fetchIngredients.fulfilled', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredientsResponse
      };
      const newState = ingredientsReducer(currentInitialState, action);
      expect(newState.status).toBe('succeeded');
      expect(newState.items).toEqual(mockIngredientsResponse);
      expect(newState.error).toBeNull(); 
    });

    it('should handle fetchIngredients.rejected', () => {
      const errorMessage = 'Failed to fetch ingredients';
      const action = {
        type: fetchIngredients.rejected.type,
        payload: errorMessage
      }; 
      
      const stateBeforeReject: typeof currentInitialState = {
        ...currentInitialState,
        status: 'loading'
      };
      const newState = ingredientsReducer(stateBeforeReject, action);
      expect(newState.status).toBe('failed');
      expect(newState.error).toBe(errorMessage);
      expect(newState.items).toEqual(currentInitialState.items); 
    });
  });

  
  describe('Селекторы ingredientsSlice', () => {
    const mockState: { ingredients: typeof currentInitialState } = {
      ingredients: {
        items: mockIngredientsResponse,
        status: 'succeeded',
        error: null
      }
    };

    it('should select all ingredients from state', () => {
      const selectedItems = selectAllIngredients(mockState as any); 
      expect(selectedItems).toEqual(mockIngredientsResponse);
    });

    it('should select ingredients status from state', () => {
      const selectedStatus = selectIngredientsStatus(mockState as any);
      expect(selectedStatus).toBe('succeeded');
    });

    it('should select ingredients error from state', () => {
      const mockStateWithError: { ingredients: typeof currentInitialState } = {
        ingredients: {
          items: [],
          status: 'failed',
          error: 'Test Error'
        }
      };
      const selectedError = selectIngredientsError(mockStateWithError as any);
      expect(selectedError).toBe('Test Error');
    });

    
    it('should select an ingredient by ID if it exists', () => {
      const selectedIngredient = selectIngredientById(mockState as any, '1');
      expect(selectedIngredient).toEqual(mockIngredientsResponse[0]);
    });

    it('should return undefined if ingredient with ID does not exist', () => {
      const selectedIngredient = selectIngredientById(
        mockState as any,
        'nonexistent-id'
      );
      expect(selectedIngredient).toBeUndefined();
    });

    it('should return undefined if ID is not provided', () => {
      const selectedIngredient = selectIngredientById(
        mockState as any,
        undefined
      );
      expect(selectedIngredient).toBeUndefined();
    });
  });
});
