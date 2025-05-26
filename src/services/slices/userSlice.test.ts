import { RootState } from '../store';
import userReducer, {
  
  registerUser,
  loginUser,
  logoutUser,
  checkUserAuth,
  updateUser,
  forgotPassword,
  resetPassword,
  
  setAuthChecked,
  clearLoginError,
  clearRegisterError,
  clearForgotPasswordError,
  clearForgotPasswordSuccess,
  clearResetPasswordError,
  clearResetPasswordSuccess,
  
  selectUser,
  selectIsAuthChecked,
  selectLoginUserRequest,
  selectLoginUserError,
  selectRegisterUserRequest,
  selectRegisterUserError,
  
  
  
  
  selectUpdateUserRequest,
  selectUpdateUserError,
  selectForgotPasswordRequest,
  selectForgotPasswordSuccess,
  selectForgotPasswordError,
  selectResetPasswordRequest,
  selectResetPasswordSuccess,
  selectResetPasswordError
} from './userSlice';
import { TUser } from '../../utils/types';
import {
  TAuthResponse,
  TRegisterData,
  TLoginData
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


export type TForgotPasswordData = { email: string };
export type TResetPasswordData = { password: string; token: string };


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


interface UserState {
  user: TUser | null;
  isAuthChecked: boolean;
  loginUserRequest: boolean;
  loginUserError: string | null | undefined;
  registerUserRequest: boolean;
  registerUserError: string | null | undefined;
  logoutUserRequest: boolean;
  logoutUserError: string | null | undefined;
  getUserRequest: boolean;
  getUserError: string | null | undefined;
  updateUserRequest: boolean;
  updateUserError: string | null | undefined;
  forgotPasswordRequest: boolean;
  forgotPasswordSuccess: boolean;
  forgotPasswordError: string | null | undefined;
  resetPasswordRequest: boolean;
  resetPasswordSuccess: boolean;
  resetPasswordError: string | null | undefined;
}

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  loginUserRequest: false,
  loginUserError: null,
  registerUserRequest: false,
  registerUserError: null,
  logoutUserRequest: false,
  logoutUserError: null,
  getUserRequest: false,
  getUserError: null,
  updateUserRequest: false,
  updateUserError: null,
  forgotPasswordRequest: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
  resetPasswordRequest: false,
  resetPasswordSuccess: false,
  resetPasswordError: null
};

const mockUser: TUser = { email: 'test@example.com', name: 'Test User' };
const mockAuthResponse: TAuthResponse = {
  success: true,
  user: mockUser,
  accessToken: 'mockAccessToken',
  refreshToken: 'mockRefreshToken'
};

