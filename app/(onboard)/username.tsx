/**
 * Username Screen for VENT App
 *
 * Allows users to set their username during onboarding.
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
import { useToast } from "@/components/ui/toast";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";

export default function UsernameScreen() {
  const [username, setUsername] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    authState: { user, isDebugMode },
    setOnboardingStep,
    saveDebugData,
  } = useAuth();
  const queryClient = useQueryClient();

  const showToast = useShowToast()

  // Validate username (must be non-empty after trimming)
  useEffect(() => {
    setIsFormValid(username.trim().length > 0);
  }, [username]);

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
   * Validates username, saves to storage, upserts to Supabase (or debug storage), and navigates to the next step.
   */
  const handleContinue = async (): Promise<void> => {
    if (!isFormValid) return;

    try {
      const trimmedUsername = username.trim();
      
      // In debug mode, save to debug storage instead of Supabase
      if (isDebugMode) {
        await saveDebugData({ username: trimmedUsername });
        console.log("Debug: Username saved:", trimmedUsername);
        setOnboardingStep(OnboardingStep.PROFILE);
        return;
      }

      // Normal mode: upsert to Supabase
      if (!user) {
        showToast(TOAST.ERROR, "User not authenticated!");
        return;
      }

      // Upsert username to Supabase
      const result = await upsertProfile({
        userId: user.id,
        username: trimmedUsername,
        email: user.email
      });

      if (!result.success) {
        console.error("Error upserting username to profile:", result.error);
        showToast(TOAST.ERROR, "Error updating profile data!")
        return
      } else if (result.data) {
        // Update the profile in the query cache so it's immediately available
        queryClient.setQueryData(["profile", user.id], result.data);
        // Also invalidate to ensure a refetch happens and authState is updated
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }

      console.log("Username set:", trimmedUsername);
      setOnboardingStep(OnboardingStep.PROFILE);
    } catch (error) {
      console.error("Error saving username data:", error);
      showToast(TOAST.ERROR, "Error saving username data!");
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
              Choose your{" "}
              <Text className="text-indigo-500 underline">username</Text>
            </Text>
            <Text className="text-base text-gray-500 leading-6">
              Pick a unique username that represents you
            </Text>
          </View>

          {/* Username Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2.5">
              Username
            </Text>
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 h-14">
              <Ionicons
                name="at-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
              />
            </View>
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
