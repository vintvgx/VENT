/**
 * AuthContext.tsx
 * Handles authentication state and provides auth-related functions.
 */

import { supabase } from "@/lib/supabase/supabase";
import { AuthContextType, AuthState, OnboardingStep } from "@/types/authModel";
import {
  checkAssessmentStatus,
  checkProfileStatus,
  checkRoleStatus,
} from "@/utils/auth/function";
import { logDebug } from "@/utils/strings/function";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    onboardingStep: OnboardingStep.NONE,
  });

  // state to track initial navigation
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session data and set up auth listeners
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing auth");
      try {
        // Add retry logic for network errors
        let retries = 3;
        let success = false;
        let sessionData = null;

        while (retries > 0 && !success) {
          // Get current session
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            if (error.message?.includes("network") && retries > 1) {
              console.log(
                `Network error, retrying... (${retries - 1} attempts left)`
              );
              retries--;
              await new Promise((resolve) => setTimeout(resolve, 1000));
              continue;
            }
            console.error("Error getting initial session:", error);
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              isAuthenticated: false,
            }));
            return;
          }

          success = true;
          sessionData = session;
        }

        // Successfully retrieved session or exhausted retries
        if (sessionData) {
          // Process the session and update state
          await handleSessionChange(sessionData);
        } else {
          // No active session
          console.log("No active session");
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
        }

        // Mark initialization as complete after auth is processed
        setIsInitialized(true);
      } catch (error) {
        console.error("Fatal error during auth initialization:", error);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        setIsInitialized(true);
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      await handleSessionChange(session);

      // Invalidate queries that depend on authentication state
      queryClient.invalidateQueries({
        queryKey: ["profile", session?.user.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["assessments", session?.user.id],
      });
    });

    // Start the initialization process
    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  /**
   * Handles session state changes in the authentication flow.
   *
   * This function updates the authentication state based on the current session.
   * It follows a two-step approach to prevent premature navigation:
   * 1. First updates user and session data while keeping the loading state active
   * 2. Determines the appropriate onboarding step for the user
   * 3. Finally completes the state update by setting isLoading to false
   *
   * This approach ensures the application won't navigate to the home screen
   * before the onboarding status has been properly determined.
   *
   * @param session - The current Supabase session or null if no active session
   */
  const handleSessionChange = async (session: Session | null) => {
    logDebug("Handling session change");
    if (session) {
      setAuthState((prev) => ({
        ...prev,
        user: session.user,
        session,
        isAuthenticated: true,
        // Keep isLoading true until we check onboarding
        isLoading: true,
      }));

      // Fetch user profile & assessments
      if (session.user?.id) {
        // This will trigger a refetch of the profile query
        queryClient.invalidateQueries({
          queryKey: ["profile", session.user.id],
        });

        // Similarly for assessments if you have a query for that
        queryClient.invalidateQueries({
          queryKey: ["assessments", session.user.id],
        });
      }

      //Update the state with the final loading state
      // The onboardingStep is already set by determineOnboardingStep
      await determineOnboardingStep(session.user.id);

      // Update the state
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } else {
      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });
      // Clear all queries from the cache on signout
      queryClient.clear();
    }
  };

  // Handle navigation based on auth and onboarding state
  useEffect(() => {
    console.log("Handling navigation based on auth and onboarding state");
    if (authState.isLoading) return;

    if (isInitialized) {
      // Not authenticated
      if (!authState.session) {
        console.log("User not authenticated, navigating to auth screen");
        router.replace("/(public)/auth");
        return;
      }

      // Authenticated but in onboarding
      if (
        authState.onboardingStep &&
        authState.onboardingStep !== OnboardingStep.COMPLETED
      ) {
        console.log("User in onboarding, navigating to onboarding step");
        //@ts-ignore
        router.replace(`/(onboard)/${authState.onboardingStep}`);
        return;
      }

      // Fully authenticated and onboarded
      if (
        authState.isAuthenticated &&
        authState.session &&
        (!authState.onboardingStep ||
          authState.onboardingStep === OnboardingStep.COMPLETED)
      ) {
        console.log("User authenticated and onboarded, navigating to home");
        router.replace("/(app)/home");
      }
    }
  }, [authState, isInitialized]);

  /**
   * Mutation for signing out the user
   * @returns void
   */
  const signOutMutation = useMutation({
    mutationFn: async () => {
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });

      // Only navigate after signing out if initialization is complete
      if (isInitialized) {
        router.replace("/(public)/auth");
      }

      // Clear all queries from the cache on signout
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Error signing out:", error);
      // reset the auth state to maintain consistent state
      setAuthState({
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });

      if (isInitialized) {
        router.replace("/(public)/auth");
      }
    },
  });

  /**
   * Refreshes the session
   * @returns void
   */
  const refreshSession = async () => {
    console.log("Refreshing session");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error refreshing session:", error);
      return;
    }

    if (data?.session) {
      console.log("Refreshing session", data.session);
      await handleSessionChange(data.session);
    } else {
      console.log("No session data");
      setAuthState((prev) => ({
        ...prev,
        session: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  /**
   *  Determine the current onboarding step based on user's data.
   * 1. Check if storage for onBoardingStep state
   * If no value:
   * 2. Check required fields for profile, return [OnboardingStep.PROFILE] if incomplete
   * 3. Check required fields for assessment,  return [OnboardingStep.ASSESSMENT] if incomplete
   * else return [OnboardingStep.COMPLETE]
   *
   * @param userId the id of the authenticated user
   * @returns
   */
  const determineOnboardingStep = async (userId: string | undefined) => {
    try {
      logDebug("Determining onboarding step for user:", userId);

      // First check if user has completed the assessment (which would conclude the onboarding has been completed)
      const hasCompletedAssessment = await checkAssessmentStatus(userId);
      if (hasCompletedAssessment) {
        logDebug("User has completed the onboard process");
        setAuthState((prev) => ({
          ...prev,
          onboardingStep: OnboardingStep.COMPLETED,
        }));
        return;
      }

      if (!hasCompletedAssessment) {
        // Check user's progress

        // Check if user has completed setting up their profile
        const hasProfile = await checkProfileStatus(userId);
        if (!hasProfile) {
          logDebug("User has not set their profile");
          setAuthState((prev) => ({
            ...prev,
            onboardingStep: OnboardingStep.PROFILE,
          }));
          return;
        }

        // Check if user has selected a role
        const hasSelectedRole = await checkRoleStatus(userId);
        if (!hasSelectedRole) {
          logDebug("User has not set their role");
          setOnboardingStep(OnboardingStep.ROLE);
          return;
        }

        // User has completed all steps
        setAuthState((prev) => ({
          ...prev,
          onboardingStep: OnboardingStep.COMPLETED,
        }));
        await AsyncStorage.removeItem("onboardingStep");
      }
    } catch (error) {
      console.error("Error determining onboarding step:", error);
      // In case of error, set a default
      setAuthState((prev) => ({
        ...prev,
        onboardingStep: OnboardingStep.PROFILE, // Default to beginning of onboarding
      }));
    }
  };

  /**
   * Updates the onboarding step in both state and persistent storage.
   * This function validates the provided step against valid OnboardingStep enum values
   * before updating the application state and AsyncStorage.
   *
   * @param state - The new OnboardingStep value to set
   * @returns Promise<void>
   */
  const setOnboardingStep = async (state: OnboardingStep) => {
    if (Object.values(OnboardingStep).includes(state)) {
      setAuthState((prev) => ({
        ...prev,
        onboardingStep: state,
      }));

      try {
        await AsyncStorage.setItem("onboardingStep", state);
      } catch (error) {
        // State is already updated in memory, so we can continue even if storage fails
        console.error("Error saving onboarding step to AsyncStorage:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        signOutMutation,
        refreshSession,
        setOnboardingStep,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
