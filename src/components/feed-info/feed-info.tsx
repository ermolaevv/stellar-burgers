import { FC } from 'react';

import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';
import { useSelector, RootState } from '../../services/store';

const filterAndMapOrdersByStatus = (
  orders: TOrder[],
  status: string
): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  const { feed } = useSelector((state: RootState) => state.orders);

  const readyOrders = filterAndMapOrdersByStatus(feed.orders, 'done');
  const pendingOrders = filterAndMapOrdersByStatus(feed.orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
