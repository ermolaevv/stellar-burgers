import { forwardRef, useMemo } from 'react';
import { TIngredientsCategoryProps } from './type';
import { TIngredient } from '@utils-types';
import { IngredientsCategoryUI } from '../ui/ingredients-category';
import { useSelector, RootState } from '../../services/store';

export const IngredientsCategory = forwardRef<
  HTMLUListElement,
  TIngredientsCategoryProps
>(({ title, titleRef, ingredients }, ref) => {
  const { constructorItems } = useSelector((state: RootState) => state.burger);

  const ingredientsCounters = useMemo(() => {
    const { bun, ingredients } = constructorItems;
    const initialCounters: { [key: string]: number } = {};
    if (bun) {
      initialCounters[bun._id] = 2;
    }
    const counters = ingredients.reduce(
      (acc: { [key: string]: number }, ingredient: TIngredient) => {
        if (bun && ingredient._id === bun._id) return acc;
        acc[ingredient._id] = (acc[ingredient._id] || 0) + 1;
        return acc;
      },
      initialCounters
    );
    return counters;
  }, [constructorItems]);

  return (
    <IngredientsCategoryUI
      title={title}
      titleRef={titleRef}
      ingredients={ingredients}
      ingredientsCounters={ingredientsCounters}
      ref={ref}
    />
  );
});
