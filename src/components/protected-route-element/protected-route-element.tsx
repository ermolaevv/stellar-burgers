import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  selectUser,
  selectIsAuthChecked
} from '../../services/slices/userSlice';
import { RootState, useSelector } from '../../services/store';
import { Preloader } from '@ui';

interface ProtectedRouteElementProps {
  element: ReactElement;
  onlyUnAuth?: boolean;
}

export const ProtectedRouteElement: FC<ProtectedRouteElementProps> = ({
  element,
  onlyUnAuth = false
}) => {
  const location = useLocation();
  const isAuthChecked = useSelector((state: RootState) =>
    selectIsAuthChecked(state)
  );
  const user = useSelector((state: RootState) => selectUser(state));

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (onlyUnAuth) {
    if (user) {
      const { from } = location.state || { from: { pathname: '/' } };
      return <Navigate to={from} replace />;
    }
  } else {
    if (!user) {
      return <Navigate to='/login' state={{ from: location }} replace />;
    }
  }

  return element;
};
