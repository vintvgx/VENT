import React, { ReactNode } from 'react';
import { AuthContextType, AuthState, OnboardingStep } from '@/types/authModel';
import { AuthProvider } from '@/context/auth/AuthContext';

// Default mock values
const defaultMockAuth: AuthContextType = {
  authState: {
    session: null,
    user: null,
    isLoading: false,
    isAuthenticated: false,
    onboardingStep: OnboardingStep.NONE,
  },
  refreshSession: jest.fn(),
  setOnboardingStep: jest.fn(),
};

// Current mock values that will be used
export let mockAuth = { ...defaultMockAuth };

export let mockAuthenticatedAuth = { ...defaultMockAuth, authState: { ...defaultMockAuth.authState, isAuthenticated: true } };

// Reset the mock to defaults
export const resetAuthMock = () => {
  mockAuth = { ...defaultMockAuth };
};

// Update specific parts of the mock
export const setAuthMock = (authOverrides: Partial<AuthContextType>) => {
  mockAuth = {
    ...mockAuth,
    ...authOverrides,
  };
};

// Mock specific user data
export const mockAuthWithUser = (userData: any) => {
  mockAuth = {
    ...mockAuth,
    authState: {
      ...mockAuth.authState,
      user: userData,
      isAuthenticated: true,
    },
  };
};

// The mock provider component
export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

// Mock the useAuth hook itself
jest.mock('@/context/auth/AuthContext', () => ({
  ...jest.requireActual('@/context/auth/AuthContext'),
  useAuth: () => mockAuth,
}));