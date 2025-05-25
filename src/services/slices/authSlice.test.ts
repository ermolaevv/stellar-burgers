import authReducer, {
  login,
  register,
  logout,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword,
  setAuthChecked
} from './authSlice';
import { RootState } from '../store';
import { TUser } from '../../utils/types';
import {
  TLoginData,
  TRegisterData,
  TAuthResponse
} from '../../utils/burger-api';
import * as burgerApi from '../../utils/burger-api';
import * as cookieUtils from '../../utils/cookie';

jest.mock('../../utils/burger-api', () => ({
  registerUserApi: jest.fn(),
  loginUserApi: jest.fn(),
  logoutApi: jest.fn(),
  getUserApi: jest.fn(),
  updateUserApi: jest.fn(),
  forgotPasswordApi: jest.fn(),
  resetPasswordApi: jest.fn()
}));

jest.mock('../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  getCookie: jest.fn()
}));

const mockedRegisterUserApi = burgerApi.registerUserApi as jest.Mock;
const mockedLoginUserApi = burgerApi.loginUserApi as jest.Mock;
const mockedLogoutApi = burgerApi.logoutApi as jest.Mock;
const mockedGetUserApi = burgerApi.getUserApi as jest.Mock;
const mockedUpdateUserApi = burgerApi.updateUserApi as jest.Mock;
const mockedForgotPasswordApi = burgerApi.forgotPasswordApi as jest.Mock;
const mockedResetPasswordApi = burgerApi.resetPasswordApi as jest.Mock;

const mockedSetCookie = cookieUtils.setCookie as jest.Mock;
const mockedDeleteCookie = cookieUtils.deleteCookie as jest.Mock;

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

interface AuthState {
  user: TUser | null;
  isAuthChecked: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthChecked: false,
  loading: false,
  error: null
};

const mockUser: TUser = { email: 'test@example.com', name: 'Test User' };
const mockApiAuthResponse: TAuthResponse = {
  success: true,
  user: mockUser,
  accessToken: 'mockAccessTokenFromApi',
  refreshToken: 'mockRefreshTokenFromApi'
};
const mockThunkUserResponse: TUser = mockUser;