describe('Слайс userSlice', () => {
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
      expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle setAuthChecked', () => {
      let nextState = userReducer(initialState, setAuthChecked(true));
      expect(nextState.isAuthChecked).toBe(true);
      nextState = userReducer(nextState, setAuthChecked(false));
      expect(nextState.isAuthChecked).toBe(false);
    });

    it('should handle clearLoginError', () => {
      const stateWithError: UserState = {
        ...initialState,
        loginUserError: 'Some login error'
      };
      const nextState = userReducer(stateWithError, clearLoginError());
      expect(nextState.loginUserError).toBeNull();
    });

    it('should handle clearRegisterError', () => {
      const stateWithError: UserState = {
        ...initialState,
        registerUserError: 'Some registration error'
      };
      const nextState = userReducer(stateWithError, clearRegisterError());
      expect(nextState.registerUserError).toBeNull();
    });

    it('should handle clearForgotPasswordError', () => {
      const stateWithError: UserState = {
        ...initialState,
        forgotPasswordError: 'Some forgot password error'
      };
      const nextState = userReducer(stateWithError, clearForgotPasswordError());
      expect(nextState.forgotPasswordError).toBeNull();
    });

    it('should handle clearForgotPasswordSuccess', () => {
      const stateWithSuccess: UserState = {
        ...initialState,
        forgotPasswordSuccess: true
      };
      const nextState = userReducer(
        stateWithSuccess,
        clearForgotPasswordSuccess()
      );
      expect(nextState.forgotPasswordSuccess).toBe(false);
    });

    it('should handle clearResetPasswordError', () => {
      const stateWithError: UserState = {
        ...initialState,
        resetPasswordError: 'Some reset password error'
      };
      const nextState = userReducer(stateWithError, clearResetPasswordError());
      expect(nextState.resetPasswordError).toBeNull();
    });

    it('should handle clearResetPasswordSuccess', () => {
      const stateWithSuccess: UserState = {
        ...initialState,
        resetPasswordSuccess: true
      };
      const nextState = userReducer(
        stateWithSuccess,
        clearResetPasswordSuccess()
      );
      expect(nextState.resetPasswordSuccess).toBe(false);
    });
  });

  it('should handle setAuthChecked', () => {
    let nextState = userReducer(initialState, setAuthChecked(true));
    expect(nextState.isAuthChecked).toBe(true);
    nextState = userReducer(nextState, setAuthChecked(false));
    expect(nextState.isAuthChecked).toBe(false);
  });

  it('should handle clearLoginError', () => {
    const stateWithError: UserState = {
      ...initialState,
      loginUserError: 'Some login error'
    };
    const nextState = userReducer(stateWithError, clearLoginError());
    expect(nextState.loginUserError).toBeNull();
  });

  it('should handle clearRegisterError', () => {
    const stateWithError: UserState = {
      ...initialState,
      registerUserError: 'Some registration error'
    };
    const nextState = userReducer(stateWithError, clearRegisterError());
    expect(nextState.registerUserError).toBeNull();
  });

  it('should handle clearForgotPasswordError', () => {
    const stateWithError: UserState = {
      ...initialState,
      forgotPasswordError: 'Some forgot password error'
    };
    const nextState = userReducer(stateWithError, clearForgotPasswordError());
    expect(nextState.forgotPasswordError).toBeNull();
  });

  it('should handle clearForgotPasswordSuccess', () => {
    const stateWithSuccess: UserState = {
      ...initialState,
      forgotPasswordSuccess: true
    };
    const nextState = userReducer(
      stateWithSuccess,
      clearForgotPasswordSuccess()
    );
    expect(nextState.forgotPasswordSuccess).toBe(false);
  });

  it('should handle clearResetPasswordError', () => {
    const stateWithError: UserState = {
      ...initialState,
      resetPasswordError: 'Some reset password error'
    };
    const nextState = userReducer(stateWithError, clearResetPasswordError());
    expect(nextState.resetPasswordError).toBeNull();
  });

  it('should handle clearResetPasswordSuccess', () => {
    const stateWithSuccess: UserState = {
      ...initialState,
      resetPasswordSuccess: true
    };
    const nextState = userReducer(
      stateWithSuccess,
      clearResetPasswordSuccess()
    );
    expect(nextState.resetPasswordSuccess).toBe(false);
  });
});


