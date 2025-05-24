import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { TIngredient, TConstructorIngredient } from '../../utils/types';
import { RootState } from '../store';

interface BurgerConstructorState {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
  totalPrice: number;
}

const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
  totalPrice: 0
};

const calculateTotalPrice = (state: BurgerConstructorState) => {
  let total = 0;
  if (state.bun) {
    total += state.bun.price * 2;
  }
  state.ingredients.forEach((ingredient) => {
    total += ingredient.price;
  });
  state.totalPrice = total;
};

const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
        calculateTotalPrice(state);
      },
      prepare: (ingredient: TIngredient) => ({
        payload: {
          ...ingredient,
          id: ingredient._id,
          uniqueId: nanoid()
        }
      })
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.uniqueId !== action.payload
      );
      calculateTotalPrice(state);
    },
    updateIngredientsOrder: (
      state,
      action: PayloadAction<{ fromIndex: number; toIndex: number }>
    ) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedIngredient] = state.ingredients.splice(fromIndex, 1);
      state.ingredients.splice(toIndex, 0, movedIngredient);
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
      state.totalPrice = 0;
    }
  }
});

export const {
  addIngredient,
  removeIngredient,
  updateIngredientsOrder,
  clearConstructor
} = burgerConstructorSlice.actions;

export const selectConstructorBun = (state: RootState) =>
  state.burgerConstructor.bun;
export const selectConstructorIngredients = (state: RootState) =>
  state.burgerConstructor.ingredients;
export const selectTotalPrice = (state: RootState) =>
  state.burgerConstructor.totalPrice;

export default burgerConstructorSlice.reducer;
