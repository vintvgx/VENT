import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, ButtonText } from "@/components/ui/button";
import { useShowToast } from "@/components/ui/toast/useToast";
import { signInWithApple, signInWithGoogle } from "@/utils/auth/function";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  View
} from "react-native";

const { height } = Dimensions.get("window")

const AuthScreen = () => {
  const showToast = useShowToast();
  const theme = useTheme();
  //TODO Check if authGuard is needed 
  // This will redirect away if user is already authenticated
  // useAuthGuard(false, false);

  const [isAuthVisible, setIsAuthVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(height)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const showAuthPanel = () => {
    setIsAuthVisible(true)
    // Animate auth panel up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
    
    // Animate content up to make room for auth panel
    Animated.timing(contentAnim, {
      toValue: -height * 0.25, // Move up by approximately half the auth panel height
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const hideAuthPanel = () => {
    // Animate auth panel down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsAuthVisible(false)
    })
    
    // Animate content back to original position
    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Hide header */}
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* Main content */}
      <Animated.View 
        className="flex-1 justify-center items-center p-5 pt-20 md:pt-16"
        style={{ transform: [{ translateY: contentAnim }] }}
      >
        {/* TODO Fix title display */}
        {/* <View className="absolute top-[60px] ios:top-[60px] android:top-[40px] w-full h-[10%] items-center justify-center z-10 bg-red-500">
          <ThemedText type="title" className="text-[52px] font-black tracking-[3px] text-center">VENT</ThemedText>
          <ThemedText className="text-sm font-medium tracking-wider opacity-80">Connect • Share • Heal</ThemedText>
        </View> */}

        <View className="w-full h-4/5 rounded-2xl p-6 items-center justify-center bg-sky-600">
          <ThemedText type="title" className="text-center mb-2.5">Connect with others through shared experiences</ThemedText>
          <ThemedText type="subtitle" className="text-center mb-8 opacity-90">A safe space for peer-to-peer support</ThemedText>

          {/* Card with content */}
          <ThemedView className="w-[90%] p-5 rounded-xl shadow-md mt-2.5 ">
            <View className="flex-row items-center mb-2.5">
              <View className="w-6 h-6 rounded-full bg-gray-300" />
              <View className="w-6 h-6 rounded-full bg-gray-300 -ml-2.5" />
              <View className="w-6 h-6 rounded-full bg-gray-300 -ml-2.5" />
              <ThemedText className="ml-1 text-xs opacity-70">Share</ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" className="text-[22px] mb-4">Community Support</ThemedText>

            <View className="mb-4">
              <ThemedText className="text-sm leading-[22px] mb-2">
                • Connect with others who understand your journey
              </ThemedText>
              <ThemedText className="text-sm leading-[22px] mb-2">
                • Share experiences in a safe, supportive environment
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" className="text-base mb-1">Upcoming events</ThemedText>
            <ThemedText className="text-sm leading-5">
              Join our weekly support circles and guided discussions
            </ThemedText>
          </ThemedView>
        </View>
      </Animated.View>

      {/* Sign In / Sign Up button */}
      <Button
        className="mb-10 mx-12 rounded-2xl h-10"
        onPress={showAuthPanel}
        accessibilityLabel="Sign up or sign in"
        action="secondary"
        variant="solid"
      >
        <Ionicons color={theme.dark ? 'black' : 'white'} name={isAuthVisible ? "call-outline" : "person-outline"} size={24} />
        <ButtonText className="ml-2" variant="solid">{isAuthVisible ? "Continue with Mobile" : "Sign Up / Sign In"}</ButtonText>
      </Button>

      <Animated.View
        className="absolute bottom-0 left-0 right-0 h-[46%] rounded-t-3xl p-5 pt-4 px-6 shadow-lg"
        style={{
          transform: [{ translateY: slideAnim }],
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Button
          className="self-center mb-2.5"
          onPress={hideAuthPanel}
          variant="link"
          action="default"
        >
          <Ionicons color={theme.dark ? 'white' : 'black'} name="chevron-down" size={24} />
        </Button>

        <ThemedText type="title" className="text-[36px] font-bold text-center mb-1 text-white">Let's get started</ThemedText>
        <ThemedText type="subtitle" className="text-base text-center mb-8 px-5 text-gray-400 w-[70%] self-center">
          Welcome to Vent—a safe space to share and connect.
        </ThemedText>

        <View className="w-full gap-4">
          <Button
            className="bg-white border-0 mx-5 rounded-2xl h-10 items-center"
            accessibilityLabel="Continue with Google"
            action="primary"
            variant="outline"
            onPress={() => signInWithGoogle(showToast)}
          >
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <ButtonText variant="solid" className="ml-2.5 text-base">Continue with Google</ButtonText>
          </Button>

          <Button
            className="bg-white border-0 mx-5 rounded-2xl h-10 items-center"
            accessibilityLabel="Continue with Apple"
            action="primary"
            variant="outline"
            onPress={() => signInWithApple(showToast)} 
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
            <ButtonText variant="solid" className="ml-2.5 text-base">Continue with Apple</ButtonText>
          </Button>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AuthScreen;