describe('authSlice', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true
    });
    localStorageMock.clear();

    mockedRegisterUserApi.mockClear();
    mockedLoginUserApi.mockClear();
    mockedLogoutApi.mockClear();
    mockedGetUserApi.mockClear();
    mockedUpdateUserApi.mockClear();
    mockedForgotPasswordApi.mockClear();
    mockedResetPasswordApi.mockClear();
    mockedSetCookie.mockClear();
    mockedDeleteCookie.mockClear();
  });

  describe('Редьюсер и начальное состояние', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setAuthChecked', () => {
      let nextState = authReducer(initialState, setAuthChecked(true));
      expect(nextState.isAuthChecked).toBe(true);
      nextState = authReducer(nextState, setAuthChecked(false));
      expect(nextState.isAuthChecked).toBe(false);
    });
  });

  describe('Thunk: login', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const loginPayload: TLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedLoginUserApi.mockClear();
      localStorageMock.setItem.mockClear();
      mockedSetCookie.mockClear();
    });

    it('should handle pending state', () => {
      const action = { type: login.pending.type };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state, set tokens, and return user', async () => {
      mockedLoginUserApi.mockResolvedValue(mockApiAuthResponse);

      await login(loginPayload)(dispatch, getState, undefined);

      expect(mockedLoginUserApi).toHaveBeenCalledWith(loginPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(login.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(login.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toEqual(mockThunkUserResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'refreshToken',
        mockApiAuthResponse.refreshToken
      );
      expect(mockedSetCookie).toHaveBeenCalledWith(
        'accessToken',
        mockApiAuthResponse.accessToken
      );

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockThunkUserResponse);
      expect(state.error).toBeNull();
    });

    it('should handle rejected state and set error message', async () => {
      const errorMessage = 'Invalid credentials';
      mockedLoginUserApi.mockRejectedValue(new Error(errorMessage));

      await login(loginPayload)(dispatch, getState, undefined);

      expect(mockedLoginUserApi).toHaveBeenCalledWith(loginPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(login.pending.type);
      expect(rejectedActionFromThunk.type).toBe(login.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should use default error message for rejected state if no specific message', async () => {
      mockedLoginUserApi.mockRejectedValue({});

      await login(loginPayload)(dispatch, getState, undefined);
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(rejectedActionFromThunk.type).toBe(login.rejected.type);
      expect(rejectedActionFromThunk.error.message).toBeUndefined();

      const pendingAction = dispatch.mock.calls[0][0];
      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('Thunk: register', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const registerPayload: TRegisterData = {
      email: 'new@example.com',
      password: 'newpass123',
      name: 'New User'
    };

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedRegisterUserApi.mockClear();
      localStorageMock.setItem.mockClear();
      mockedSetCookie.mockClear();
    });

    it('should handle pending state', () => {
      const action = { type: register.pending.type };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state, set tokens, and return user', async () => {
      mockedRegisterUserApi.mockResolvedValue(mockApiAuthResponse);

      await register(registerPayload)(dispatch, getState, undefined);

      expect(mockedRegisterUserApi).toHaveBeenCalledWith(registerPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(register.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(register.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toEqual(mockThunkUserResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'refreshToken',
        mockApiAuthResponse.refreshToken
      );
      expect(mockedSetCookie).toHaveBeenCalledWith(
        'accessToken',
        mockApiAuthResponse.accessToken
      );

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockThunkUserResponse);
      expect(state.error).toBeNull();
    });

    it('should handle rejected state and set error message', async () => {
      const errorMessage = 'Email already exists';
      mockedRegisterUserApi.mockRejectedValue(new Error(errorMessage));

      await register(registerPayload)(dispatch, getState, undefined);

      expect(mockedRegisterUserApi).toHaveBeenCalledWith(registerPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(register.pending.type);
      expect(rejectedActionFromThunk.type).toBe(register.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should use default error message for rejected state if no specific message', async () => {
      mockedRegisterUserApi.mockRejectedValue({});

      await register(registerPayload)(dispatch, getState, undefined);
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(rejectedActionFromThunk.type).toBe(register.rejected.type);
      expect(rejectedActionFromThunk.error.message).toBeUndefined();

      const pendingAction = dispatch.mock.calls[0][0];
      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Registration failed');
    });
  });

  describe('Thunk: logout', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedLogoutApi.mockClear();
      localStorageMock.removeItem.mockClear();
      mockedDeleteCookie.mockClear();
    });

    it('should handle fulfilled state, clear tokens, and set user to null', async () => {
      mockedLogoutApi.mockResolvedValue({ success: true });
      const loggedInState: AuthState = {
        ...initialState,
        user: mockUser,
        loading: true,
        error: 'some error'
      };

      await logout()(dispatch, getState, undefined);

      expect(mockedLogoutApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(logout.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(logout.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toBeUndefined();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(mockedDeleteCookie).toHaveBeenCalledWith('accessToken');

      const stateAfterFulfilled = authReducer(
        loggedInState,
        fulfilledActionFromThunk
      );
      expect(stateAfterFulfilled.user).toBeNull();
      expect(stateAfterFulfilled.loading).toBe(loggedInState.loading);
      expect(stateAfterFulfilled.error).toBe(loggedInState.error);
    });

    it('should handle rejected state (no change in reducer, but loading might persist)', async () => {
      const errorMessage = 'Logout API failed';
      mockedLogoutApi.mockRejectedValue(new Error(errorMessage));

      const stateBeforeLogoutAttempt: AuthState = {
        ...initialState,
        user: mockUser,
        loading: true,
        error: null
      };

      await logout()(dispatch, getState, undefined);

      expect(mockedLogoutApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(logout.pending.type);
      expect(rejectedActionFromThunk.type).toBe(logout.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      const stateAfterRejected = authReducer(
        stateBeforeLogoutAttempt,
        rejectedActionFromThunk
      );
      expect(stateAfterRejected).toEqual(stateBeforeLogoutAttempt);
      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(mockedDeleteCookie).not.toHaveBeenCalled();
    });
  });

  describe('Thunk: getUser (проверка авторизации)', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedGetUserApi.mockClear();
    });

    it('should handle fulfilled state, set user, and set isAuthChecked to true', async () => {
      mockedGetUserApi.mockResolvedValue({ success: true, user: mockUser });

      const initialStateBeforeCheck: AuthState = {
        ...initialState,
        isAuthChecked: false
      };

      await getUser()(dispatch, getState, undefined);

      expect(mockedGetUserApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(getUser.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(getUser.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toEqual(mockUser);

      let state = authReducer(initialStateBeforeCheck, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthChecked).toBe(true);
      expect(state.loading).toBe(initialStateBeforeCheck.loading);
      expect(state.error).toBe(initialStateBeforeCheck.error);
    });

    it('should handle rejected state and set isAuthChecked to true (error not stored)', async () => {
      const errorMessage = 'Token invalid';
      mockedGetUserApi.mockRejectedValue(new Error(errorMessage));

      const initialStateBeforeCheck: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthChecked: false
      };

      await getUser()(dispatch, getState, undefined);

      expect(mockedGetUserApi).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(getUser.pending.type);
      expect(rejectedActionFromThunk.type).toBe(getUser.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(initialStateBeforeCheck, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.user).toEqual(initialStateBeforeCheck.user);
      expect(state.isAuthChecked).toBe(true);
      expect(state.loading).toBe(initialStateBeforeCheck.loading);
      expect(state.error).toBe(initialStateBeforeCheck.error);
    });
  });

  describe('Thunk: updateUser', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const updatePayload: Partial<TRegisterData> = { name: 'Updated Name' };
    const initialUser: TUser = { email: 'test@example.com', name: 'Old Name' };
    const updatedUserFromApi: TUser = {
      email: 'test@example.com',
      name: 'Updated Name'
    };

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedUpdateUserApi.mockClear();
    });

    it('should handle fulfilled state and update user', async () => {
      mockedUpdateUserApi.mockResolvedValue({
        success: true,
        user: updatedUserFromApi
      });

      const stateWithInitialUser: AuthState = {
        ...initialState,
        user: initialUser
      };

      await updateUser(updatePayload)(dispatch, getState, undefined);

      expect(mockedUpdateUserApi).toHaveBeenCalledWith(updatePayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(updateUser.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(updateUser.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toEqual(updatedUserFromApi);

      let state = authReducer(stateWithInitialUser, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);
      expect(state.user).toEqual(updatedUserFromApi);
      expect(state.loading).toBe(stateWithInitialUser.loading);
      expect(state.error).toBe(stateWithInitialUser.error);
    });

    it('should handle rejected state (no change in reducer)', async () => {
      const errorMessage = 'Update failed due to conflict';
      mockedUpdateUserApi.mockRejectedValue(new Error(errorMessage));

      const stateWithInitialUser: AuthState = {
        ...initialState,
        user: initialUser,
        loading: true
      };

      await updateUser(updatePayload)(dispatch, getState, undefined);

      expect(mockedUpdateUserApi).toHaveBeenCalledWith(updatePayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(updateUser.pending.type);
      expect(rejectedActionFromThunk.type).toBe(updateUser.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(stateWithInitialUser, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state).toEqual(stateWithInitialUser);
    });
  });

  describe('Thunk: forgotPassword', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const forgotPasswordPayload = { email: 'test@example.com' };

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedForgotPasswordApi.mockClear();
    });

    it('should handle pending state', () => {
      const action = { type: forgotPassword.pending.type };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', async () => {
      mockedForgotPasswordApi.mockResolvedValue({ success: true });

      const stateWithError: AuthState = {
        ...initialState,
        error: 'Previous error',
        loading: true
      };

      await forgotPassword(forgotPasswordPayload)(
        dispatch,
        getState,
        undefined
      );

      expect(mockedForgotPasswordApi).toHaveBeenCalledWith(
        forgotPasswordPayload
      );
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(forgotPassword.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(forgotPassword.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toBeUndefined();

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);

      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle rejected state and set error message', async () => {
      const errorMessage = 'User not found for password reset';
      mockedForgotPasswordApi.mockRejectedValue(new Error(errorMessage));

      await forgotPassword(forgotPasswordPayload)(
        dispatch,
        getState,
        undefined
      );

      expect(mockedForgotPasswordApi).toHaveBeenCalledWith(
        forgotPasswordPayload
      );
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(forgotPassword.pending.type);
      expect(rejectedActionFromThunk.type).toBe(forgotPassword.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should use default error message for rejected state if no specific message', async () => {
      mockedForgotPasswordApi.mockRejectedValue({});

      await forgotPassword(forgotPasswordPayload)(
        dispatch,
        getState,
        undefined
      );
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(rejectedActionFromThunk.type).toBe(forgotPassword.rejected.type);
      expect(rejectedActionFromThunk.error.message).toBeUndefined();

      const pendingAction = dispatch.mock.calls[0][0];
      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка восстановления пароля');
    });
  });

  describe('Thunk: resetPassword', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();
    const resetPasswordPayload = {
      password: 'newStrongPassword',
      token: 'validResetToken'
    };

    beforeEach(() => {
      dispatch.mockClear();
      getState.mockClear();
      mockedResetPasswordApi.mockClear();
    });

    it('should handle pending state', () => {
      const action = { type: resetPassword.pending.type };
      const state = authReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle fulfilled state', async () => {
      mockedResetPasswordApi.mockResolvedValue({ success: true });

      await resetPassword(resetPasswordPayload)(dispatch, getState, undefined);

      expect(mockedResetPasswordApi).toHaveBeenCalledWith(resetPasswordPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const fulfilledActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(resetPassword.pending.type);
      expect(fulfilledActionFromThunk.type).toBe(resetPassword.fulfilled.type);
      expect(fulfilledActionFromThunk.payload).toBeUndefined();

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, fulfilledActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle rejected state and set error message', async () => {
      const errorMessage = 'Invalid or expired token';
      mockedResetPasswordApi.mockRejectedValue(new Error(errorMessage));

      await resetPassword(resetPasswordPayload)(dispatch, getState, undefined);

      expect(mockedResetPasswordApi).toHaveBeenCalledWith(resetPasswordPayload);
      expect(dispatch).toHaveBeenCalledTimes(2);
      const pendingAction = dispatch.mock.calls[0][0];
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(pendingAction.type).toBe(resetPassword.pending.type);
      expect(rejectedActionFromThunk.type).toBe(resetPassword.rejected.type);
      expect(rejectedActionFromThunk.error).toBeDefined();
      expect(rejectedActionFromThunk.error.message).toBe(errorMessage);

      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should use default error message for rejected state if no specific message', async () => {
      mockedResetPasswordApi.mockRejectedValue({});

      await resetPassword(resetPasswordPayload)(dispatch, getState, undefined);
      const rejectedActionFromThunk = dispatch.mock.calls[1][0];

      expect(rejectedActionFromThunk.type).toBe(resetPassword.rejected.type);
      expect(rejectedActionFromThunk.error.message).toBeUndefined();

      const pendingAction = dispatch.mock.calls[0][0];
      let state = authReducer(initialState, pendingAction);
      state = authReducer(state, rejectedActionFromThunk);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Ошибка сброса пароля');
    });
  });

  describe('Селекторы auth', () => {
    const selectAuthUser = (state: RootState) => state.auth.user;
    const selectAuthIsAuthChecked = (state: RootState) =>
      state.auth.isAuthChecked;
    const selectAuthLoading = (state: RootState) => state.auth.loading;
    const selectAuthError = (state: RootState) => state.auth.error;

    const testAuthState: AuthState = {
      user: mockUser,
      isAuthChecked: true,
      loading: false,
      error: 'Test Auth Error'
    };

    const testRootState: RootState = {
      auth: testAuthState,
      user: {} as any,
      ingredients: {} as any,
      feed: {} as any,
      order: {} as any,
      userOrders: {} as any,
      burgerConstructor: {} as any,
      burger: {} as any,
      orders: {} as any
    };

    it('selectAuthUser should return user data', () => {
      expect(selectAuthUser(testRootState)).toEqual(mockUser);
    });

    it('selectAuthIsAuthChecked should return isAuthChecked status', () => {
      expect(selectAuthIsAuthChecked(testRootState)).toBe(true);
    });

    it('selectAuthLoading should return loading status', () => {
      expect(selectAuthLoading(testRootState)).toBe(false);
    });

    it('selectAuthError should return error message', () => {
      expect(selectAuthError(testRootState)).toBe('Test Auth Error');
    });

    it('selectAuthUser should return null if user is null', () => {
      const stateWithNullUser: RootState = {
        ...testRootState,
        auth: { ...testAuthState, user: null }
      };
      expect(selectAuthUser(stateWithNullUser)).toBeNull();
    });

    it('selectAuthError should return null if error is null', () => {
      const stateWithNullError: RootState = {
        ...testRootState,
        auth: { ...testAuthState, error: null }
      };
      expect(selectAuthError(stateWithNullError)).toBeNull();
    });
  });
});
