import { supabase } from "@/lib/supabase/supabase";
import { AuthContextType, AuthState } from "@/types/auth";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

// Auth context with default values
const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  },
  signOut: async () => {},
  refreshSession: async () => {},
});

/**
 * AuthProvider is a React context provider component that manages authentication state
 * It initializes and maintains the authentication state for the entire application,
 * including user session and loading status.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize authentication state with default state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  });

  // Refresh the session data
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
        loading: false,
        isAuthenticated: false,
      }));
    }
  };

  // Handle session changes
  const handleSessionChange = async (session: Session | null) => {
    // Sets user if session is active
    if (session) {
      setAuthState({
        user: session.user,
        session,
        loading: false,
        isAuthenticated: true,
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync("needsMobileVerification");
    setAuthState({
      user: null,
      session: null,
      loading: false,
      //   needsMobileVerification: false,
      isAuthenticated: false,
    });
    router.replace("/(public)/auth");
  };

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
            loading: false,
            isAuthenticated: false,
          }));
          return;
        }

        if (currentSession) {
          // Set initial auth state with current session
          await handleSessionChange(currentSession);
          router.replace("/(app)/home");
        } else {
          // No active session
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            isAuthenticated: false,
          }));
          router.replace("/(public)/auth");
        }

        // Set up auth state change listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log(`Supabase auth event: ${event}`);
            await handleSessionChange(session);

            // Handle navigation based on auth state
            if (event === "SIGNED_IN") {
              router.replace("/(app)/home");
            } else if (event === "SIGNED_OUT") {
              router.replace("/(public)/auth");
            }
          }
        );

        // Cleanup subscription on unmount
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Fatal error during auth initialization:", error);
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          isAuthenticated: false,
        }));
        router.replace("/(public)/auth");
      }
    };

    // Call to initialize auth
    // 1. checks current session to set auth state/user
    // 2. sets up auth state listener to handle auth state changes
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signOut,
        refreshSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}
