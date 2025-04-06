// app/(onboard)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/auth/AuthContext';
import { OnboardingStep } from '@/types/auth';
import { Button } from '@/components/ui/button';

export default function OnboardingLayout() {
  const { authState, signOut } = useAuth();
  
  // Show loading indicator while checking auth state
  if (authState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // If no session, redirect to auth
  if (!authState.session) {
    return <Redirect href="/(public)/auth" />;
  }
  
  // If onboarding is completed, redirect to home
  if (!authState.onboardingStep || authState.onboardingStep === OnboardingStep.COMPLETED) {
    return <Redirect href="/(app)/home" />;
  }
  
  // Create progress tracker based on current step
  const totalSteps = 2; // Profile and Assessment
  const currentStep = authState.onboardingStep === OnboardingStep.PROFILE ? 1 : 2;
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressContainer}>
        <ThemedText style={styles.progressText}>
          Step {currentStep} of {totalSteps}
        </ThemedText>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / totalSteps) * 100}%` }
            ]} 
          />
        </View>
      </View>
      <View>
        <Button onPress={signOut}>Sign Out</Button>
      </View>
      
      <Stack 
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerStyle: { 
            backgroundColor: 'transparent',
          },
          headerShadowVisible: false,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
});