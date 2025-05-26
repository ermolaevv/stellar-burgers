import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector, RootState } from '../../services/store';
import { fetchFeed } from '../../services/slices/ordersSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const { feed, loading } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  if (loading) {
    return <Preloader />;
  }

  return (
    <FeedUI orders={feed.orders} handleGetFeeds={() => dispatch(fetchFeed())} />
  );
};
