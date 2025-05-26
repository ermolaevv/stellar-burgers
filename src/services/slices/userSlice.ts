import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '../../utils/types';
import {
  TRegisterData,
  TLoginData,
  TAuthResponse
} from '../../utils/burger-api';
import {
  registerUserApi,
  loginUserApi,
  logoutApi,
  getUserApi,
  updateUserApi,
  forgotPasswordApi,
  resetPasswordApi
} from '../../utils/burger-api';
import { setCookie, deleteCookie } from '../../utils/cookie';
import { RootState } from '../store';
import { createSelector } from '@reduxjs/toolkit';

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

// Thunks
export const registerUser = createAsyncThunk<
  TAuthResponse,
  TRegisterData,
  { rejectValue: string }
>('user/register', async (data, { rejectWithValue }) => {
  try {
    const res = await registerUserApi(data);
    localStorage.setItem('refreshToken', res.refreshToken);
    setCookie('accessToken', res.accessToken);
    return res;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk<
  TAuthResponse,
  TLoginData,
  { rejectValue: string }
>('user/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginUserApi(data);
    localStorage.setItem('refreshToken', res.refreshToken);
    setCookie('accessToken', res.accessToken);
    return res;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem('refreshToken');
      deleteCookie('accessToken');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const checkUserAuth = createAsyncThunk<
  TUser,
  void,
  { rejectValue: string }
>('user/checkAuth', async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await getUserApi();
    return res.user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'User not authenticated');
  }
});

export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('user/update', async (data, { rejectWithValue }) => {
  try {
    const res = await updateUserApi(data);
    return res.user;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Update user failed');
  }
});

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>('user/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    await forgotPasswordApi(data);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Forgot password failed');
  }
});

export const resetPassword = createAsyncThunk<
  void,
  { password: string; token: string },
  { rejectValue: string }
>('user/resetPassword', async (data, { rejectWithValue }) => {
  try {
    await resetPasswordApi(data);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Reset password failed');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    clearLoginError: (state) => {
      state.loginUserError = null;
    },
    clearRegisterError: (state) => {
      state.registerUserError = null;
    },
    clearForgotPasswordError: (state) => {
      state.forgotPasswordError = null;
    },
    clearForgotPasswordSuccess: (state) => {
      state.forgotPasswordSuccess = false;
    },
    clearResetPasswordError: (state) => {
      state.resetPasswordError = null;
    },
    clearResetPasswordSuccess: (state) => {
      state.resetPasswordSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.registerUserRequest = true;
        state.registerUserError = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<TAuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthChecked = true;
          state.registerUserRequest = false;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.registerUserRequest = false;
        state.registerUserError = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<TAuthResponse>) => {
          state.user = action.payload.user;
          state.isAuthChecked = true;
          state.loginUserRequest = false;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.logoutUserRequest = true;
        state.logoutUserError = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.logoutUserRequest = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutUserRequest = false;
        state.logoutUserError = action.payload;
      })
      .addCase(checkUserAuth.pending, (state) => {
        state.getUserRequest = true;
        state.getUserError = null;
      })
      .addCase(
        checkUserAuth.fulfilled,
        (state, action: PayloadAction<TUser>) => {
          state.user = action.payload;
          state.isAuthChecked = true;
          state.getUserRequest = false;
        }
      )
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.user = null;
        state.isAuthChecked = true;
        state.getUserRequest = false;
        state.getUserError = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateUserRequest = true;
        state.updateUserError = null;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<TUser>) => {
        state.user = action.payload;
        state.updateUserRequest = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserRequest = false;
        state.updateUserError = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordRequest = true;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordRequest = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordRequest = false;
        state.forgotPasswordError = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordRequest = true;
        state.resetPasswordSuccess = false;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordRequest = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordRequest = false;
        state.resetPasswordError = action.payload;
      });
  }
});

export const {
  setAuthChecked,
  clearLoginError,
  clearRegisterError,
  clearForgotPasswordError,
  clearForgotPasswordSuccess,
  clearResetPasswordError,
  clearResetPasswordSuccess
} = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;

export const selectUserName = createSelector(
  [selectUser],
  (user) => user?.name
);

export const selectLoginUserRequest = (state: RootState) =>
  state.user.loginUserRequest;
export const selectLoginUserError = (state: RootState) =>
  state.user.loginUserError;
export const selectRegisterUserRequest = (state: RootState) =>
  state.user.registerUserRequest;
export const selectRegisterUserError = (state: RootState) =>
  state.user.registerUserError;
export const selectUpdateUserRequest = (state: RootState) =>
  state.user.updateUserRequest;
export const selectUpdateUserError = (state: RootState) =>
  state.user.updateUserError;

export const selectForgotPasswordRequest = (state: RootState) =>
  state.user.forgotPasswordRequest;
export const selectForgotPasswordSuccess = (state: RootState) =>
  state.user.forgotPasswordSuccess;
export const selectForgotPasswordError = (state: RootState) =>
  state.user.forgotPasswordError;
export const selectResetPasswordRequest = (state: RootState) =>
  state.user.resetPasswordRequest;
export const selectResetPasswordSuccess = (state: RootState) =>
  state.user.resetPasswordSuccess;
export const selectResetPasswordError = (state: RootState) =>
  state.user.resetPasswordError;

export default userSlice.reducer;
