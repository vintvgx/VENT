/**
 * Profile Screen for VENT App
 * Copy this to: app/(onboarding)/profile.tsx
 *
 * Redesigned profile completion screen with new UI
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
import { ProfileData } from "@/types/user/profileModel";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import {
  saveToStorage,
  retrieveFromStorage,
  ONBOARDING_STORAGE_KEYS,
} from "@/utils/data/functions";
import { upsertProfile } from "@/utils/auth/function";
import { prettyJSON } from "@/utils/strings/function";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileScreen() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useProfile() 

  const showToast = useShowToast()

  useEffect(() => {
    setIsFormValid(fullName.trim().length > 0 && dob !== null);
  }, [fullName, dob]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setShowDatePicker(false); // hides date picker in the case it is shown when keyboard is displayed 
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleContinue = async (): Promise<void> => {
    if (!isFormValid || !user) return;

    try {
      // Upsert profile data to Supabase
      // fullName will be split into firstName and lastName automatically
      const result = await upsertProfile({
        userId: user.id,
        fullName: fullName.trim(),
        dob: dob,
        username: profile?.username
      });

      if (!result.success) {
        console.error("Error upserting profile data:", result.error);
        showToast(TOAST.ERROR, "Error updating profile data!")
        return
      } else if (result.data) {
        // Update the profile in the query cache so it's immediately available
        queryClient.setQueryData(["profile", user.id], result.data);
        // Also invalidate to ensure a refetch happens and authState is updated
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }

      setOnboardingStep(OnboardingStep.MOBILE);
    } catch (error) {
      console.error("Error saving profile data:", error);
      showToast(TOAST.ERROR, "Error updating profile data!")
    }
  };

  /**
   * Displays and hides date picker when toggled.
   */
  const showDatepicker = () => {
    if (showDatePicker) {
      console.debug("Hiding date picker");

      setShowDatePicker(false);
    } else {
      console.debug("Displaying date picker");
      Keyboard.dismiss();
      setShowDatePicker(true);
    }
  };

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ): void => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
              Tell us about{" "}
              <Text className="text-indigo-500 underline">yourself</Text>
            </Text>
            <Text className="text-base text-gray-500 leading-6">
              This helps us personalize your experience
            </Text>
          </View>

          {/* Full Name Input */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2.5">
              Full Name
            </Text>
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 h-14">
              <Ionicons
                name="person-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Date of Birth */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2.5">
              Date of Birth
            </Text>
            <TouchableOpacity
              onPress={showDatepicker}
              className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-4 h-14"
              activeOpacity={0.7}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#9CA3AF"
                style={{ marginRight: 12 }}
              />
              <Text
                className={`flex-1 text-base ${
                  dob ? "text-gray-800" : "text-gray-400"
                }`}>
                {dob ? formatDate(dob) : "Select your date of birth"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={(dob as Date) || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              maximumDate={new Date()}
              is24Hour={true}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}

          {/* // TODO [2025-12-20] @coderabiitai remind me to place a text that tells the user they must be 18 years or older to use the application.  */}
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