describe('Thunk: registerUser', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const registerPayload: TRegisterData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedRegisterUserApi.mockClear();
    localStorageMock.setItem.mockClear();
    mockedSetCookie.mockClear();
  });

  it('should handle pending state', () => {
    const action = {
      type: registerUser.pending.type,
      meta: { arg: registerPayload }
    };
    const state = userReducer(initialState, action);
    expect(state.registerUserRequest).toBe(true);
    expect(state.registerUserError).toBeNull();
  });

  it('should handle fulfilled state and set tokens', async () => {
    mockedRegisterUserApi.mockResolvedValue(mockAuthResponse);

    await registerUser(registerPayload)(dispatch, getState, undefined);

    expect(mockedRegisterUserApi).toHaveBeenCalledWith(registerPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(registerUser.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(registerUser.fulfilled.type);
    expect(dispatch.mock.calls[1][0].payload).toEqual(mockAuthResponse);

    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'refreshToken',
      mockAuthResponse.refreshToken
    );
    expect(mockedSetCookie).toHaveBeenCalledWith(
      'accessToken',
      mockAuthResponse.accessToken
    );

    
    const fulfilledAction = {
      type: registerUser.fulfilled.type,
      payload: mockAuthResponse,
      meta: { arg: registerPayload }
    };
    const state = userReducer(initialState, fulfilledAction);
    expect(state.user).toEqual(mockAuthResponse.user);
    expect(state.isAuthChecked).toBe(true);
    expect(state.registerUserRequest).toBe(false);
    expect(state.registerUserError).toBeNull();
  });

  it('should handle rejected state', async () => {
    const error = { message: 'Registration failed' };
    mockedRegisterUserApi.mockRejectedValue(error);

    await registerUser(registerPayload)(dispatch, getState, undefined);

    expect(mockedRegisterUserApi).toHaveBeenCalledWith(registerPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    const pendingAction = dispatch.mock.calls[0][0];
    const rejectedActionFromThunk = dispatch.mock.calls[1][0];

    expect(pendingAction.type).toBe(registerUser.pending.type);
    expect(rejectedActionFromThunk.type).toBe(registerUser.rejected.type);
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(initialState, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(false);
    expect(state.registerUserRequest).toBe(false);
    expect(state.registerUserError).toBe(error.message);
  });
});

describe('Thunk: loginUser', () => {
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
    const action = {
      type: loginUser.pending.type,
      meta: { arg: loginPayload }
    };
    const state = userReducer(initialState, action);
    expect(state.loginUserRequest).toBe(true);
    expect(state.loginUserError).toBeNull();
  });

  it('should handle fulfilled state and set tokens', async () => {
    mockedLoginUserApi.mockResolvedValue(mockAuthResponse);

    await loginUser(loginPayload)(dispatch, getState, undefined);

    expect(mockedLoginUserApi).toHaveBeenCalledWith(loginPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(loginUser.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(loginUser.fulfilled.type);
    expect(dispatch.mock.calls[1][0].payload).toEqual(mockAuthResponse);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'refreshToken',
      mockAuthResponse.refreshToken
    );
    expect(mockedSetCookie).toHaveBeenCalledWith(
      'accessToken',
      mockAuthResponse.accessToken
    );

    const fulfilledAction = {
      type: loginUser.fulfilled.type,
      payload: mockAuthResponse,
      meta: { arg: loginPayload }
    };
    const state = userReducer(initialState, fulfilledAction);
    expect(state.user).toEqual(mockAuthResponse.user);
    expect(state.isAuthChecked).toBe(true);
    expect(state.loginUserRequest).toBe(false);
    expect(state.loginUserError).toBeNull();
  });

  it('should handle rejected state', async () => {
    const error = { message: 'Login failed' };
    mockedLoginUserApi.mockRejectedValue(error);

    await loginUser(loginPayload)(dispatch, getState, undefined);

    expect(mockedLoginUserApi).toHaveBeenCalledWith(loginPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    const pendingAction = dispatch.mock.calls[0][0];
    const rejectedActionFromThunk = dispatch.mock.calls[1][0];

    expect(pendingAction.type).toBe(loginUser.pending.type);
    expect(rejectedActionFromThunk.type).toBe(loginUser.rejected.type);
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(initialState, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(false);
    expect(state.loginUserRequest).toBe(false);
    expect(state.loginUserError).toBe(error.message);
  });
});

describe('Thunk: logoutUser', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedLogoutApi.mockClear();
    localStorageMock.removeItem.mockClear(); 
    mockedDeleteCookie.mockClear();
  });

  it('should handle pending state', () => {
    
    const stateWithUser: UserState = { ...initialState, user: mockUser };
    const action = { type: logoutUser.pending.type };
    const state = userReducer(stateWithUser, action);
    expect(state.logoutUserRequest).toBe(true);
    expect(state.logoutUserError).toBeNull();
  });

  it('should handle fulfilled state and clear tokens', async () => {
    
    
    
    mockedLogoutApi.mockResolvedValue({
      success: true,
      message: 'Logout successful'
    });

    
    const stateBeforeLogout: UserState = {
      ...initialState,
      user: mockUser,
      isAuthChecked: true
    };
    getState.mockReturnValue({ user: stateBeforeLogout }); 

    await logoutUser()(dispatch, getState, undefined);

    expect(mockedLogoutApi).toHaveBeenCalledTimes(1); 
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(logoutUser.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(logoutUser.fulfilled.type);
    

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(mockedDeleteCookie).toHaveBeenCalledWith('accessToken');

    
    const fulfilledAction = { type: logoutUser.fulfilled.type }; 
    
    const state = userReducer(stateBeforeLogout, fulfilledAction);
    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(true); 
    expect(state.logoutUserRequest).toBe(false);
    expect(state.logoutUserError).toBeNull();
  });

  it('should handle rejected state', async () => {
    const error = { message: 'Logout failed' };
    mockedLogoutApi.mockRejectedValue(error);

    const stateBeforeLogout: UserState = {
      ...initialState,
      user: mockUser,
      isAuthChecked: true
    };
    getState.mockReturnValue({ user: stateBeforeLogout });

    await logoutUser()(dispatch, getState, undefined);

    expect(mockedLogoutApi).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    const pendingAction = dispatch.mock.calls[0][0];
    const rejectedActionFromThunk = dispatch.mock.calls[1][0];

    expect(pendingAction.type).toBe(logoutUser.pending.type);
    expect(rejectedActionFromThunk.type).toBe(logoutUser.rejected.type);
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(stateBeforeLogout, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.user).toEqual(mockUser);
    expect(state.isAuthChecked).toBe(true);
    expect(state.logoutUserRequest).toBe(false);
    expect(state.logoutUserError).toBe(error.message);
  });
});

