/**
 * Welcome Screen for VENT App
 * Copy this to: app/(public)/welcome.tsx
 *
 */
import type React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FeatureCard, FeatureCardProps } from "@/components/auth/FeatureCard";
import { useRef, useState } from "react";
import { useShowToast } from "@/components/ui/toast/useToast";
import { signInWithApple, signInWithGoogle } from "@/utils/auth/function";

const { width, height } = Dimensions.get("window");
const CARD_SIZE = (width - 60) / 2;

export default function WelcomeScreen() {
  const router = useRouter();

  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const showToast = useShowToast();

  const handleContinue = () => {
    router.push("/(public)/auth");
  };

  const features: FeatureCardProps[] = [
    {
      title: "Safe Space",
      icon: "shield-checkmark",
      backgroundColor: "#A78BFA",
      iconColor: "#FFFFFF",
      subtitle: "Private & Secure",
    },
    {
      title: "Connect",
      icon: "people",
      backgroundColor: "#6EE7B7",
      iconColor: "#065F46",
    },
    {
      title: "Share",
      icon: "chatbubbles",
      backgroundColor: "#FB923C",
      iconColor: "#FFFFFF",
      subtitle: "Express yourself",
    },
    {
      title: "Support",
      icon: "heart",
      backgroundColor: "#38BDF8",
      iconColor: "#FFFFFF",
    },
    {
      title: "Grow",
      icon: "trending-up",
      backgroundColor: "#FBBF24",
      iconColor: "#78350F",
    },
    {
      title: "Heal",
      icon: "leaf",
      backgroundColor: "#F9A8D4",
      iconColor: "#831843",
    },
  ];

  const showAuthPanel = () => {
    setIsAuthVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(contentAnim, {
        toValue: -height * 0.15,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideAuthPanel = () => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(contentAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setIsAuthVisible(false));
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
    signInWithGoogle(showToast);
  };

  const handleAppleSignIn = () => {
    console.log("Apple sign in");
    signInWithApple(showToast);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Main Content Card */}
      <Animated.View
        className="flex-1 "
        style={{ transform: [{ translateY: contentAnim }] }}>
        <View className="flex-1 px-5 pt-16">
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to VENT
            </Text>
            <Text className="text-base text-gray-500">
              Connect, Share, and Heal
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity
        className="flex-row items-center justify-center bg-indigo-500 mx-10 mb-10 py-4 rounded-3xl gap-2"
        onPress={isAuthVisible ? hideAuthPanel : showAuthPanel}
        activeOpacity={0.8}>
        <Text className="text-white text-lg font-semibold">Let's Begin</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Auth Panel */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] px-7 pt-3 pb-12 shadow-2xl"
        style={{ transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          className="items-center py-3"
          onPress={hideAuthPanel}
          activeOpacity={0.7}>
          <View className="w-10 h-1 bg-gray-200 rounded" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-800 text-center mt-2">
          Let's get started
        </Text>
        <Text className="text-base text-gray-500 text-center mt-2 mb-8 px-5">
          Welcome to Vent—a safe space to share and connect.
        </Text>

        <View className="gap-3.5">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-2xl gap-3"
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}>
            <Ionicons name="logo-google" size={22} color="#4285F4" />
            <Text className="text-base font-semibold text-gray-800">
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-2xl gap-3"
            onPress={handleAppleSignIn}
            activeOpacity={0.8}>
            <Ionicons name="logo-apple" size={22} color="#000000" />
            <Text className="text-base font-semibold text-gray-800">
              Continue with Apple
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400 text-center mt-6 leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
