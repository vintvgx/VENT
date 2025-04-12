// In AuthContext.tsx
import { supabase } from "@/lib/supabase/supabase";
import { AuthContextType, AuthState, OnboardingStep } from "@/types/auth";
import {
  checkAssessmentStatus,
  checkProfileStatus,
  checkRoleStatus,
} from "@/utils/auth/function";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

// Auth context with default values
const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    onboardingStep: OnboardingStep.NONE,
  },
  signOut: async () => {},
  refreshSession: async () => {},
  setOnboardingStep: async (state: OnboardingStep) => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    onboardingStep: OnboardingStep.NONE,
  });

  // Add a state to track initial navigation
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error refreshing session:", error);
      return;
    }

    if (data?.session) {
      await handleSessionChange(data.session);
    } else {
      setAuthState((prev) => ({
        ...prev,
        user: null,
        session: null,
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
      // First check stored step in AsyncStorage
      const storedStep = await AsyncStorage.getItem("onboardingStep");

      console.log("🚀 ~ determineOnboardingStep ~ storedStep:", storedStep);

      if (storedStep) {
        setAuthState((prev) => ({
          ...prev,
          onboardingStep: storedStep as OnboardingStep,
        }));
        return;
      }

      // If no stored step, check user's progress
      // Check if user has selected a role
      const hasProfile = await checkProfileStatus(userId);
      if (!hasProfile) {
        setAuthState((prev) => ({
          ...prev,
          onboardingStep: OnboardingStep.PROFILE,
        }));
        return;
      }

      const hasSelectedRole = await checkRoleStatus(userId);
      if (!hasSelectedRole) {
        setOnboardingStep(OnboardingStep.ROLE);
        return;
      }

      const hasCompletedAssessment = await checkAssessmentStatus(userId);
      if (!hasCompletedAssessment) {
        setAuthState((prev) => ({
          ...prev,
          onboardingStep: OnboardingStep.ASSESSMENT,
        }));
        return;
      }

      // User has completed all steps
      setAuthState((prev) => ({
        ...prev,
        onboardingStep: OnboardingStep.COMPLETED,
      }));
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
    if (session) {
      setAuthState((prev) => ({
        ...prev,
        user: session.user,
        session,
        isAuthenticated: true,
        isLoading: true,
        // Keep isLoading true until we check onboarding
      }));

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
        user: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });
    }
  };

  /*
   * Signs out the active authenticated user.
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign Out Error:", error);
    }

    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });

    // Only navigate after signing out if initialization is complete
    if (isInitialized) {
      router.replace("/(public)/auth");
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
        console.error("Error saving onboarding step to AsyncStorage:", error);
        // State is already updated in memory, so we can continue even if storage fails
      }
    }
  };

  // Handle navigation based on auth and onboarding state
  useEffect(() => {
    console.log("Handling navigation based on auth and onboarding state");
    if (authState.isLoading) return;

    if (isInitialized) {
      // Not authenticated
      if (!authState.session) {
        router.replace("/(public)/auth");
        return;
      }

      // Authenticated but in onboarding
      if (
        authState.onboardingStep &&
        authState.onboardingStep !== OnboardingStep.COMPLETED
      ) {
        console.warn(
          `Onboard process not complete! Navigating to ${authState.onboardingStep}`
        );
        console.log("Current onboarding step:", authState.onboardingStep);
        console.log(
          "Navigation path:",
          `/(onboard)/${authState.onboardingStep}`
        );
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
        router.replace("/(app)/home");
      }
    }
  }, [authState, isInitialized]);

  // Subscribe to auth changes on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
          return;
        }

        if (currentSession) {
          // Set initial auth state with current session
          await handleSessionChange(currentSession);
        } else {
          // No active session
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
        }

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`Supabase auth event: ${event}`);
            await handleSessionChange(session);

            // Navigation will happen in the useEffect above
          }
        );

        // Mark initialization as complete, which will trigger navigation
        setIsInitialized(true);

        // Cleanup subscription on unmount
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Fatal error during auth initialization:", error);
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        setIsInitialized(true); // Still mark as initialized so navigation can happen
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signOut,
        refreshSession,
        setOnboardingStep,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
