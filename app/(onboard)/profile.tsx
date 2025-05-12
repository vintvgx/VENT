// import { useState, useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   View,
//   TextInput,
//   ScrollView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Text,
//   Modal,
//   Platform,
//   Keyboard,
//   KeyboardAvoidingView,
//   TouchableWithoutFeedback,
//   Animated,
//   Dimensions,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Button } from "@/components/ui/button";
// import { ThemedText } from "@/components/ThemedText";
// import { supabase } from "@/lib/supabase/supabase";
// import { useAuth } from "@/context/auth/AuthContext";
// import { OnboardingStep } from "@/types/authModel";
// import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
// import { Calendar, Check } from "lucide-react-native";
// import React from "react";
// import { ProfileStep, STORAGE_KEYS } from "@/types/user/profileModel";
// import { ProfileController } from "@/controller/onboard/ProfileController";
// import { useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, ButtonText } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  useColorScheme,
  KeyboardAvoidingViewProps,
  NativeSyntheticEvent,
  TextInputChangeEventData
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useAuth } from "@/context/auth/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useShowToast } from "@/components/ui/toast/useToast";
import { OnboardingStep } from "@/types/authModel";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";


interface ProfileData {
  fullName: string;
  dob: Date | null;
}

export default function ProfileScreen(): React.ReactElement {
  const queryClient = useQueryClient();

  const showToast = useShowToast();
  
  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();
  
  const { data: profile, isLoading: profileLoading } = useProfile();

  
  const theme = useTheme();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const [fullName, setFullName] = useState<string>(profile ? `${profile.first_name} ${profile.last_name}` : "");
  const [dob, setDob] = useState<Date | string | null>(profile ? profile?.dob : null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  // Monitor form validity
  useEffect(() => {
    setIsFormValid(fullName.trim().length > 0 && dob !== null);
  }, [fullName, dob]);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleContinue = (): void => {
    // Handle profile completion and navigation
    const profileData: ProfileData = {
      fullName,
      dob
    };
    console.log("Profile data:", profileData);
    // Navigate to next screen
    // router.push("/home");
    setOnboardingStep(OnboardingStep.USERNAME)
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const showDatepicker = () => {
    console.log("Displaying date picker")
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Hide default header */}
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* Custom header with VENT title */}
      <View className="w-full py-4 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <ThemedText type="title" className="text-4xl font-black tracking-[3px] text-center">VENT</ThemedText>
        <ThemedText className="text-sm font-medium tracking-wider opacity-80">Connect • Share • Heal</ThemedText>
      </View>

      {/* Main content */}
      <View className="flex-1 p-6">
        <ThemedText type="title" className="text-3xl font-bold mb-2">Complete your profile</ThemedText>
        <ThemedText type="subtitle" className="text-base mb-8 opacity-80">
          Tell us a bit about yourself so we can personalize your experience
        </ThemedText>

        {/* Form fields */}
        <ThemedView className="mb-6">
          <ThemedText className="text-sm font-medium mb-2">Full Name</ThemedText>
          <TextInput
            className={`w-full p-4 rounded-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} mb-1`}
            placeholder="Enter your full name"
            placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
            value={fullName}
            onChangeText={setFullName}
          />
        </ThemedView>

        <ThemedView className="mb-6">
          <ThemedText className="text-sm font-medium mb-2">Date of Birth</ThemedText>
          <TouchableOpacity 
            onPress={showDatepicker}
            className={`w-full p-4 rounded-xl flex-row justify-between items-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
          >
            <ThemedText className={dob ? "" : "opacity-50"}>
              {dob ? format(dob, 'MMMM d, yyyy') : "Select your date of birth"}
            </ThemedText>
            <Ionicons name="calendar-outline" size={20} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </ThemedView>

        {showDatePicker && (
          <DateTimePicker
            value={dob as Date || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
            is24Hour={true}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}
      </View>

      {/* Continue button that avoids keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        className={`${keyboardVisible ? 'mb-4' : 'mb-8'}`}
      >
        <Button
          className={`mx-6 rounded-2xl h-12 ${!isFormValid ? 'opacity-60' : ''}`}
          onPress={handleContinue}
          accessibilityLabel="Continue"
          action="secondary"
          variant="solid"
          disabled={!isFormValid}
        >
          <ButtonText className="font-semibold">Continue</ButtonText>
          <Ionicons 
            color={isDark ? 'black' : 'white'} 
            name="arrow-forward" 
            size={20} 
            style={{ marginLeft: 8 }}
          />
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}