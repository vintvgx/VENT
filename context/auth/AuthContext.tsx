import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, AuthState } from '@/types/auth';
import * as SecureStore from 'expo-secure-store';


// Auth context with default values
const AuthContext = createContext<AuthContextType>({
  authState: {
    user: null,
    session: null,
    loading: true,
    needsMobileVerification: false,
    isAuthenticated: false,
  },
  signOut: async () => {},
  refreshSession: async () => {},
  setNeedsMobileVerification: () => {},
});


/**
 * AuthProvider is a React context provider component that manages authentication state
 * It initializes and maintains the authentication state for the entire application,
 * including user session, loading status, and mobile verification requirements
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize authentication state with default state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null, 
    loading: true,
    needsMobileVerification: false,
    isAuthenticated: false,
  });

  // Set mobile verification requirement
  const setNeedsMobileVerification = (value: boolean) => {
    setAuthState(prev => ({ ...prev, needsMobileVerification: value }));
    // Store this state for app refreshes
    // AsyncStorage.setItem('needsMobileVerification', value ? 'true' : 'false');
    SecureStore.setItem('needsMobileVerification', value ? 'true' : 'false')
  };

  // Refresh the session data
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error refreshing session:', error);
      return;
    }
    
    if (data?.session) {
      await handleSessionChange(data.session);
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        user: null, 
        session: null, 
        loading: false,
        isAuthenticated: false 
      }));
    }
  };

  // Handle session changes
  const handleSessionChange = async (session: Session | null) => {
    if (session) {
      // Check if mobile verification is needed from storage
      const needsVerification = await AsyncStorage.getItem('needsMobileVerification');
      
      setAuthState({
        user: session.user,
        session,
        loading: false,
        needsMobileVerification: needsVerification === 'true',
        isAuthenticated: true,
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        needsMobileVerification: false,
        isAuthenticated: false,
      });
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('needsMobileVerification');
    setAuthState({
      user: null,
      session: null,
      loading: false,
      needsMobileVerification: false,
      isAuthenticated: false,
    });
    router.replace('/(public)/auth');
  };

  // Subscribe to auth changes on mount
  useEffect(() => {
    // Get initial session
    refreshSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      await handleSessionChange(session);
      
      // Handle navigation based on auth state
      if (event === 'SIGNED_IN') {
        // For social logins, we need 2FA with mobile
        const authProvider = session?.user?.app_metadata?.provider;
        if (authProvider === 'google' || authProvider === 'apple') {
          setNeedsMobileVerification(true);
          router.replace('/(auth)/verify-mobile');
        } else if (authProvider === 'phone') {
          setNeedsMobileVerification(false);
          router.replace('/(app)/home');
        }
      } else if (event === 'SIGNED_OUT') {
        router.replace('/(public)/auth');
      }
    });

    // Cleanup on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        signOut,
        refreshSession,
        setNeedsMobileVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext);
}