// In AuthContext.tsx
import { supabase } from "@/lib/supabase/supabase";
import { AuthContextType, AuthState } from "@/types/auth";
import { prettyJSON } from "@/utils/strings/function";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
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
        loading: false,
        isAuthenticated: false,
      }));
    }
  };

  const handleSessionChange = async (session: Session | null) => {
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign Out Error:', error);
    }

    setAuthState({
      user: null,
      session: null,
      loading: false,
      isAuthenticated: false,
    });
    
    // Only navigate after signing out if initialization is complete
    if (isInitialized) {
      router.replace("/(public)/auth");
    }
  };

  // Handle navigation effects separately from auth state
  useEffect(() => {
    // Only navigate once auth state is determined AND component is mounted
    if (!authState.loading && isInitialized) {
      if (authState.isAuthenticated) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(public)/auth");
      }
    }
  }, [authState.isAuthenticated, authState.loading, isInitialized]);

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
          // DON'T navigate here
        } else {
          // No active session
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            isAuthenticated: false,
          }));
          // DON'T navigate here
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
          loading: false,
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
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}