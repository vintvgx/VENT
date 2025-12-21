/**
 * AuthContext.tsx
 * Handles authentication state and provides auth-related functions.
 */

import { supabase } from "@/lib/supabase/supabase";
import { AuthContextType, AuthState, OnboardingStep, DebugOnboardingData } from "@/types/authModel";
import { ProfileModel } from "@/types/user/user";
import {
  checkAssessmentStatus,
  checkProfileStatus,
  checkRoleStatus,
  checkUsernameStatus,
} from "@/utils/auth/function";
import { logDebug } from "@/utils/strings/function";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    onboardingStep: OnboardingStep.NONE,
    isDebugMode: false,
  });

  // state to track initial navigation
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track if we're currently in onboarding route to avoid navigation conflicts
  const isInOnboardingRouteRef = useRef(false);

  // Debug mode storage keys
  const DEBUG_MODE_KEY = "debug_mode_enabled";
  const DEBUG_DATA_KEY = "debug_onboarding_data";

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
    });

    // Start the initialization process
    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  /**
   * Fetches the user's profile from the profiles table
   * @param userId - The user's ID
   * @returns The profile data or null if not found
   */
  const fetchUserProfile = async (userId: string | undefined): Promise<ProfileModel | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist yet, that's okay (user is still onboarding)
        if (error.code === "PGRST116") {
          logDebug("Profile not found for user:", userId);
          return null;
        }
        console.error("Error fetching user profile:", error);
        return null;
      }

      logDebug("Profile data fetched successfully");
      return data as ProfileModel;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  /**
   * Handles session state changes in the authentication flow.
   *
   * This function updates the authentication state based on the current session.
   * It follows a two-step approach to prevent premature navigation:
   * 1. First updates user and session data while keeping the loading state active
   * 2. Fetches the user's profile data
   * 3. Determines the appropriate onboarding step for the user
   * 4. Finally completes the state update by setting isLoading to false
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

      // Fetch user profile
      let profile: ProfileModel | null = null;
      if (session.user?.id) {
        profile = await fetchUserProfile(session.user.id);
        
        // Update state with profile
        setAuthState((prev) => ({
          ...prev,
          profile,
        }));

        // Set the profile in the query cache so components using useProfile can access it
        if (profile) {
          queryClient.setQueryData(["profile", session.user.id], profile);
        }

        // This will trigger a refetch of the profile query for components using useProfile
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
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });
      // Clear all queries from the cache on signout
      queryClient.clear();
    }
  };

  // Sync profile from query cache to authState when it's updated via mutations
  useEffect(() => {
    if (!authState.user?.id) return;

    // Subscribe to query cache updates for the profile
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.type === "updated" &&
        Array.isArray(event.query.queryKey) &&
        event.query.queryKey[0] === "profile" &&
        event.query.queryKey[1] === authState.user?.id
      ) {
        const profileData = event.query.state.data as ProfileModel | undefined;
        if (profileData) {
          setAuthState((prev) => {
            // Only update if the profile data has actually changed
            if (prev.profile?.updated_at !== profileData.updated_at) {
              return {
                ...prev,
                profile: profileData,
              };
            }
            return prev;
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [authState.user?.id, queryClient]);

  // Handle navigation based on auth and onboarding state
  useEffect(() => {
    console.log("Handling navigation based on auth and onboarding state");

    if (isInitialized) {
      // Debug mode: handle navigation separately
      if (authState.isDebugMode) {
        // In debug mode, check onboarding step
        if (
          authState.onboardingStep &&
          authState.onboardingStep !== OnboardingStep.COMPLETED
        ) {
          // Only navigate to onboarding if we're not already there
          if (!isInOnboardingRouteRef.current) {
            console.log("Debug mode: navigating to onboarding step:", authState.onboardingStep);
            isInOnboardingRouteRef.current = true;
            //@ts-ignore - Expo Router dynamic route
            router.replace(`/(onboard)/${authState.onboardingStep}`);
          } else {
            console.log("Debug mode: Already in onboarding route, letting layout handle step navigation");
          }
          return;
        } else if (
          !authState.onboardingStep ||
          authState.onboardingStep === OnboardingStep.COMPLETED
        ) {
          // Debug mode and onboarding complete, go to home
          console.log("Debug mode: onboarding complete, navigating to home");
          router.replace("/(app)/home");
          return;
        }
      }

      // Not authenticated (and not in debug mode)
      if (!authState.session && !authState.isDebugMode) {
        console.log("User not authenticated, navigating to auth screen");
        router.replace("/(public)/welcome");
        return;
      }

      // Authenticated but in onboarding - only navigate if not already in onboarding route
      // The layout will handle redirecting to the correct step using Redirect component
      if (
        authState.onboardingStep &&
        authState.onboardingStep !== OnboardingStep.COMPLETED
      ) {
        // Only navigate to onboarding if we're not already there
        // Once in onboarding, the layout's Redirect component will handle step changes
        if (!isInOnboardingRouteRef.current) {
          console.log("User in onboarding, navigating to onboarding step:", authState.onboardingStep);
          isInOnboardingRouteRef.current = true;
          //@ts-ignore - Expo Router dynamic route
          router.replace(`/(onboard)/${authState.onboardingStep}`);
        } else {
          console.log("Already in onboarding route, letting layout handle step navigation");
        }
        return;
      } else {
        // Reset the ref when not in onboarding
        isInOnboardingRouteRef.current = false;
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
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });

      // Only navigate after signing out if initialization is complete
      if (isInitialized) {
        router.replace("/(public)/welcome");
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
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      });

      if (isInitialized) {
        router.replace("/(public)/welcome");
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
        profile: null,
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

        // Check if user has set their username
        // Navigate to [OnboardingStep.USERNAME] as initial screen in onboard workflow
        const hasUsername = await checkUsernameStatus(userId);
        if (!hasUsername) {
          logDebug("Username REQUIRED");
          setAuthState((prev) => ({
            ...prev,
            onboardingStep: OnboardingStep.USERNAME,
          }));
          return;
        }
        
        // Check if user has completed setting up their profile
        const hasProfile = await checkProfileStatus(userId);
        if (!hasProfile) {
          logDebug("Profile REQUIRED");
          setAuthState((prev) => ({
            ...prev,
            onboardingStep: OnboardingStep.PROFILE,
          }));
          return;
        }

        // Check if user has selected a role
        const hasSelectedRole = await checkRoleStatus(userId);
        if (!hasSelectedRole) {
          logDebug("Role REQUIRED");
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

  // Debug mode functions
  const enableDebugMode = async () => {
    try {
      await AsyncStorage.setItem(DEBUG_MODE_KEY, "true");
      setAuthState((prev) => ({
        ...prev,
        isDebugMode: true,
        isAuthenticated: true,
        onboardingStep: OnboardingStep.USERNAME,
      }));
      // Navigate to onboarding
      router.replace("/(onboard)/username");
    } catch (error) {
      console.error("Error enabling debug mode:", error);
    }
  };

  const disableDebugMode = async () => {
    try {
      await AsyncStorage.removeItem(DEBUG_MODE_KEY);
      await AsyncStorage.removeItem(DEBUG_DATA_KEY);
      setAuthState((prev) => ({
        ...prev,
        isDebugMode: false,
        isAuthenticated: false,
        onboardingStep: OnboardingStep.NONE,
      }));
    } catch (error) {
      console.error("Error disabling debug mode:", error);
    }
  };

  const clearDebugData = async () => {
    try {
      await AsyncStorage.removeItem(DEBUG_DATA_KEY);
      await AsyncStorage.removeItem("onboardingStep");
      setAuthState((prev) => ({
        ...prev,
        isDebugMode: false,
        onboardingStep: OnboardingStep.USERNAME,
      }));
      router.replace("/(public)/welcome");
    } catch (error) {
      console.error("Error clearing debug data:", error);
    }
  };

  const getDebugData = async (): Promise<DebugOnboardingData | null> => {
    try {
      const data = await AsyncStorage.getItem(DEBUG_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting debug data:", error);
      return null;
    }
  };

  const saveDebugData = async (data: Partial<DebugOnboardingData>) => {
    try {
      const existing = await getDebugData();
      const updated = { ...existing, ...data };
      await AsyncStorage.setItem(DEBUG_DATA_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving debug data:", error);
    }
  };

  // Check debug mode on mount and restore state
  useEffect(() => {
    const checkDebugMode = async () => {
      try {
        const isDebug = await AsyncStorage.getItem(DEBUG_MODE_KEY);
        if (isDebug === "true") {
          // Restore debug mode state
          const savedStep = await AsyncStorage.getItem("onboardingStep");
          const onboardingStep = (savedStep as OnboardingStep) || OnboardingStep.USERNAME;
          
          setAuthState((prev) => ({
            ...prev,
            isDebugMode: true,
            isAuthenticated: true,
            isLoading: false,
            onboardingStep: onboardingStep,
          }));
          
          // Mark as initialized so navigation can proceed
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error checking debug mode:", error);
      }
    };
    checkDebugMode();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signOutMutation,
        refreshSession,
        setOnboardingStep,
        isDebugMode: authState.isDebugMode || false,
        enableDebugMode,
        disableDebugMode,
        clearDebugData,
        getDebugData,
        saveDebugData,
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
