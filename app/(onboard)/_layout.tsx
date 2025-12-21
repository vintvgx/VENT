/**
 * Onboarding Layout for VENT App
 * Copy this to: app/(onboarding)/_layout.tsx
 *
 * Features horizontal icon-based step indicators
 */
import type React from "react";
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Stack, useSegments } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/authModel";

// Define step configuration with icons
const ONBOARDING_STEPS = [
  { key: OnboardingStep.USERNAME, icon: "at-outline" as const, label: "Username" },
  { key: OnboardingStep.PROFILE, icon: "person-outline" as const, label: "Profile" },
  { key: OnboardingStep.MOBILE, icon: "call-outline" as const, label: "Mobile" },
  { key: OnboardingStep.ROLE, icon: "people-outline" as const, label: "Role" },
  {
    key: OnboardingStep.ASSESSMENT,
    icon: "clipboard-outline" as const,
    label: "Assessment",
  },
];

interface StepIndicatorProps {
  steps: typeof ONBOARDING_STEPS;
  currentStepIndex: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStepIndex,
}) => {
  return (
    <View className="items-center">
      <View className="flex-row bg-gray-100 rounded-full p-1.5 gap-1">
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <View
              key={step.key}
              className={`w-10 h-10 rounded-full justify-center items-center ${
                isActive ? "bg-indigo-500" : "bg-transparent"
              } ${isCurrent ? "shadow-md shadow-indigo-500" : ""}`}>
              <Ionicons
                name={step.icon}
                size={20}
                color={isActive ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function OnboardingLayout() {
  // Uncomment and use your auth context
  const { authState, signOutMutation } = useAuth();
  const segments = useSegments();

  // Sets the authState current onboarding step
  const currentStep = authState.onboardingStep;

  console.log("Auth state current step : ", currentStep)

  // matches the index to display accurately 
  const currentStepIndex = ONBOARDING_STEPS.findIndex(
    (s) => s.key === currentStep
  );
  
  // Get the current route segment (e.g., ["(onboard)", "username"])
  const currentRoute = segments[segments.length - 1] || "";

  if (authState.isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-neutral-50">
        <View className="bg-white p-8 rounded-2xl items-center shadow-lg">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="mt-4 text-base font-medium text-gray-700">
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  // If onboarding is completed, redirect to home
  if (
    !authState.onboardingStep ||
    authState.onboardingStep === OnboardingStep.COMPLETED
  ) {
    return <Redirect href="/(app)/home" />;
  }

  // Redirect to the correct onboarding step if we're not already on it
  // This handles step changes within the onboarding flow
  if (currentStep && currentStep !== OnboardingStep.COMPLETED) {
    // Only redirect if we're not already on the correct route
    if (currentRoute !== currentStep) {
      return <Redirect key={currentStep} href={`/(onboard)/${currentStep}`} />;
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View
        className="pt-16 pb-5 px-5"
        style={{ paddingTop: Platform.OS === "ios" ? 60 : 40 }}>
        <StepIndicator
          steps={ONBOARDING_STEPS}
          currentStepIndex={currentStepIndex}
        />
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FAFAFA" },
          animation: "slide_from_right",
        }}
      />
    </KeyboardAvoidingView>
  );
}
