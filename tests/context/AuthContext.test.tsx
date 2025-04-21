import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { supabase } from "@/lib/supabase/supabase";
import * as authUtils from "@/utils/auth/function";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { render, waitFor, act } from "@testing-library/react-native";
import { router } from "expo-router";
import React from "react";
import { expectAuthStatus, expectNavigation } from "../utils/test-utils";

/**
 * Mocking the supabase client
 */
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
      signOut: jest.fn(),
    },
  },
}));

/**
 * Mocking the auth utils
 */
jest.mock("@/utils/auth/function", () => ({
  checkProfileStatus: jest.fn(),
  checkRoleStatus: jest.fn(),
  checkAssessmentStatus: jest.fn(),
}));

/**
 * Mocking the async storage
 */
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

/**
 * Mocking the router
 */
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

/**
 * Mocking the react query
 */
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),        // Mock function for triggering mutations
    mutateAsync: jest.fn(),   // Mock function for async mutations
    isLoading: false,         // Default loading state
    isError: false,          // Default error state
    isSuccess: false,        // Default success state
    error: null              // Default error value
  }),
}));

const mockInvalidateQueries = jest.fn();
const mockClear = jest.fn();

function TestComponent() {
  const { authState, signOutMutation, refreshSession, setOnboardingStep } = useAuth();
  return (
    <>
      <>{JSON.stringify(authState)}</>
      <>{typeof signOutMutation === "object" ? "mutation" : ""}</>
      <>{typeof refreshSession === "function" ? "refresh" : ""}</>
      <>{typeof setOnboardingStep === "function" ? "setOnboarding" : ""}</>
    </>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
      clear: mockClear,
    });
  });

  it('redirects to profile setup when user has no profile data', async () => {
    // Mock successful login
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        },
        session: {
          access_token: 'test-token'
        }
      }),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });

    // Mock profile check to return false (no profile data)
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(false);

    // Mock session data
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the navigation to occur
    await waitFor(() => {
      expectNavigation('/(onboard)/profile');
    });

    // Verify that the onboarding step was set correctly
    await waitFor(() => {
      expect(authUtils.checkProfileStatus).toHaveBeenCalledWith('test-user-id');
      // expectAuthStatus('profile', 'test-user-id');
    });

    unmount();
  });

  it('redirects to role setup when user HAS profile & no role data', async () => {
    // Mock successful login
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        },
        session: {
          access_token: 'test-token'
        }
      }),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });

    // Mock profile check to return false (no profile data)
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);

    // Mock session data
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the navigation to occur
    await waitFor(() => {
      expectNavigation('/(onboard)/role');
    });

    // Verify that the onboarding step was set correctly
    await waitFor(() => {
      expect(authUtils.checkRoleStatus).toHaveBeenCalledWith('test-user-id');
      // expectAuthStatus('role', 'test-user-id');
    });

    unmount();
  });

  it('redirects to assessment setup when user HAS profile & role, but no assessment data', async () => {
    // Mock successful login
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        },
        session: {
          access_token: 'test-token'
        }
      }),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });

    // Mock profile and role to return true
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(true);


    // Mock session data
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the navigation to occur
    await waitFor(() => {
      expectNavigation('/(onboard)/assessment');
    });

    // Verify that the onboarding step was set correctly
    await waitFor(() => {
      expect(authUtils.checkAssessmentStatus).toHaveBeenCalledWith('test-user-id');
      // expectAuthStatus('role', 'test-user-id');
    });

    unmount();
  });

  it('handles successful login', async () => {
    // Mock successful login
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        },
        session: {
          access_token: 'test-token'
        }
      }),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });

    // Mock profile and role to return true
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkAssessmentStatus as jest.Mock).mockResolvedValue(true);


    // Mock session data
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null,
    });

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for the navigation to occur
    await waitFor(() => {
      expectNavigation('/(app)/home');
    });


    unmount();
  });

  it('handles login error', async () => {
    // Override for error case
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockRejectedValue(new Error('Login failed')),
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error('Login failed')
    })
  });

  test("should_redirect_unauthenticated_user_to_auth_screen", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expectNavigation("/(public)/auth");
    });

    unmount();
  });

  test("should_navigate_user_to_correct_onboarding_step", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "user2" } } },
      error: null,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(false);

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(`/(onboard)/role`);
    });

    unmount();
  });

  test("should_maintain_consistent_state_on_sign_out_error", async () => {
    // 1. Setup mocks for a successful initial authentication
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: "test_user" } } },
      error: null,
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(true);
    (authUtils.checkAssessmentStatus as jest.Mock).mockResolvedValue(true);
  
    // 2. Create a mock mutateAsync function that will throw an error
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error("sign out failed"));
    
    // 3. Override the useMutation mock for this specific test
    (useMutation as jest.Mock).mockImplementation((options) => ({
      mutate: jest.fn(),
      mutateAsync: mockMutateAsync,
      isLoading: false,
      isError: false,
      isSuccess: false,
      error: null
    }));
    
    // 4. Setup the sign out error from supabase
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ 
      error: { message: "sign out failed" } 
    });
  
    // 5. Get access to context through your TestComponent
    let contextValue: any;
    const TestComponentWithContext = () => {
      contextValue = useAuth();
      return <TestComponent />;
    };
  
    // 6. Render the component
    const { unmount } = render(
      <AuthProvider>
        <TestComponentWithContext />
      </AuthProvider>
    );
  
    // 7. Wait for initial auth state to be ready (authenticated)
    await waitFor(() => {
      expect(contextValue.authState.session).not.toBeNull();
      expect(contextValue.authState.isAuthenticated).toBe(true);
    });
  
    // 8. Trigger the sign out function that will fail
    await act(async () => {
      try {
        await contextValue.signOutMutation.mutateAsync();
      } catch (error) {
        // We expect an error, so just continue
      }
    });
  
    // Verify the mutation was called
    expect(mockMutateAsync).toHaveBeenCalled();
  
    // 9. Verify sign out error handling behavior
    await waitFor(() => {
      // Should navigate to auth screen
      expectNavigation('/(public)/auth');
      
      // Auth state should be reset regardless of the error
      expect(contextValue.authState.session).toBeNull();
      expect(contextValue.authState.user).toBeNull();
      expect(contextValue.authState.isAuthenticated).toBe(false);
      expect(contextValue.authState.isLoading).toBe(false);
    });
  
    unmount();
  })
})