import burgerReducer, {
  fetchIngredients,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from './burgerSlice';
import { TIngredient, TConstructorIngredient } from '@utils-types';

interface BurgerState {
  ingredients: TIngredient[];
  constructorItems: {
    bun: TIngredient | null;
    ingredients: TConstructorIngredient[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: BurgerState = {
  ingredients: [],
  constructorItems: {
    bun: null,
    ingredients: []
  },
  loading: false,
  error: null
};

const mockBun: TIngredient = {
  _id: 'bun_id',
  name: 'Test Bun',
  type: 'bun',
  proteins: 10,
  fat: 5,
  carbohydrates: 50,
  calories: 300,
  price: 200,
  image: '',
  image_mobile: '',
  image_large: ''
};

const mockMainIngredient1: TIngredient = {
  _id: 'main1_id',
  name: 'Test Main 1',
  type: 'main',
  proteins: 20,
  fat: 10,
  carbohydrates: 5,
  calories: 150,
  price: 300,
  image: '',
  image_mobile: '',
  image_large: ''
};

const mockMainIngredient2: TIngredient = {
  _id: 'main2_id',
  name: 'Test Main 2',
  type: 'main',
  proteins: 22,
  fat: 12,
  carbohydrates: 7,
  calories: 180,
  price: 350,
  image: '',
  image_mobile: '',
  image_large: ''
};

const mockFetchedIngredients: TIngredient[] = [
  mockBun,
  mockMainIngredient1,
  mockMainIngredient2
];

describe('Редьюсер burgerSlice', () => {
  it('should return the initial state', () => {
    expect(burgerReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('Редьюсеры', () => {
    describe('addIngredient (добавление ингредиента)', () => {
      it('should add a bun to constructorItems', () => {
        const action = addIngredient(mockBun);
        const newState = burgerReducer(initialState, action);
        expect(newState.constructorItems.bun).toEqual(mockBun);
        expect(newState.constructorItems.ingredients.length).toBe(0);
      });

      it('should add a main ingredient to constructorItems with uniqueId', () => {
        const action = addIngredient(mockMainIngredient1);
        const newState = burgerReducer(initialState, action);
        expect(newState.constructorItems.bun).toBeNull();
        expect(newState.constructorItems.ingredients.length).toBe(1);
        expect(newState.constructorItems.ingredients[0]).toEqual(
          expect.objectContaining({
            ...mockMainIngredient1,
            id: mockMainIngredient1._id,
            uniqueId: expect.any(String)
          })
        );
      });
    });

    describe('removeIngredient (удаление ингредиента)', () => {
      it('should remove an ingredient from constructorItems by uniqueId', () => {
        
        let stateWithIngredient = burgerReducer(
          initialState,
          addIngredient(mockMainIngredient1)
        );
        const uniqueIdToRemove =
          stateWithIngredient.constructorItems.ingredients[0].uniqueId;

        const action = removeIngredient(uniqueIdToRemove);
        const newState = burgerReducer(stateWithIngredient, action);
        expect(newState.constructorItems.ingredients.length).toBe(0);
      });

      it('should do nothing if uniqueId to remove is not found', () => {
        let stateWithIngredient = burgerReducer(
          initialState,
          addIngredient(mockMainIngredient1)
        );
        const action = removeIngredient('non-existent-id');
        const newState = burgerReducer(stateWithIngredient, action);
        expect(newState.constructorItems.ingredients.length).toBe(1);
      });
    });

    describe('moveIngredient (перемещение ингредиента)', () => {
      it('should move an ingredient within constructorItems', () => {
        let stateWithIngredients = burgerReducer(
          initialState,
          addIngredient(mockMainIngredient1)
        );
        stateWithIngredients = burgerReducer(
          stateWithIngredients,
          addIngredient(mockMainIngredient2)
        );
        
        const main1uniqueId =
          stateWithIngredients.constructorItems.ingredients[0].uniqueId;
        const main2uniqueId =
          stateWithIngredients.constructorItems.ingredients[1].uniqueId;

        const action = moveIngredient({ dragIndex: 0, hoverIndex: 1 });
        const newState = burgerReducer(stateWithIngredients, action);
        
        expect(newState.constructorItems.ingredients[0].uniqueId).toBe(
          main2uniqueId
        );
        expect(newState.constructorItems.ingredients[1].uniqueId).toBe(
          main1uniqueId
        );
      });
    });

    describe('clearConstructor (очистка конструктора)', () => {
      it('should clear bun and ingredients from constructorItems', () => {
        let stateWithItems = burgerReducer(
          initialState,
          addIngredient(mockBun)
        );
        stateWithItems = burgerReducer(
          stateWithItems,
          addIngredient(mockMainIngredient1)
        );

        const action = clearConstructor();
        const newState = burgerReducer(stateWithItems, action);
        expect(newState.constructorItems.bun).toBeNull();
        expect(newState.constructorItems.ingredients.length).toBe(0);
      });
    });
  });

  describe('fetchIngredients (extraReducers)', () => {
    it('should handle fetchIngredients.pending', () => {
      const action = { type: fetchIngredients.pending.type };
      const newState = burgerReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchIngredients.fulfilled', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockFetchedIngredients
      };
      const newState = burgerReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.ingredients).toEqual(mockFetchedIngredients);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchIngredients.rejected', () => {
      const errorMessage = 'Failed to fetch ingredients';
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage }
      };
      const newState = burgerReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe(errorMessage);
      expect(newState.ingredients).toEqual([]); 
    });

    it('should use default error message for fetchIngredients.rejected if no message', () => {
      const action = { type: fetchIngredients.rejected.type, error: {} };
      const newState = burgerReducer(initialState, action);
      expect(newState.error).toBe('Failed to fetch ingredients');
    });
  });
});
