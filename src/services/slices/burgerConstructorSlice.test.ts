import burgerConstructorReducer, {
  addIngredient,
  removeIngredient,
  updateIngredientsOrder,
  clearConstructor
} from './burgerConstructorSlice';
import { TIngredient, TConstructorIngredient } from '../../utils/types';


const mockBun: TIngredient = {
  _id: 'bun_id_1',
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
};

const mockMainIngredient1: TIngredient = {
  _id: 'main_id_1',
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
};

const mockMainIngredient2: TIngredient = {
  _id: 'main_id_2',
  name: 'Мясо бессмертных моллюсков Protostomia',
  type: 'main',
  proteins: 433,
  fat: 244,
  carbohydrates: 33,
  calories: 643,
  price: 1337,
  image: 'main2_image.png',
  image_mobile: 'main2_image_mobile.png',
  image_large: 'main2_image_large.png'
};

describe('Редьюсер burgerConstructorSlice', () => {
  const currentInitialState = {
    bun: null,
    ingredients: [],
    totalPrice: 0
  };

  it('should return the initial state', () => {
    expect(burgerConstructorReducer(undefined, { type: 'unknown' })).toEqual(
      currentInitialState
    );
  });

  describe('Экшен addIngredient', () => {
    it('should add a bun correctly', () => {
      const action = addIngredient(mockBun);
      const newState = burgerConstructorReducer(currentInitialState, action);
      expect(newState.bun).toEqual(
        expect.objectContaining({
          ...mockBun,
          uniqueId: expect.any(String),
          id: mockBun._id
        })
      );
      expect(newState.ingredients).toEqual([]);
      expect(newState.totalPrice).toEqual(mockBun.price * 2);
    });

    it('should add a main ingredient correctly', () => {
      const action = addIngredient(mockMainIngredient1);
      const newState = burgerConstructorReducer(currentInitialState, action);
      expect(newState.bun).toBeNull();
      expect(newState.ingredients.length).toBe(1);
      expect(newState.ingredients[0]).toEqual(
        expect.objectContaining({
          ...mockMainIngredient1,
          uniqueId: expect.any(String),
          id: mockMainIngredient1._id
        })
      );
      expect(newState.totalPrice).toEqual(mockMainIngredient1.price);
    });

    it('should add multiple main ingredients and calculate total price', () => {
      let state = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockMainIngredient1)
      );
      state = burgerConstructorReducer(
        state,
        addIngredient(mockMainIngredient2)
      );
      expect(state.ingredients.length).toBe(2);
      expect(state.totalPrice).toEqual(
        mockMainIngredient1.price + mockMainIngredient2.price
      );
    });

    it('should add bun and main ingredient and calculate total price', () => {
      let state = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockBun)
      );
      state = burgerConstructorReducer(
        state,
        addIngredient(mockMainIngredient1)
      );
      expect(state.bun).toBeDefined();
      expect(state.ingredients.length).toBe(1);
      expect(state.totalPrice).toEqual(
        mockBun.price * 2 + mockMainIngredient1.price
      );
    });
  });

  describe('Экшен removeIngredient', () => {
    it('should remove an ingredient and update price', () => {
      let stateWithIngredients = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockBun)
      );
      stateWithIngredients = burgerConstructorReducer(
        stateWithIngredients,
        addIngredient(mockMainIngredient1)
      );
      const addedMainIngredient = stateWithIngredients.ingredients[0];

      const action = removeIngredient(addedMainIngredient.uniqueId as string);
      const newState = burgerConstructorReducer(stateWithIngredients, action);

      expect(newState.ingredients.length).toBe(0);
      expect(newState.totalPrice).toEqual(mockBun.price * 2);
      expect(newState.bun).toEqual(
        expect.objectContaining({
          ...mockBun,
          uniqueId: expect.any(String),
          id: mockBun._id
        })
      );
    });

    it('should do nothing if ingredient to remove is not found', () => {
      let stateWithIngredients = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockMainIngredient1)
      );
      const action = removeIngredient('non_existent_unique_id');
      const newState = burgerConstructorReducer(stateWithIngredients, action);
      expect(newState).toEqual(stateWithIngredients);
    });
  });

  describe('Экшен updateIngredientsOrder', () => {
    it('should update ingredients order correctly', () => {
      let stateWithIngredients = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockMainIngredient1)
      );
      stateWithIngredients = burgerConstructorReducer(
        stateWithIngredients,
        addIngredient(mockMainIngredient2)
      );

      expect(stateWithIngredients.ingredients[0]._id).toBe(
        mockMainIngredient1._id
      );
      expect(stateWithIngredients.ingredients[1]._id).toBe(
        mockMainIngredient2._id
      );
      const initialPrice = stateWithIngredients.totalPrice;

      const action = updateIngredientsOrder({ fromIndex: 0, toIndex: 1 });
      const newState = burgerConstructorReducer(stateWithIngredients, action);

      expect(newState.ingredients.length).toBe(2);
      expect(newState.ingredients[0]._id).toBe(mockMainIngredient2._id);
      expect(newState.ingredients[1]._id).toBe(mockMainIngredient1._id);
      expect(newState.totalPrice).toEqual(initialPrice);
    });
  });

  describe('Экшен clearConstructor', () => {
    it('should clear the constructor', () => {
      let stateWithItems = burgerConstructorReducer(
        currentInitialState,
        addIngredient(mockBun)
      );
      stateWithItems = burgerConstructorReducer(
        stateWithItems,
        addIngredient(mockMainIngredient1)
      );

      const action = clearConstructor();
      const newState = burgerConstructorReducer(stateWithItems, action);

      expect(newState.bun).toBeNull();
      expect(newState.ingredients).toEqual([]);
      expect(newState.totalPrice).toBe(0);
      expect(newState).toEqual(currentInitialState);
    });
  });
});
