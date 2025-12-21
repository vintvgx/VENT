

/**
 * Auth Screen for VENT App
 * 
 * NOTE: Currently screen transitions to Welcome.tsx page for authentication
 * 
 * TODO [2025-12-20] save user profile to local storage, if it exists, use auth.tsx to display the user's profile so they can sign in (if they delete their info they are returned to Welcome screen)
 */
import { useRef, useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, Animated, Dimensions, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useShowToast } from "@/components/ui/toast/useToast"
import { signInWithApple, signInWithGoogle } from "@/utils/auth/function"

const { height } = Dimensions.get("window")

export default function AuthScreen() {
  const [isAuthVisible, setIsAuthVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(height)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const showToast = useShowToast();


  const showAuthPanel = () => {
    setIsAuthVisible(true)
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
    ]).start()
  }

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
    ]).start(() => setIsAuthVisible(false))
  }

  const handleGoogleSignIn = () => {
    console.log("Google sign in")
    signInWithGoogle(showToast)
  }

  const handleAppleSignIn = () => {
    console.log("Apple sign in")
    signInWithApple(showToast)
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View className="items-center pt-5 pb-2.5">
        <Text className="text-4xl font-black tracking-widest text-gray-800">VENT</Text>
        <Text className="text-sm text-gray-500 tracking-widest mt-1">Connect • Share • Heal</Text>
      </View>

      {/* Main Content Card */}
      <Animated.View className="flex-1 px-5 pt-5" style={{ transform: [{ translateY: contentAnim }] }}>
        <View className="flex-1 rounded-3xl overflow-hidden">
          {/* Hero Gradient Section */}
          <View className="bg-indigo-500 px-7 pt-10 pb-7 items-center rounded-t-3xl">
            <Ionicons name="heart-circle" size={60} color="rgba(255,255,255,0.9)" />
            <Text className="text-2xl font-bold text-white text-center mt-4 leading-8">
              Connect with others through shared experiences
            </Text>
            <Text className="text-base text-white/85 text-center mt-2">A safe space for peer-to-peer support</Text>
          </View>

          {/* Features Card */}
          <View className="flex-1 bg-white p-6 rounded-b-3xl">
            <View className="flex-row items-center mb-4">
              <View className="w-7 h-7 rounded-full bg-violet-400 border-2 border-white" />
              <View className="w-7 h-7 rounded-full bg-emerald-300 border-2 border-white -ml-2" />
              <View className="w-7 h-7 rounded-full bg-orange-400 border-2 border-white -ml-2" />
              <Text className="ml-2.5 text-sm text-gray-500">Join thousands</Text>
            </View>

            <Text className="text-2xl font-bold text-gray-800 mb-4">Community Support</Text>

            <View className="gap-3 mb-5">
              <View className="flex-row items-start gap-2.5">
                <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
                <Text className="flex-1 text-sm text-gray-600 leading-5">
                  Connect with others who understand your journey
                </Text>
              </View>
              <View className="flex-row items-start gap-2.5">
                <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
                <Text className="flex-1 text-sm text-gray-600 leading-5">Share experiences in a safe environment</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-base font-semibold text-gray-800 mb-1">Upcoming events</Text>
              <Text className="text-sm text-gray-500 leading-5">
                Join weekly support circles and guided discussions
              </Text>
            </View> 
          </View>
        </View>
      </Animated.View>

      {/* Sign In Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-gray-800 mx-10 mb-10 py-4 rounded-3xl gap-2.5"
        onPress={isAuthVisible ? hideAuthPanel : showAuthPanel}
        activeOpacity={0.8}
      >
        <Ionicons name={isAuthVisible ? "close" : "person-outline"} size={22} color="#FFFFFF" />
        <Text className="text-white text-base font-semibold">{isAuthVisible ? "Close" : "Sign Up / Sign In"}</Text>
      </TouchableOpacity>

      {/* Auth Panel */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] px-7 pt-3 pb-12 shadow-2xl"
        style={{ transform: [{ translateY: slideAnim }] }}
      >
        <TouchableOpacity className="items-center py-3" onPress={hideAuthPanel} activeOpacity={0.7}>
          <View className="w-10 h-1 bg-gray-200 rounded" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-800 text-center mt-2">Let's get started</Text>
        <Text className="text-base text-gray-500 text-center mt-2 mb-8 px-5">
          Welcome to Vent—a safe space to share and connect.
        </Text>

        <View className="gap-3.5">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-2xl gap-3"
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={22} color="#4285F4" />
            <Text className="text-base font-semibold text-gray-800">Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-200 py-4 rounded-2xl gap-3"
            onPress={handleAppleSignIn}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={22} color="#000000" />
            <Text className="text-base font-semibold text-gray-800">Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs text-gray-400 text-center mt-6 leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}
