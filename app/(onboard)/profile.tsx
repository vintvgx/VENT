// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { Button, ButtonText } from "@/components/ui/button";
// import { Ionicons } from "@expo/vector-icons";
// import { useTheme } from "@react-navigation/native";
// import { Stack, useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Keyboard,
//   useColorScheme,
//   KeyboardAvoidingViewProps,
//   NativeSyntheticEvent,
//   TextInputChangeEventData
// } from "react-native";
// import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// import { format } from 'date-fns';
// import { useAuth } from "@/context/auth/AuthContext";
// import { useQueryClient } from "@tanstack/react-query";
// import { useShowToast } from "@/components/ui/toast/useToast";
// import { OnboardingStep } from "@/types/authModel";
// import { useProfile } from "@/hooks/queries/auth/useProfileQuery";

// interface ProfileData {
//   fullName: string;
//   dob: Date | null;
// }

// export default function ProfileScreen(): React.ReactElement {
//   const queryClient = useQueryClient();

//   const showToast = useShowToast();

//   const {
//     authState: { user },
//     setOnboardingStep,
//   } = useAuth();

//   const { data: profile, isLoading: profileLoading } = useProfile();

//   const theme = useTheme();
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   const [fullName, setFullName] = useState<string>(profile ? `${profile.first_name} ${profile.last_name}` : "");
//   const [dob, setDob] = useState<Date | string | null>(profile ? profile?.dob : null);
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
//   const [isFormValid, setIsFormValid] = useState<boolean>(false);

//   // Monitor form validity
//   useEffect(() => {
//     setIsFormValid(fullName.trim().length > 0 && dob !== null);
//   }, [fullName, dob]);

//   // Monitor keyboard visibility
//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener(
//       'keyboardDidShow',
//       () => setKeyboardVisible(true)
//     );
//     const keyboardDidHideListener = Keyboard.addListener(
//       'keyboardDidHide',
//       () => setKeyboardVisible(false)
//     );

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   const handleContinue = (): void => {
//     // Handle profile completion and navigation
//     const profileData: ProfileData = {
//       fullName,
//       dob
//     };
//     console.log("Profile data:", profileData);
//     // Navigate to next screen
//     // router.push("/home");
//     setOnboardingStep(OnboardingStep.USERNAME)
//   };

//   const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       setDob(selectedDate);
//     }
//   };

//   const showDatepicker = () => {
//     console.log("Displaying date picker")
//     Keyboard.dismiss();
//     setShowDatePicker(true);
//   };

//   return (
//     <SafeAreaView className="flex-1">
//       {/* Hide default header */}
//       <Stack.Screen
//         options={{
//           title: "",
//           headerShown: false,
//         }}
//       />

//       {/* Custom header with VENT title */}
//       <View className="w-full py-4 items-center justify-center border-b border-gray-200 dark:border-gray-800">
//         <ThemedText type="title" className="text-4xl font-black tracking-[3px] text-center">VENT</ThemedText>
//         <ThemedText className="text-sm font-medium tracking-wider opacity-80">Connect • Share • Heal</ThemedText>
//       </View>

//       {/* Main content */}
//       <View className="flex-1 p-6">
//         <ThemedText type="title" className="text-3xl font-bold mb-2">Complete your profile</ThemedText>
//         <ThemedText type="subtitle" className="text-base mb-8 opacity-80">
//           Tell us a bit about yourself so we can personalize your experience
//         </ThemedText>

//         {/* Form fields */}
//         <ThemedView className="mb-6">
//           <ThemedText className="text-sm font-medium mb-2">Full Name</ThemedText>
//           <TextInput
//             className={`w-full p-4 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} mb-1`}
//             placeholder="Enter your full name"
//             placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
//             value={fullName}
//             onChangeText={setFullName}
//           />
//         </ThemedView>

//         <ThemedView className="mb-6">
//           <ThemedText className="text-sm font-medium mb-2">Date of Birth</ThemedText>
//           <TouchableOpacity
//             onPress={showDatepicker}
//             className={`w-full p-4 rounded-xl flex-row justify-between items-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
//           >
//             <ThemedText className={dob ? "" : "opacity-50"}>
//               {dob ? format(dob, 'MMMM d, yyyy') : "Select your date of birth"}
//             </ThemedText>
//             <Ionicons name="calendar-outline" size={20} color={isDark ? "#fff" : "#000"} />
//           </TouchableOpacity>
//         </ThemedView>

//         {showDatePicker && (
//           <DateTimePicker
//             value={dob as Date || new Date()}
//             mode="date"
//             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//             onChange={onDateChange}
//             maximumDate={new Date()}
//             is24Hour={true}
//             minimumDate={new Date(1920, 0, 1)}
//           />
//         )}
//       </View>

//       {/* Continue button that avoids keyboard */}
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
//         className={`${keyboardVisible ? 'mb-4' : 'mb-8'}`}
//       >
//         <Button
//           className={`mx-6 rounded-2xl h-12 ${!isFormValid ? 'opacity-60' : ''}`}
//           onPress={handleContinue}
//           accessibilityLabel="Continue"
//           action="secondary"
//           variant="solid"
//           disabled={!isFormValid}
//         >
//           <ButtonText className="font-semibold">Continue</ButtonText>
//           <Ionicons
//             color={isDark ? 'black' : 'white'}
//             name="arrow-forward"
//             size={20}
//             style={{ marginLeft: 8 }}
//           />
//         </Button>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

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

      setOnboardingStep(OnboardingStep.USERNAME);
    } catch (error) {
      console.error("Error saving profile data:", error);
      // Still proceed with navigation even if save fails
      setOnboardingStep(OnboardingStep.USERNAME);
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
