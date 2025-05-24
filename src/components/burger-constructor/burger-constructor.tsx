import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector, RootState } from '../../services/store';
import { useNavigate } from 'react-router-dom';
import {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../../services/slices/burgerSlice';
import {
  createOrder,
  clearCurrentOrder
} from '../../services/slices/ordersSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { constructorItems } = useSelector((state: RootState) => state.burger);
  const { user } = useSelector((state) => state.auth);
  const { loading: orderLoading, currentOrder } = useSelector(
    (state) => state.orders
  );

  const ingredients = constructorItems.ingredients.map((i) => i._id);
  const bun = constructorItems.bun?._id;
  const orderIngredients = bun ? [bun, ...ingredients, bun] : [];

  const onOrderClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!constructorItems.bun) {
      return;
    }
    dispatch(createOrder(orderIngredients));
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  const closeOrderModal = () => {
    dispatch(clearConstructor());
    dispatch(clearCurrentOrder());
  };

  return (
    <BurgerConstructorUI
      constructorItems={constructorItems}
      orderRequest={orderLoading}
      price={price}
      onOrderClick={onOrderClick}
      orderModalData={currentOrder}
      closeOrderModal={closeOrderModal}
    />
  );
};