describe('Thunk: checkUserAuth (проверка авторизации)', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedGetUserApi.mockClear();
    
    
  });

  it('should handle pending state', () => {
    const action = { type: checkUserAuth.pending.type };
    const state = userReducer(initialState, action);
    expect(state.getUserRequest).toBe(true);
    expect(state.getUserError).toBeNull();
    
    expect(state.isAuthChecked).toBe(false);
  });

  it('should handle fulfilled state when user is authenticated', async () => {
    
    const mockGetUserResponse = { success: true, user: mockUser }; 
    mockedGetUserApi.mockResolvedValue(mockGetUserResponse);

    await checkUserAuth()(dispatch, getState, undefined);

    expect(mockedGetUserApi).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(checkUserAuth.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(checkUserAuth.fulfilled.type);
    
    expect(dispatch.mock.calls[1][0].payload).toEqual(mockUser);

    
    
    const fulfilledAction = {
      type: checkUserAuth.fulfilled.type,
      payload: mockUser
    };
    const state = userReducer(initialState, fulfilledAction);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthChecked).toBe(true);
    expect(state.getUserRequest).toBe(false);
    expect(state.getUserError).toBeNull();
  });

  it('should handle rejected state when user is not authenticated or API fails', async () => {
    const error = { message: 'Authentication failed' };
    mockedGetUserApi.mockRejectedValue(error);

    await checkUserAuth()(dispatch, getState, undefined);

    expect(mockedGetUserApi).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    const pendingAction = dispatch.mock.calls[0][0];
    const rejectedActionFromThunk = dispatch.mock.calls[1][0];

    expect(pendingAction.type).toBe(checkUserAuth.pending.type);
    expect(rejectedActionFromThunk.type).toBe(checkUserAuth.rejected.type);
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(initialState, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.user).toBeNull();
    expect(state.isAuthChecked).toBe(true); 
    expect(state.getUserRequest).toBe(false);
    expect(state.getUserError).toBe(error.message);
  });
});

