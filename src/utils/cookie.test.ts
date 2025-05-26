import { getCookie, setCookie, deleteCookie } from './cookie';

describe('Утилиты для работы с cookie', () => {
  let cookieStore: { [key: string]: string } = {};
  let mockDocumentCookieSet: jest.Mock;

  beforeEach(() => {
    cookieStore = {};
    mockDocumentCookieSet = jest.fn((cookieString: string) => {
      const [nameValue, ...propsArray] = cookieString.split(';');
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');

      let shouldDelete = false;
      const expiresProp = propsArray.find((prop) =>
        prop.trim().startsWith('expires=')
      );
      if (expiresProp) {
        const expiresValue = expiresProp.split('=')[1];
        if (new Date(expiresValue).getTime() <= Date.now()) {
          shouldDelete = true;
        }
      }

      const maxAgeProp = propsArray.find((prop) =>
        prop.trim().startsWith('max-age=')
      );
      if (maxAgeProp) {
        const maxAgeValue = parseInt(maxAgeProp.split('=')[1], 10);
        if (maxAgeValue <= 0) {
          shouldDelete = true;
        }
      }

      if (shouldDelete) {
        delete cookieStore[name.trim()];
      } else {
        cookieStore[name.trim()] = value; 
      }
    });

    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: jest.fn(() =>
        Object.entries(cookieStore)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ')
      ),
      set: mockDocumentCookieSet
    });
  });

  afterEach(() => {
    jest.restoreAllMocks(); 
  });

  describe('Функция setCookie', () => {
    it('should set a simple cookie and call document.cookie.set', () => {
      setCookie('testName', 'testValue');
      expect(mockDocumentCookieSet).toHaveBeenCalledTimes(1);
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringContaining(`testName=${encodeURIComponent('testValue')}`)
      );
      expect(cookieStore.testName).toBe(encodeURIComponent('testValue'));
    });

    it('should use default path "/"', () => {
      setCookie('pathTest', 'value');
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringContaining('path=/')
      );
    });

    it('should correctly set expires from a number (in seconds)', () => {
      const now = Date.now();
      const oneHourInSeconds = 3600;
      jest.spyOn(global.Date, 'now').mockReturnValue(now);
      const expectedDate = new Date(now + oneHourInSeconds * 1000);

      setCookie('expNumTest', 'value', { expires: oneHourInSeconds });
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringContaining(`expires=${expectedDate.toUTCString()}`)
      );
    });

    it('should correctly set expires from a Date object', () => {
      const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      setCookie('expDateTest', 'value', { expires: expiryDate });
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringContaining(`expires=${expiryDate.toUTCString()}`)
      );
    });

    it('should encode the cookie value', () => {
      const specialValue = 'val&ue=;';
      setCookie('encodeTest', specialValue);
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringContaining(
          `encodeTest=${encodeURIComponent(specialValue)}`
        )
      );
      expect(cookieStore.encodeTest).toBe(encodeURIComponent(specialValue));
    });

    it('should handle boolean props correctly (e.g., secure)', () => {
      setCookie('secureTest', 'value', { secure: true });
      expect(mockDocumentCookieSet).toHaveBeenCalledWith(
        expect.stringMatching(/secureTest=.*?secure/)
      );
    });
  });

  describe('Функция getCookie', () => {
    beforeEach(() => {
      cookieStore = {};
      
      cookieStore.test1 = encodeURIComponent('value1');
      cookieStore.test2 = encodeURIComponent('value with spaces');
      cookieStore.test3 = encodeURIComponent('val&ue=;');
      
      cookieStore['test.name'] = encodeURIComponent('dotValue');
      cookieStore['test*name'] = encodeURIComponent('starValue');
    });

    it('should return the correct value for an existing cookie', () => {
      expect(getCookie('test1')).toBe('value1');
    });

    it('should return undefined for a non-existent cookie', () => {
      expect(getCookie('nonExistent')).toBeUndefined();
    });

    it('should decode the cookie value', () => {
      expect(getCookie('test2')).toBe('value with spaces');
      expect(getCookie('test3')).toBe('val&ue=;');
    });

    it('should handle cookie names with special regex characters', () => {
      expect(getCookie('test.name')).toBe('dotValue');
      expect(getCookie('test*name')).toBe('starValue');
    });
  });

  describe('Функция deleteCookie', () => {
    it('should call document.cookie.set with an expiry date in the past and remove from store', () => {
      const currentTime = Date.now();
      
      const dateNowSpy = jest
        .spyOn(global.Date, 'now')
        .mockReturnValue(currentTime);

      cookieStore.deleteMe = encodeURIComponent('toBeDeleted');
      deleteCookie('deleteMe');

      dateNowSpy.mockRestore(); 

      expect(mockDocumentCookieSet).toHaveBeenCalledTimes(1);
      const callArguments = mockDocumentCookieSet.mock.calls[0][0] as string;
      expect(callArguments).toContain('deleteMe=');
      expect(callArguments).toContain('expires=');

      const expiresValueString = callArguments
        .split('expires=')[1]
        .split(';')[0];
      const expiresTime = new Date(expiresValueString).getTime();

      
      
      expect(expiresTime).toBeLessThan(currentTime);
      
      expect(expiresTime).toBeGreaterThanOrEqual(currentTime - 2000); 

      expect(cookieStore.deleteMe).toBeUndefined();
    });
  });
});
