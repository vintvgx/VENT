import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth/AuthContext';

/**
 * Hook to protect routes based on authentication state
 * @param requireAuth - If true, user must be authenticated to access the route
 * @param requireMobileVerification - If true, user must have verified their mobile number
 */
export function useAuthGuard(
  requireAuth: boolean = false,
  requireMobileVerification: boolean = false
) {
  const { authState } = useAuth();
  const { isAuthenticated, needsMobileVerification, loading } = authState;

  useEffect(() => {
    // Don't redirect while auth state is still loading
    if (loading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.replace('/(public)/auth');
      return;
    }

    // If mobile verification is required but not completed
    if (
      requireAuth &&
      isAuthenticated &&
      requireMobileVerification &&
      needsMobileVerification
    ) {
      router.replace('/(auth)/verify-mobile');
      return;
    }

    // If user is authenticated but on auth page, redirect to home
    if (!requireAuth && isAuthenticated && !needsMobileVerification) {
      router.replace('/(app)/home');
      return;
    }
    
    // If user needs mobile verification but on wrong page
    if (!requireMobileVerification && isAuthenticated && needsMobileVerification) {
      router.replace('/(auth)/verify-mobile');
    }
  }, [isAuthenticated, needsMobileVerification, loading, requireAuth, requireMobileVerification]);

  return {
    isLoading: loading,
    isAuthenticated,
    needsMobileVerification,
  };
}