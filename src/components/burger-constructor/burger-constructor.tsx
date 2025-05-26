import { FC, useMemo } from 'react';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector, RootState } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import { TConstructorIngredient, TIngredient } from '@utils-types';
import { clearConstructor } from '../../services/slices/burgerConstructorSlice';
import {
  selectConstructorBun,
  selectConstructorIngredients
} from '../../services/slices/burgerConstructorSlice';
import {
  createOrder,
  clearCurrentOrder
} from '../../services/slices/ordersSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bun = useSelector(selectConstructorBun);
  const ingredients = useSelector(selectConstructorIngredients);

  const { user } = useSelector((state: RootState) => state.auth);
  const { loading: orderLoading, currentOrder } = useSelector(
    (state: RootState) => state.orders
  );

  const orderIngredientsIds = useMemo(
    () => (bun ? [bun._id, ...ingredients.map((i) => i._id), bun._id] : []),
    [bun, ingredients]
  );

  const onOrderClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bun) {
      return;
    }
    dispatch(createOrder(orderIngredientsIds));
  };

  const price = useMemo(
    () =>
      (bun ? bun.price * 2 : 0) +
      ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [bun, ingredients]
  );

  const closeOrderModal = () => {
    dispatch(clearConstructor());
    dispatch(clearCurrentOrder());
  };

  const constructorItemsForUI = useMemo(
    () => ({
      bun: bun,
      ingredients: ingredients
    }),
    [bun, ingredients]
  );

  return (
    <BurgerConstructorUI
      constructorItems={constructorItemsForUI}
      orderRequest={orderLoading}
      price={price}
      onOrderClick={onOrderClick}
      orderModalData={currentOrder}
      closeOrderModal={closeOrderModal}
    />
  );
};
