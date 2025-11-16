import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { createContext } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should provide initial auth state', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.auth).toEqual({
      token: null,
      role: null,
      userId: null,
      name: null
    });
  });

  it('should restore auth from localStorage on mount', () => {
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('role', 'tutor');
    localStorageMock.setItem('userId', 'user123');
    localStorageMock.setItem('name', 'Test User');

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.auth.token).toBe('test-token');
    expect(result.current.auth.role).toBe('tutor');
    expect(result.current.auth.userId).toBe('user123');
    expect(result.current.auth.name).toBe('Test User');
  });

  it('should login user and store in localStorage', () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login('new-token', 'client', 'user456', 'New User');
    });

    expect(result.current.auth.token).toBe('new-token');
    expect(result.current.auth.role).toBe('client');
    expect(result.current.auth.userId).toBe('user456');
    expect(result.current.auth.name).toBe('New User');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('role', 'client');
  });

  it('should logout user and clear localStorage', () => {
    localStorageMock.setItem('token', 'test-token');
    localStorageMock.setItem('role', 'tutor');

    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.auth.token).toBeNull();
    expect(result.current.auth.role).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('role');
  });

  it('should throw error if useAuth used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});

