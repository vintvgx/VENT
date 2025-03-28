// components/AuthenticationGuard.tsx
import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { useAuth } from '@/context/auth/AuthContext';

export function AuthenticationGuard({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const segments = useSegments();
  
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inPublicGroup = segments[0] === '(public)';

    if (authState.loading) {
      // Still loading auth state, don't redirect yet
      return;
    }

    if (!authState.isAuthenticated) {
      // Not authenticated, redirect to auth page unless already there
      if (!inPublicGroup) {
        router.replace('/(public)/auth');
      }
    } else if (authState.needsMobileVerification) {
      // Authenticated but needs mobile verification
      if (!inAuthGroup) {
        router.replace('/(auth)/verify-mobile');
      }
    } else {
      // Fully authenticated
      if (!inAppGroup) {
        router.replace('/(app)/home');
      }
    }
  }, [authState.isAuthenticated, authState.needsMobileVerification, authState.loading, segments]);

  return <>{children}</>;
}