describe('Thunk: updateUser', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const updatePayload: Partial<TRegisterData> = {
    name: 'New Test Name'
  };
  const initialUserInState: TUser = { ...mockUser, name: 'Old Test Name' };
  const updatedUserFromServer: TUser = { ...mockUser, name: 'New Test Name' };
  const mockUpdateUserResponse = {
    success: true,
    user: updatedUserFromServer
  }; 

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedUpdateUserApi.mockClear();
  });

  it('should handle pending state', () => {
    const action = {
      type: updateUser.pending.type,
      meta: { arg: updatePayload }
    };
    
    const stateWithCurrentUser = {
      ...initialState,
      user: initialUserInState
    };
    const state = userReducer(stateWithCurrentUser, action);
    expect(state.updateUserRequest).toBe(true);
    expect(state.updateUserError).toBeNull();
  });

  it('should handle fulfilled state and update user data', async () => {
    mockedUpdateUserApi.mockResolvedValue(mockUpdateUserResponse);

    const currentState = {
      user: { ...initialState, user: initialUserInState }
    };
    getState.mockReturnValue(currentState);

    await updateUser(updatePayload)(dispatch, getState, undefined);

    expect(mockedUpdateUserApi).toHaveBeenCalledWith(updatePayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(updateUser.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(updateUser.fulfilled.type);
    
    expect(dispatch.mock.calls[1][0].payload).toEqual(updatedUserFromServer);

    
    
    const fulfilledAction = {
      type: updateUser.fulfilled.type,
      payload: updatedUserFromServer,
      meta: { arg: updatePayload }
    };
    const stateBeforeUpdate = { ...initialState, user: initialUserInState };
    const state = userReducer(stateBeforeUpdate, fulfilledAction);
    expect(state.user).toEqual(updatedUserFromServer);
    expect(state.updateUserRequest).toBe(false);
    expect(state.updateUserError).toBeNull();
  });

  it('should handle rejected state and not change user data', async () => {
    const error = { message: 'Update failed' };
    mockedUpdateUserApi.mockRejectedValue(error);

    const currentState = {
      user: { ...initialState, user: initialUserInState }
    };
    getState.mockReturnValue(currentState);

    await updateUser(updatePayload)(dispatch, getState, undefined);

    expect(mockedUpdateUserApi).toHaveBeenCalledWith(updatePayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(updateUser.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(updateUser.rejected.type);
    expect(dispatch.mock.calls[1][0].payload).toBe(error.message);
    expect(dispatch.mock.calls[1][0].meta.rejectedWithValue).toBe(true);

    
    const rejectedAction = {
      type: updateUser.rejected.type,
      payload: error.message,
      meta: { arg: updatePayload }
    };
    const stateBeforeUpdate = { ...initialState, user: initialUserInState };
    const state = userReducer(stateBeforeUpdate, rejectedAction);
    expect(state.user).toEqual(initialUserInState); 
    expect(state.updateUserRequest).toBe(false);
    expect(state.updateUserError).toBe(error.message);
  });
});

describe('Thunk: forgotPassword', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const forgotPasswordPayload: TForgotPasswordData = {
    email: 'test@example.com'
  };
  const mockForgotPasswordResponse = {
    success: true,
    message: 'Reset email sent'
  }; 

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedForgotPasswordApi.mockClear();
  });

  it('should handle pending state', () => {
    const action = {
      type: forgotPassword.pending.type,
      meta: { arg: forgotPasswordPayload }
    };
    const state = userReducer(initialState, action);
    expect(state.forgotPasswordRequest).toBe(true);
    expect(state.forgotPasswordError).toBeNull();
    expect(state.forgotPasswordSuccess).toBe(false);
  });

  it('should handle fulfilled state', async () => {
    mockedForgotPasswordApi.mockResolvedValue(mockForgotPasswordResponse);

    await forgotPassword(forgotPasswordPayload)(
      dispatch,
      getState,
      undefined
    );

    expect(mockedForgotPasswordApi).toHaveBeenCalledWith(
      forgotPasswordPayload
    );
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(forgotPassword.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(
      forgotPassword.fulfilled.type
    );
    
    expect(dispatch.mock.calls[1][0].payload).toBeUndefined();

    
    
    
    const fulfilledAction = {
      type: forgotPassword.fulfilled.type,
      payload: undefined,
      meta: { arg: forgotPasswordPayload }
    };
    const state = userReducer(initialState, fulfilledAction);
    expect(state.forgotPasswordRequest).toBe(false);
    expect(state.forgotPasswordSuccess).toBe(true);
    expect(state.forgotPasswordError).toBeNull();
  });

  it('should handle rejected state', async () => {
    const error = { message: 'Forgot password failed' };
    mockedForgotPasswordApi.mockRejectedValue(error);

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
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(initialState, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.forgotPasswordRequest).toBe(false);
    expect(state.forgotPasswordSuccess).toBe(false);
    expect(state.forgotPasswordError).toBe(error.message);
  });
});

