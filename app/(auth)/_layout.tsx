/**
 * Layout for (auth) directory
 */
import { useAuth } from '@/context/auth/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { authState:{session, isLoading: loading, onboardingStep} } = useAuth();


  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // If no session or incomplete onboarding, redirect
  if (!session) {
    return <Redirect href="/(public)/auth" />;
  }
  
  // If in onboarding, redirect to appropriate step
  if (onboardingStep && onboardingStep !== 'completed') {
    //@ts-ignore
    return <Redirect href={`/(onboarding)/${onboardingStep}`} />;
  }

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade',
    }} />
  );
}