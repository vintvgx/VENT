/**
 * Mobile Screen for VENT App
 *
 * Allows users to enter their mobile number during onboarding.
 */
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/authModel";
import {
  saveToStorage,
  retrieveFromStorage,
  ONBOARDING_STORAGE_KEYS,
} from "@/utils/data/functions";
import { upsertProfile } from "@/utils/auth/function";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";

export default function MobileScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    authState: { user, isDebugMode },
    setOnboardingStep,
    saveDebugData,
  } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const showToast = useShowToast();

  // Validate phone number (must be a valid phone number format)
  useEffect(() => {
    const trimmedPhone = phoneNumber.trim();
    if (trimmedPhone.length > 0) {
      // Use libphonenumber-js to validate phone number
      const isValid = isPossiblePhoneNumber(trimmedPhone);
      setIsFormValid(isValid);
    } else {
      setIsFormValid(false);
    }
  }, [phoneNumber]);

  // Monitor keyboard visibility for footer spacing
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /**
   * Handles continue button press.
   * Validates phone number, upserts to Supabase, and navigates to the next step.
   */
  const handleContinue = async (): Promise<void> => {
    if (!isFormValid) return;

    try {
      const trimmedPhoneNumber = phoneNumber.trim();

      // In debug mode, save to debug storage instead of Supabase
      if (isDebugMode) {
        await saveDebugData({ phoneNumber: trimmedPhoneNumber });
        console.log("Debug: Mobile number saved");
        setOnboardingStep(OnboardingStep.ROLE);
        return;
      }

      // Normal mode: upsert to Supabase
      if (!user) {
        showToast(TOAST.ERROR, "User not authenticated!");
        return;
      }

      const result = await upsertProfile({
        userId: user.id,
        username: profile?.username,
        phoneNumber: trimmedPhoneNumber,
      });

      if (!result.success) {
        console.error("Error upserting mobile number to profile:", result.error);
        showToast(TOAST.ERROR, "Error updating mobile number!");
        return;
      } else if (result.data) {
        // Update the profile in the query cache so it's immediately available
        queryClient.setQueryData(["profile", user.id], result.data);
        // Also invalidate to ensure a refetch happens and authState is updated
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }

      // Navigate to next step
      setOnboardingStep(OnboardingStep.ROLE);
    } catch (error) {
      console.error("Error saving mobile number data:", error);
      showToast(TOAST.ERROR, "Error saving mobile number!");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 p-6">
          {/* Question Section */}
          <View className="mb-9">
            <Text className="text-3xl font-bold text-gray-800 mb-2 leading-10">
              Enter your{" "}
              <Text className="text-indigo-500 underline">mobile number</Text>
            </Text>
            <Text className="text-base text-gray-500 leading-6">
              We'll use this to verify your account and keep it secure
            </Text>
          </View>

          {/* Phone Number Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2.5">
              Mobile Number
            </Text>
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 h-14">
              <Ionicons
                name="call-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="tel"
              />
            </View>
            {phoneNumber.trim().length > 0 && !isFormValid && (
              <Text className="text-sm text-red-500 mt-2">
                Please enter a valid phone number
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View className={`px-6 ${keyboardVisible ? "pb-5" : "pb-10"}`}>
          <TouchableOpacity
            className={`flex-row items-center justify-center h-14 rounded-3xl gap-2 ${
              isFormValid ? "bg-indigo-500" : "bg-indigo-300"
            }`}
            onPress={handleContinue}
            disabled={!isFormValid}
            activeOpacity={0.8}>
            <Text className="text-white text-lg font-semibold">Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

