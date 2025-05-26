import * as cookieUtilsOrigin from './cookie'; 
import {
  checkResponse,
  refreshToken,
  
  getIngredientsApi,
  getFeedsApi,
  getOrdersApi,
  orderBurgerApi,
  getOrderByNumberApi,
  registerUserApi,
  loginUserApi,
  forgotPasswordApi,
  resetPasswordApi, 
  getUserApi,
  updateUserApi,
  logoutApi
} from './burger-api';


global.fetch = jest.fn();


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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });











const mockApiUrl = 'https://mockapi.example.com';
process.env.BURGER_API_URL = mockApiUrl;


let BurgerApiModuleType: typeof import('./burger-api');

describe('Вспомогательные функции burger-api', () => {
  beforeEach(() => {
    
    (fetch as jest.Mock).mockReset();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();

    if (
      cookieUtilsOrigin.getCookie &&
      (cookieUtilsOrigin.getCookie as jest.Mock).mockClear
    ) {
      (cookieUtilsOrigin.getCookie as jest.Mock).mockClear();
    }
    if (
      cookieUtilsOrigin.setCookie &&
      (cookieUtilsOrigin.setCookie as jest.Mock).mockClear
    ) {
      (cookieUtilsOrigin.setCookie as jest.Mock).mockClear();
    }
    if (
      cookieUtilsOrigin.deleteCookie &&
      (cookieUtilsOrigin.deleteCookie as jest.Mock).mockClear
    ) {
      (cookieUtilsOrigin.deleteCookie as jest.Mock).mockClear();
    }
  });

  test('simple inner test', () => {
    
    expect(true).toBe(true);
  });

  describe('checkResponse (проверка ответа)', () => {
    it('should return response.json() if response.ok is true', async () => {
      const mockData = { data: 'test' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData)
      } as unknown as Response;
      const result = await checkResponse(mockResponse);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockData);
    });

    it('should reject with error from response.json() if response.ok is false', async () => {
      const mockError = { message: 'Test error' };
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue(mockError)
      } as unknown as Response;
      await expect(checkResponse(mockResponse)).rejects.toEqual(mockError);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });

  
  describe('Стандартные функции API (сброс модулей для каждого теста)', () => {
    const originalEnv = process.env;
    let currentBurgerApiModule: typeof BurgerApiModuleType;

    beforeEach(async () => {
      process.env = { ...originalEnv, BURGER_API_URL: mockApiUrl };
      jest.resetModules();
      global.fetch = jest.fn();
      currentBurgerApiModule = await import('./burger-api');
      BurgerApiModuleType = currentBurgerApiModule;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    describe('getIngredientsApi (получение ингредиентов)', () => {
      const mockIngredients = [{ _id: '1', name: 'Bun' }];
      it('should fetch ingredients and return data on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest
            .fn()
            .mockResolvedValueOnce({ success: true, data: mockIngredients })
        } as unknown as Response);
        const result = await currentBurgerApiModule.getIngredientsApi();
        expect(fetch).toHaveBeenCalledWith(`${mockApiUrl}/ingredients`);
        expect(result).toEqual(mockIngredients);
      });
      it('should reject if response success is false', async () => {
        const mockFailure = {
          success: false,
          message: 'Failed to get ingredients'
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.getIngredientsApi()
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetch fails (network error)', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.getIngredientsApi()
        ).rejects.toThrow('Network error');
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.getIngredientsApi()
        ).rejects.toBeNull();
      });
    });

    describe('getFeedsApi (получение ленты заказов)', () => {
      const mockFeedsData = {
        orders: [{ _id: '1', status: 'done' }],
        total: 10,
        totalToday: 5
      };
      it('should fetch feeds and return data on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest
            .fn()
            .mockResolvedValueOnce({ success: true, ...mockFeedsData })
        } as unknown as Response);
        const result = await currentBurgerApiModule.getFeedsApi();
        expect(fetch).toHaveBeenCalledWith(`${mockApiUrl}/orders/all`);
        expect(result).toEqual({ success: true, ...mockFeedsData });
      });
      it('should reject if response success is false', async () => {
        const mockFailure = { success: false, message: 'Failed to get feeds' };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(currentBurgerApiModule.getFeedsApi()).rejects.toEqual(
          mockFailure
        );
      });
      it('should reject if fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(currentBurgerApiModule.getFeedsApi()).rejects.toThrow(
          'Network error'
        );
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(currentBurgerApiModule.getFeedsApi()).rejects.toBeNull();
      });
    });

    describe('getOrderByNumberApi (получение заказа по номеру)', () => {
      const orderNumber = 12345;
      const mockOrderResponse = {
        orders: [{ _id: '123', number: orderNumber }]
      };
      it('should fetch order by number and return data on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest
            .fn()
            .mockResolvedValueOnce({ success: true, ...mockOrderResponse })
        } as unknown as Response);
        const result =
          await currentBurgerApiModule.getOrderByNumberApi(orderNumber);
        expect(fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/orders/${orderNumber}`,
          expect.any(Object)
        );
        expect(result).toEqual({ success: true, ...mockOrderResponse });
      });
      it('should resolve with { success: false, ... } if response.ok is true but server indicates failure', async () => {
        const mockFailureResponse = {
          success: false,
          message: 'Order not found'
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailureResponse)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.getOrderByNumberApi(orderNumber)
        ).resolves.toEqual(mockFailureResponse);
      });
      it('should reject if fetch fails (network error)', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.getOrderByNumberApi(orderNumber)
        ).rejects.toThrow('Network error');
      });
      it('should resolve with null if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.getOrderByNumberApi(orderNumber)
        ).resolves.toBeNull();
      });
    });

    describe('registerUserApi (регистрация пользователя)', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User'
      };
      const mockSuccessResponse = {
        success: true,
        user: { email: userData.email, name: userData.name },
        accessToken: 'at',
        refreshToken: 'rt'
      };
      it('should register user and return data on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSuccessResponse)
        } as unknown as Response);
        const result = await currentBurgerApiModule.registerUserApi(userData);
        expect(fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/auth/register`,
          expect.any(Object)
        );
        expect(result).toEqual(mockSuccessResponse);
      });
      it('should reject if response success is false', async () => {
        const mockFailure = { success: false, message: 'Registration failed' };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.registerUserApi(userData)
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.registerUserApi(userData)
        ).rejects.toThrow('Network error');
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.registerUserApi(userData)
        ).rejects.toBeNull();
      });
    });

    describe('loginUserApi (логин пользователя)', () => {
      const loginData = { email: 'test@example.com', password: 'password' };
      const mockSuccessResponse = {
        success: true,
        user: { email: loginData.email, name: 'Test User' },
        accessToken: 'at',
        refreshToken: 'rt'
      };
      it('should login user and return data on success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSuccessResponse)
        } as unknown as Response);
        const result = await currentBurgerApiModule.loginUserApi(loginData);
        expect(fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/auth/login`,
          expect.any(Object)
        );
        expect(result).toEqual(mockSuccessResponse);
      });
      it('should reject if response success is false', async () => {
        const mockFailure = { success: false, message: 'Login failed' };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.loginUserApi(loginData)
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.loginUserApi(loginData)
        ).rejects.toThrow('Network error');
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.loginUserApi(loginData)
        ).rejects.toBeNull();
      });
    });

    describe('forgotPasswordApi (восстановление пароля)', () => {
      const emailData = { email: 'test@example.com' };
      const mockSuccessResponse = {
        success: true,
        message: 'Reset email sent'
      };
      it('should send forgot password request and return success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSuccessResponse)
        } as unknown as Response);
        const result =
          await currentBurgerApiModule.forgotPasswordApi(emailData);
        expect(fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/password-reset`,
          expect.any(Object)
        );
        expect(result).toEqual(mockSuccessResponse);
      });
      it('should reject if response success is false', async () => {
        const mockFailure = {
          success: false,
          message: 'Forgot password failed'
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.forgotPasswordApi(emailData)
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.forgotPasswordApi(emailData)
        ).rejects.toThrow('Network error');
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.forgotPasswordApi(emailData)
        ).rejects.toBeNull();
      });
    });

    describe('resetPasswordApi (сброс пароля)', () => {
      const resetApiPayload = { password: 'newPassword', token: 'resetToken' };
      const mockSuccessResponse = {
        success: true,
        message: 'Password has been reset'
      };

      it('should send reset password request and return success', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSuccessResponse)
        } as unknown as Response);
        const result =
          await currentBurgerApiModule.resetPasswordApi(resetApiPayload);

        expect(fetch).toHaveBeenCalledWith(
          `${mockApiUrl}/password-reset/reset`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(resetApiPayload)
          }
        );
        expect(result).toEqual(mockSuccessResponse);
      });
      it('should reject if response success is false', async () => {
        const mockFailure = {
          success: false,
          message: 'Reset password failed'
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockFailure)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.resetPasswordApi(resetApiPayload)
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
        await expect(
          currentBurgerApiModule.resetPasswordApi(resetApiPayload)
        ).rejects.toThrow('Network error');
      });
      it('should reject if checkResponse resolves with null/undefined', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(null)
        } as unknown as Response);
        await expect(
          currentBurgerApiModule.resetPasswordApi(resetApiPayload)
        ).rejects.toBeNull();
      });
    });
  }); 

  describe('refreshToken (обновление токена)', () => {
    const originalEnv = process.env;
    let originalLocalStorageGetItem: jest.SpyInstance | undefined;
    let importedRefreshToken: typeof refreshToken;
    let testSpecificMockSetCookie: jest.Mock; 

    beforeEach(async () => {
      process.env.BURGER_API_URL = mockApiUrl;
      jest.resetModules(); 

      
      testSpecificMockSetCookie = jest.fn();
      jest.doMock('./cookie', () => ({
        __esModule: true, 
        getCookie: jest.fn(),
        setCookie: testSpecificMockSetCookie, 
        deleteCookie: jest.fn()
      }));

      global.fetch = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          message: 'Default mock fetch in refreshToken beforeEach'
        })
      });

      const burgerApiModule = await import('./burger-api'); 
      importedRefreshToken = burgerApiModule.refreshToken;

      localStorageMock.clear();
      originalLocalStorageGetItem = jest.spyOn(window.localStorage, 'getItem');

      testSpecificMockSetCookie.mockClear(); 
    });

    afterEach(() => {
      if (originalLocalStorageGetItem) {
        originalLocalStorageGetItem.mockRestore();
        originalLocalStorageGetItem = undefined;
      }
      process.env = originalEnv;
      testSpecificMockSetCookie.mockClear(); 
      jest.dontMock('./cookie'); 
    });

    it('should fetch new token and save to cookies and localStorage', async () => {
      const mockTokenResponse = {
        success: true,
        accessToken: 'Bearer newAccessToken',
        refreshToken: 'newRefreshToken'
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockTokenResponse)
      } as unknown as Response);
      originalLocalStorageGetItem?.mockReturnValueOnce('oldRefreshToken');
      const result = await importedRefreshToken();
      expect(fetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ token: 'oldRefreshToken' })
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'refreshToken',
        'newRefreshToken'
      );
      expect(testSpecificMockSetCookie).toHaveBeenCalledWith(
        'accessToken',
        'newAccessToken'
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it('should reject if localStorage has no refreshToken', async () => {
      originalLocalStorageGetItem?.mockReturnValueOnce(null);
      await expect(importedRefreshToken()).rejects.toEqual(
        new Error('No refresh token in localStorage')
      );
    });

    it('should reject if fetch fails', async () => {
      originalLocalStorageGetItem?.mockReturnValueOnce('someToken');
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));
      await expect(importedRefreshToken()).rejects.toThrow('Network failure');
    });

    it('should reject if response is not ok', async () => {
      originalLocalStorageGetItem?.mockReturnValueOnce('someToken');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({ message: 'Auth error' })
      } as unknown as Response);
      await expect(importedRefreshToken()).rejects.toEqual({
        message: 'Auth error'
      });
    });

    it('should reject if response success is false', async () => {
      originalLocalStorageGetItem?.mockReturnValueOnce('someToken');
      const mockErrorResponse = {
        success: false,
        message: 'Token request failed'
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockErrorResponse)
      } as unknown as Response);
      await expect(importedRefreshToken()).rejects.toEqual(mockErrorResponse);
    });
  });

  
  describe('Функции, использующие (мок) fetchWithRefresh', () => {
    const originalEnv = process.env;
    let fetchWithRefreshSpy: jest.SpyInstance;
    let burgerApiModuleInstance: typeof BurgerApiModuleType;
    let localMockedGetCookie: jest.Mock;

    beforeEach(async () => {
      process.env = { ...originalEnv, BURGER_API_URL: mockApiUrl };
      jest.resetModules();
      
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        configurable: true
      });
      localStorageMock.clear(); 

      global.fetch = jest.fn();

      const localCookieMocks = {
        getCookie: jest.fn(),
        setCookie: jest.fn(),
        deleteCookie: jest.fn()
      };
      jest.doMock('./cookie', () => localCookieMocks);
      localMockedGetCookie = localCookieMocks.getCookie as jest.Mock;

      burgerApiModuleInstance = await import('./burger-api');
      BurgerApiModuleType = burgerApiModuleInstance;
      fetchWithRefreshSpy = jest.spyOn(
        burgerApiModuleInstance,
        'fetchWithRefresh'
      );
    });

    afterEach(() => {
      if (fetchWithRefreshSpy) {
        fetchWithRefreshSpy.mockRestore();
      }
      jest.dontMock('./cookie');
      process.env = originalEnv;
    });

    describe('getOrdersApi (получение заказов пользователя)', () => {
      const mockOrdersResponse = {
        success: true,
        orders: [{ id: '1', name: 'Order 1' }]
      };
      const mockFailure = { success: false, message: 'Failed to fetch orders' };

      it('should call fetchWithRefresh and return data on success', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockOrdersResponse);
        const result = await burgerApiModuleInstance.getOrdersApi();
        expect(fetchWithRefreshSpy).toHaveBeenCalledWith(
          `${mockApiUrl}/orders`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              authorization: 'test-access-token'
            }
          }
        );
        expect(result).toEqual(mockOrdersResponse.orders);
      });
      it('should reject with data if fetchWithRefresh resolves with { success: false }', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockFailure);
        await expect(burgerApiModuleInstance.getOrdersApi()).rejects.toEqual(
          mockFailure
        );
      });
      it('should reject if fetchWithRefresh resolves with null/undefined', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(null);
        await expect(burgerApiModuleInstance.getOrdersApi()).rejects.toBeNull();
      });
    });

    describe('orderBurgerApi (создание заказа)', () => {
      const mockOrderPayload = ['id1', 'id2'];
      const mockOrderResponse = { success: true, order: { number: 123 } };
      const mockFailure = { success: false, message: 'Order failed' };

      it('should call fetchWithRefresh and return order data on success', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockOrderResponse);
        const result =
          await burgerApiModuleInstance.orderBurgerApi(mockOrderPayload);
        expect(fetchWithRefreshSpy).toHaveBeenCalledWith(
          `${mockApiUrl}/orders`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              authorization: 'test-access-token'
            },
            body: JSON.stringify({ ingredients: mockOrderPayload })
          }
        );
        expect(result).toEqual(mockOrderResponse);
      });
      it('should reject with data if fetchWithRefresh resolves with { success: false }', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockFailure);
        await expect(
          burgerApiModuleInstance.orderBurgerApi(mockOrderPayload)
        ).rejects.toEqual(mockFailure);
      });
      it('should reject if fetchWithRefresh resolves with null/undefined', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(null);
        await expect(
          burgerApiModuleInstance.orderBurgerApi(mockOrderPayload)
        ).rejects.toBeNull();
      });
    });

    describe('getUserApi (получение данных пользователя)', () => {
      const mockUserResponse = {
        success: true,
        user: { email: 'test@test.com', name: 'Test User' }
      };
      it('should call fetchWithRefresh and return user data on success', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockUserResponse);
        const result = await burgerApiModuleInstance.getUserApi();
        expect(fetchWithRefreshSpy).toHaveBeenCalledWith(
          `${mockApiUrl}/auth/user`,
          {
            headers: { authorization: 'test-access-token' }
            
          }
        );
        expect(result).toEqual(mockUserResponse);
      });
      it('should return null if fetchWithRefresh resolves with null', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        (fetchWithRefreshSpy as jest.SpyInstance).mockResolvedValueOnce(null);
        await expect(burgerApiModuleInstance.getUserApi()).resolves.toBeNull();
      });
    });

    describe('updateUserApi (обновление данных пользователя)', () => {
      const mockUserPayload = { name: 'New Name' };
      const mockUserResponse = {
        success: true,
        user: { email: 'test@test.com', name: 'New Name' }
      };
      it('should call fetchWithRefresh and return updated user data on success', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        fetchWithRefreshSpy.mockResolvedValueOnce(mockUserResponse);
        const result =
          await burgerApiModuleInstance.updateUserApi(mockUserPayload);
        expect(fetchWithRefreshSpy).toHaveBeenCalledWith(
          `${mockApiUrl}/auth/user`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              authorization: 'test-access-token'
            },
            body: JSON.stringify(mockUserPayload)
          }
        );
        expect(result).toEqual(mockUserResponse);
      });
      it('should return null if fetchWithRefresh resolves with null', async () => {
        localMockedGetCookie.mockReturnValueOnce('test-access-token');
        (fetchWithRefreshSpy as jest.SpyInstance).mockResolvedValueOnce(null);
        await expect(
          burgerApiModuleInstance.updateUserApi(mockUserPayload)
        ).resolves.toBeNull();
      });
    });

    describe('logoutApi (выход из системы)', () => {
      const mockSuccessResponse = {
        success: true,
        message: 'Logout successful'
      };
      it('should call fetch and resolve on success', async () => {
        localStorageMock.getItem.mockReturnValueOnce('test-refresh-token');
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockSuccessResponse)
        } as unknown as Response);

        await expect(burgerApiModuleInstance.logoutApi()).resolves.toEqual(
          mockSuccessResponse
        );
        expect(fetch).toHaveBeenCalledWith(`${mockApiUrl}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify({ token: 'test-refresh-token' })
        });
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(
          'refreshToken'
        );
      });
      it('should reject if fetch rejects', async () => {
        localStorageMock.getItem.mockReturnValueOnce('test-refresh-token');
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Logout failed'));
        await expect(burgerApiModuleInstance.logoutApi()).rejects.toThrow(
          'Logout failed'
        );
      });
    });
  }); 
});
