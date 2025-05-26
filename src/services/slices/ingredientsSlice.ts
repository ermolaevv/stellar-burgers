import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector
} from '@reduxjs/toolkit';
import { TIngredient } from '../../utils/types';
import { getIngredientsApi } from '../../utils/burger-api';
import { RootState } from '../store';

interface IngredientsState {
  items: TIngredient[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | undefined;
}

const initialState: IngredientsState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    const response = await getIngredientsApi();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch ingredients');
  }
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<TIngredient[]>) => {
          state.status = 'succeeded';
          state.items = action.payload;
        }
      )
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const selectAllIngredients = (state: RootState) =>
  state.ingredients.items;
export const selectIngredientsStatus = (state: RootState) =>
  state.ingredients.status;
export const selectIngredientsError = (state: RootState) =>
  state.ingredients.error;

const selectItems = (state: RootState) => state.ingredients.items;
const selectIdAsProp = (_state: RootState, id: string | undefined) => id;

export const selectIngredientById = createSelector(
  [selectItems, selectIdAsProp],
  (items, id) =>
    id
      ? items.find((ingredient: TIngredient) => ingredient._id === id)
      : undefined
);

export default ingredientsSlice.reducer;
