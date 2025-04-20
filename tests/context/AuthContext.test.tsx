import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase/supabase";
import * as authUtils from "@/utils/auth/function";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      expect(router.replace).toHaveBeenCalledWith('/(onboard)/profile');
    });

    // Verify that the onboarding step was set correctly
    await waitFor(() => {
      expect(authUtils.checkProfileStatus).toHaveBeenCalledWith('test-user-id');
    });

    unmount();
  });

  it('handles successful login', () => {
    // Override the default mock for this specific test
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isLoading: false,
      isError: false,
      isSuccess: true,
      error: null
    });

    // Your test code here
  });

  it('handles login error', () => {
    // Override for error case
    (useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn().mockRejectedValue(new Error('Login failed')),
      isLoading: false,
      isError: true,
      isSuccess: false,
      error: new Error('Login failed')
    });
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
      expect(router.replace).toHaveBeenCalledWith("/(public)/auth");
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
});

// describe("AuthProvider", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     (useQueryClient as jest.Mock).mockReturnValue({
//       invalidateQueries: mockInvalidateQueries,
//       clear: mockClear,
//     });
//     (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
//       data: { subscription: { unsubscribe: jest.fn() } },
//     });
//   });

//   test("should_navigate_authenticated_user_to_home_after_onboarding", async () => {
//     (supabase.auth.getSession as jest.Mock).mockResolvedValue({
//       data: { session: { user: { id: "user1" } } },
//       error: null,
//     });
//     (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
//     (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
//     (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(true);
//     (authUtils.checkAssessmentStatus as jest.Mock).mockResolvedValue(true);

//     const { unmount } = render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith("/(app)/home");
//     });

//     unmount();
//   });

//   test("should_redirect_unauthenticated_user_to_auth_screen", async () => {
//     (supabase.auth.getSession as jest.Mock).mockResolvedValue({
//       data: { session: null },
//       error: null,
//     });

//     const { unmount } = render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith("/(public)/auth");
//     });

//     unmount();
//   });

//   test("should_navigate_user_to_correct_onboarding_step", async () => {
//     (supabase.auth.getSession as jest.Mock).mockResolvedValue({
//       data: { session: { user: { id: "user2" } } },
//       error: null,
//     });
//     (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
//     (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
//     (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(false);

//     const { unmount } = render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith(`/(onboard)/role`);
//     });

//     unmount();
//   });

//   test("should_handle_network_error_with_retries_on_session_initialization", async () => {
//     const networkError = { message: "network error" };
//     const getSessionMock = supabase.auth.getSession as jest.Mock;
//     getSessionMock
//       .mockResolvedValueOnce({ data: { session: null }, error: networkError })
//       .mockResolvedValueOnce({ data: { session: null }, error: networkError })
//       .mockResolvedValueOnce({ data: { session: null }, error: networkError });

//     jest.useFakeTimers();
//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await act(async () => {
//       jest.runAllTimers();
//     });

//     await waitFor(() => {
//       expect(getSessionMock).toHaveBeenCalledTimes(3);
//       expect(router.replace).toHaveBeenCalledWith("/(public)/auth");
//     });

//     jest.useRealTimers();
//   });

//   test("should_default_to_profile_step_on_invalid_onboarding_storage", async () => {
//     (supabase.auth.getSession as jest.Mock).mockResolvedValue({
//       data: { session: { user: { id: "user3" } } },
//       error: null,
//     });
//     (AsyncStorage.getItem as jest.Mock).mockResolvedValue("INVALID_STEP");
//     (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(false);

//     render(
//       <AuthProvider>
//         <TestComponent />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith(`/(onboard)/profile`);
//     });
//   });

//   test("should_maintain_consistent_state_on_sign_out_error", async () => {
//     (supabase.auth.getSession as jest.Mock).mockResolvedValue({
//       data: { session: { user: { id: "user4" } } },
//       error: null,
//     });
//     (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
//     (authUtils.checkProfileStatus as jest.Mock).mockResolvedValue(true);
//     (authUtils.checkRoleStatus as jest.Mock).mockResolvedValue(true);
//     (authUtils.checkAssessmentStatus as jest.Mock).mockResolvedValue(true);

//     (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: { message: "sign out failed" } });

//     let contextValue: any;
//     function Consumer() {
//       contextValue = useAuth();
//       return null;
//     }

//     render(
//       <AuthProvider>
//         <Consumer />
//       </AuthProvider>
//     );

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith("/(app)/home");
//     });

//     await act(async () => {
//       try {
//         await contextValue.signOutMutation.mutateAsync();
//       } catch {}
//     });

//     await waitFor(() => {
//       expect(router.replace).toHaveBeenCalledWith("/(public)/auth");
//       expect(mockClear).toHaveBeenCalled();
//       expect(contextValue.authState.session).toBeNull();
//       expect(contextValue.authState.isAuthenticated).toBe(false);
//     });
//   });
// })