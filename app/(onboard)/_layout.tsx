"use client"

import { Redirect, Stack, useRouter } from "expo-router"
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native"
import { ThemedView } from "@/components/ThemedView"
import { ThemedText } from "@/components/ThemedText"
import { useAuth } from "@/context/auth/AuthContext"
import { OnboardingStep } from "@/types/auth"
import { LogOut } from "lucide-react-native"
import { useEffect, useRef } from "react"

const { width } = Dimensions.get("window")

export default function OnboardingLayout() {
  const { authState, signOut } = useAuth()
  const router = useRouter()
  const progressAnimation = useRef(new Animated.Value(0)).current

  // Animate progress bar when step changes
  useEffect(() => {
    if (!authState.isLoading && authState.onboardingStep) {
      let stepValue = 0

      switch (authState.onboardingStep) {
        case OnboardingStep.PROFILE:
          stepValue = 1
          break
        case OnboardingStep.ROLE:
          stepValue = 2
          break
        case OnboardingStep.ASSESSMENT:
          stepValue = 3
          break
      }

      Animated.timing(progressAnimation, {
        toValue: stepValue / 3, // 3 total steps
        duration: 600,
        useNativeDriver: false,
      }).start()
    }
  }, [authState.onboardingStep, authState.isLoading])

  // Show loading indicator while checking auth state
  if (authState.isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading your profile...</ThemedText>
        </View>
      </ThemedView>
    )
  }

  // If no session, redirect to auth
  if (!authState.session) {
    return <Redirect href="/(public)/auth" />
  }

  // If onboarding is completed, redirect to home
  if (!authState.onboardingStep || authState.onboardingStep === OnboardingStep.COMPLETED) {
    return <Redirect href="/(app)/home" />
  }

  // Create progress tracker based on current step
  const totalSteps = 3 // Role, Profile and Assessment
  const currentStep = (() => {
    switch (authState.onboardingStep) {
      case OnboardingStep.PROFILE:
        return 1
      case OnboardingStep.ROLE:
        return 2
      case OnboardingStep.ASSESSMENT:
        return 3
      default:
        return 1
    }
  })()

  // Get step title
  const getStepTitle = () => {
    switch (authState.onboardingStep) {
      case OnboardingStep.PROFILE:
        return "Profile Setup"
      case OnboardingStep.ROLE:
        return "Role Selection"
      case OnboardingStep.ASSESSMENT:
        return "Assessment"
      default:
        return "Onboarding"
    }
  }

  const handleSignOut = () => {
    // Add confirmation if needed
    signOut()
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ThemedView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.stepTitle}>{getStepTitle()}</ThemedText>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
              <LogOut size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <ThemedText style={styles.progressText}>
              Step {currentStep} of {totalSteps}
            </ThemedText>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: styles.stackContent,
          }}
        />
      </ThemedView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingCard: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  progressContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  stackContent: {
    backgroundColor: "#F8F9FA",
  },
})
