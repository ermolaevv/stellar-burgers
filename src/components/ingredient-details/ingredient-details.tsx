import { FC, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { Params, useParams } from 'react-router-dom';
import { useSelector, RootState } from '../../services/store';

export const IngredientDetails: FC = () => {
  const { id } = useParams<Params>();
  const { ingredients, loading, error } = useSelector(
    (state: RootState) => state.burger
  );

  const ingredientData = useMemo(
    () => ingredients.find((i) => i._id === id),
    [ingredients, id]
  );

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
