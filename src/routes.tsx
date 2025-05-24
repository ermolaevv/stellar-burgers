import { RouteObject } from 'react-router-dom';
import {
  ConstructorPage,
  Feed,
  ForgotPassword,
  Login,
  NotFound404,
  Profile,
  ProfileOrders,
  Register,
  ResetPassword
} from '@pages';
import { IngredientDetails, OrderInfo } from '@components';
import { ProtectedRoute } from './components/protected-route';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <ConstructorPage />
  },
  {
    path: '/feed',
    element: <Feed />
  },
  {
    path: '/login',
    element: (
      <ProtectedRoute onlyAuthorized>
        <Login />
      </ProtectedRoute>
    )
  },
  {
    path: '/register',
    element: (
      <ProtectedRoute onlyAuthorized>
        <Register />
      </ProtectedRoute>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <ProtectedRoute onlyAuthorized>
        <ForgotPassword />
      </ProtectedRoute>
    )
  },
  {
    path: '/reset-password',
    element: (
      <ProtectedRoute onlyAuthorized>
        <ResetPassword />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute onlyAuthorized={false}>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/profile/orders',
    element: (
      <ProtectedRoute onlyAuthorized={false}>
        <ProfileOrders />
      </ProtectedRoute>
    )
  },
  {
    path: '/feed/:number',
    element: <OrderInfo />
  },
  {
    path: '/ingredients/:id',
    element: <IngredientDetails />
  },
  {
    path: '/profile/orders/:number',
    element: (
      <ProtectedRoute onlyAuthorized={false}>
        <OrderInfo />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFound404 />
  }
];

export const modalRoutes: RouteObject[] = [
  {
    path: '/feed/:number',
    element: <OrderInfo />
  },
  {
    path: '/ingredients/:id',
    element: <IngredientDetails />
  },
  {
    path: '/profile/orders/:number',
    element: <OrderInfo />
  }
];
