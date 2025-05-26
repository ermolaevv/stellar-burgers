import { FC, memo } from 'react';
import { BurgerConstructorElementUI } from '@ui';
import { BurgerConstructorElementProps } from './type';
import {
  moveIngredient,
  removeIngredient
} from '../../services/slices/burgerSlice';
import { useDispatch } from '../../services/store';

export const BurgerConstructorElement: FC<BurgerConstructorElementProps> = memo(
  ({ ingredient: item, index: idx, totalItems: total }) => {
    const dispatch = useDispatch();

    const handleMoveDown = () => {
      if (idx < total - 1) {
        dispatch(moveIngredient({ dragIndex: idx, hoverIndex: idx + 1 }));
      }
    };

    const handleMoveUp = () => {
      if (idx > 0) {
        dispatch(moveIngredient({ dragIndex: idx, hoverIndex: idx - 1 }));
      }
    };

    const handleClose = () => {
      dispatch(removeIngredient(item.uniqueId));
    };

    return (
      <BurgerConstructorElementUI
        ingredient={item}
        index={idx}
        totalItems={total}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleClose={handleClose}
      />
    );
  }
);
