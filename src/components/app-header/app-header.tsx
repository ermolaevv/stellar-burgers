import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector, RootState } from '../../services/store';

export const AppHeader: FC = () => {
  const authState = useSelector((state: RootState) => state.auth);
  const user = authState.user;
  return <AppHeaderUI userName={user?.name || ''} />;
};
