import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useSelector, useDispatch, RootState } from '../../services/store';
import { useParams } from 'react-router-dom';
import { fetchOrderByNumber } from '../../services/slices/ordersSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { currentOrder, loading } = useSelector((state) => state.orders);
  const { ingredients } = useSelector((state: RootState) => state.burger);
  const number = Number(useParams().number);

  useEffect(() => {
    dispatch(fetchOrderByNumber(number));
  }, [dispatch, number]);

  const orderInfo = useMemo(() => {
    if (!currentOrder) return null;

    const date = new Date(currentOrder.createdAt);

    const ingredientMap = new Map(ingredients.map((ing) => [ing._id, ing]));
    const ingredientsInfo: { [key: string]: TIngredient & { count: number } } =
      {};

    for (const itemId of currentOrder.ingredients) {
      const ingredient = ingredientMap.get(itemId);
      if (ingredient) {
        if (ingredientsInfo[itemId]) {
          ingredientsInfo[itemId].count++;
        } else {
          ingredientsInfo[itemId] = { ...ingredient, count: 1 };
        }
      }
    }

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    if (!ingredients.length && currentOrder.ingredients.length > 0) return null;

    return {
      ...currentOrder,
      ingredientsInfo,
      date,
      total
    };
  }, [currentOrder, ingredients]);

  if (!orderInfo || loading) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
