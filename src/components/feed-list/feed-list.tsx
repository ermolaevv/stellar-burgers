import React from 'react';
import { TOrder } from '@utils-types';
import { OrderCard } from '../order-card/order-card';
import styles from './feed-list.module.css';
import { useLocation } from 'react-router-dom';

interface FeedListProps {
  orders: TOrder[];
  isProfileOrders?: boolean;
}

export const FeedList: React.FC<FeedListProps> = ({
  orders,
  isProfileOrders
}) => {
  const location = useLocation();

  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        <OrderCard
          order={order}
          key={order._id}
          locationState={{ background: location }}
          isProfileOrders={isProfileOrders}
        />
      ))}
    </ul>
  );
};