describe('Thunk: resetPassword', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const resetPasswordPayload: TResetPasswordData = {
    password: 'newPassword123',
    token: 'resetToken12345'
  };
  const mockResetPasswordResponse = {
    success: true,
    message: 'Password has been reset'
  }; 

  beforeEach(() => {
    dispatch.mockClear();
    getState.mockClear();
    mockedResetPasswordApi.mockClear();
  });

  it('should handle pending state', () => {
    const action = {
      type: resetPassword.pending.type,
      meta: { arg: resetPasswordPayload }
    };
    const state = userReducer(initialState, action);
    expect(state.resetPasswordRequest).toBe(true);
    expect(state.resetPasswordError).toBeNull();
    expect(state.resetPasswordSuccess).toBe(false);
  });

  it('should handle fulfilled state', async () => {
    mockedResetPasswordApi.mockResolvedValue(mockResetPasswordResponse); 

    await resetPassword(resetPasswordPayload)(dispatch, getState, undefined);

    expect(mockedResetPasswordApi).toHaveBeenCalledWith(resetPasswordPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    expect(dispatch.mock.calls[0][0].type).toBe(resetPassword.pending.type);
    expect(dispatch.mock.calls[1][0].type).toBe(resetPassword.fulfilled.type);
    
    expect(dispatch.mock.calls[1][0].payload).toBeUndefined();

    
    
    const fulfilledAction = {
      type: resetPassword.fulfilled.type,
      payload: undefined,
      meta: { arg: resetPasswordPayload }
    };
    const state = userReducer(initialState, fulfilledAction);
    expect(state.resetPasswordRequest).toBe(false);
    expect(state.resetPasswordSuccess).toBe(true);
    expect(state.resetPasswordError).toBeNull();
  });

  it('should handle rejected state', async () => {
    const error = { message: 'Reset password failed' };
    mockedResetPasswordApi.mockRejectedValue(error);

    await resetPassword(resetPasswordPayload)(dispatch, getState, undefined);

    expect(mockedResetPasswordApi).toHaveBeenCalledWith(resetPasswordPayload);
    expect(dispatch).toHaveBeenCalledTimes(2); 
    const pendingAction = dispatch.mock.calls[0][0];
    const rejectedActionFromThunk = dispatch.mock.calls[1][0];

    expect(pendingAction.type).toBe(resetPassword.pending.type);
    expect(rejectedActionFromThunk.type).toBe(resetPassword.rejected.type);
    expect(rejectedActionFromThunk.payload).toBe(error.message);
    expect(rejectedActionFromThunk.meta.rejectedWithValue).toBe(true);

    
    let state = userReducer(initialState, pendingAction);
    state = userReducer(state, rejectedActionFromThunk);

    expect(state.resetPasswordRequest).toBe(false);
    expect(state.resetPasswordSuccess).toBe(false);
    expect(state.resetPasswordError).toBe(error.message);
  });
});

  
describe('Селекторы userSlice', () => {
  const testUserState: UserState = {
    user: mockUser,
    isAuthChecked: true,
    loginUserRequest: true,
    loginUserError: 'Login error message',
    registerUserRequest: false,
    registerUserError: 'Register error message',
    logoutUserRequest: true, 
    logoutUserError: 'Logout error message',
    getUserRequest: false, 
    getUserError: 'GetUser error message',
    updateUserRequest: true,
    updateUserError: 'Update error message',
    forgotPasswordRequest: false,
    forgotPasswordSuccess: true,
    forgotPasswordError: 'Forgot password error',
    resetPasswordRequest: true,
    resetPasswordSuccess: false,
    resetPasswordError: 'Reset password error'
  };

  const testState: RootState = {
    user: testUserState,
    ingredients: {} as any, 
    feed: {} as any,
    order: {} as any,
    userOrders: {} as any,
    burgerConstructor: {} as any,
    
    burger: {} as any,
    auth: {} as any,
    orders: {} as any
  };

  it('selectUser should return user data', () => {
    expect(selectUser(testState)).toEqual(mockUser);
  });

  it('selectIsAuthChecked should return isAuthChecked status', () => {
    expect(selectIsAuthChecked(testState)).toBe(true);
  });

  it('selectLoginUserRequest should return loginUserRequest status', () => {
    expect(selectLoginUserRequest(testState)).toBe(true);
  });

  it('selectLoginUserError should return loginUserError message', () => {
    expect(selectLoginUserError(testState)).toBe('Login error message');
  });

  it('selectRegisterUserRequest should return registerUserRequest status', () => {
    expect(selectRegisterUserRequest(testState)).toBe(false);
  });

  it('selectRegisterUserError should return registerUserError message', () => {
    expect(selectRegisterUserError(testState)).toBe('Register error message');
  });

  it('selectUpdateUserRequest should return updateUserRequest status', () => {
    expect(selectUpdateUserRequest(testState)).toBe(true);
  });

  it('selectUpdateUserError should return updateUserError message', () => {
    expect(selectUpdateUserError(testState)).toBe('Update error message');
  });

  it('selectForgotPasswordRequest should return forgotPasswordRequest status', () => {
    expect(selectForgotPasswordRequest(testState)).toBe(false);
  });

  it('selectForgotPasswordSuccess should return forgotPasswordSuccess status', () => {
    expect(selectForgotPasswordSuccess(testState)).toBe(true);
  });

  it('selectForgotPasswordError should return forgotPasswordError message', () => {
    expect(selectForgotPasswordError(testState)).toBe(
      'Forgot password error'
    );
  });

  it('selectResetPasswordRequest should return resetPasswordRequest status', () => {
    expect(selectResetPasswordRequest(testState)).toBe(true);
  });

  it('selectResetPasswordSuccess should return resetPasswordSuccess status', () => {
    expect(selectResetPasswordSuccess(testState)).toBe(false);
  });

  it('selectResetPasswordError should return resetPasswordError message', () => {
    expect(selectResetPasswordError(testState)).toBe('Reset password error');
  });
});
