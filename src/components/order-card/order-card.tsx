import { FC, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { OrderCardProps } from './type';
import { TIngredient } from '@utils-types';
import { OrderCardUI } from '../ui/order-card';
import { useSelector, RootState } from '../../services/store';

const maxIngredients = 6;

export const OrderCard: FC<OrderCardProps> = memo(({ order }) => {
  const location = useLocation();

  const { ingredients } = useSelector((state: RootState) => state.burger);

  const orderInfo = useMemo(() => {
    if (!ingredients.length) return null;

    const ingredientMap = new Map(ingredients.map((ing) => [ing._id, ing]));
    const ingredientsInfo = order.ingredients
      .map((id) => ingredientMap.get(id))
      .filter(Boolean) as TIngredient[];

    const total = ingredientsInfo.reduce((acc, item) => acc + item.price, 0);

    const ingredientsToShow = ingredientsInfo.slice(0, maxIngredients);

    const remains = Math.max(0, ingredientsInfo.length - maxIngredients);

    const date = new Date(order.createdAt);
    return {
      ...order,
      ingredientsInfo,
      ingredientsToShow,
      remains,
      total,
      date
    };
  }, [order, ingredients]);

  if (!orderInfo) return null;

  return (
    <OrderCardUI
      orderInfo={orderInfo}
      maxIngredients={maxIngredients}
      locationState={{ background: location }}
    />
  );
});
