import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '../ui/preloader';
import { RootState } from '../../services/store';

type ProtectedRouteProps = {
  children: React.ReactElement;
  onlyAuthorized?: boolean;
};

export const ProtectedRoute = ({
  children,
  onlyAuthorized
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, isAuthChecked } = useSelector((state: RootState) => state.auth);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyAuthorized && !user) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  if (onlyAuthorized && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate replace to={from} />;
  }

  return children ? children : <Outlet />;
};
