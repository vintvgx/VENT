"use client"
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthContext";
import { UserType } from "@/types/user/user";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";
import { useAssessment } from "@/hooks/queries/auth/useAssessmentQuery";
import { ToastService } from "@/services/ToastService";
import { useEffect, useState } from "react";

const { width } = Dimensions.get("window")

// Helper function to format assessment responses
const formatAssessmentResponse = (response: {
  text?: string
  value?: string
  values?: string[]
}) => {
  if (!response) return "Not available"
  if (response.text) return response.text
  if (response.values && Array.isArray(response.values)) return response.values.join(", ")
  if (response.value) return response.value
  return JSON.stringify(response)
}

// Stat Card Component
const StatCard = ({
  icon,
  iconBgColor,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap
  iconBgColor: string
  label: string
  value: string
}) => (
  <View className="flex-row items-center py-3">
    <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: iconBgColor }}>
      <Ionicons name={icon} size={22} color="#fff" />
    </View>
    <View>
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-xl font-bold text-neutral-800">{value}</Text>
    </View>
  </View>
)

// Info Row Component
const InfoRow = ({
  label,
  value,
}: {
  label: string
  value?: string | null
}) => (
  <View className="flex-row mb-3 flex-wrap">
    <Text className="text-base font-medium w-36 text-violet-500">{label}:</Text>
    <Text className="flex-1 text-base text-neutral-600">{value || "Not available"}</Text>
  </View>
)

const HomeScreen = () => {
  // Uncomment these in your Expo project:
  const queryClient = useQueryClient();
  const {
    authState: { user, isDebugMode },
    signOutMutation,
    clearDebugData,
    getDebugData,
  } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: assessments, isLoading: assessmentsLoading } = useAssessment();
  const [debugData, setDebugData] = useState<any>(null);

  // Load debug data when component mounts or debug mode changes
  useEffect(() => {
    const loadDebugData = async () => {
      if (isDebugMode) {
        const data = await getDebugData();
        setDebugData(data);
      } else {
        setDebugData(null);
      }
    };
    loadDebugData();
  }, [isDebugMode, getDebugData]);


  // Uncomment in your Expo project:
  const handleSignOut = async () => {
    try {
      if (isDebugMode) {
        await clearDebugData();
        ToastService.info("Debug data cleared");
      } else {
        await signOutMutation?.mutateAsync();
      }
    } catch (error) {
      console.error("Error signing out:", error);
      ToastService.error(`Error: ${error}`);
    }
  }

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["assessments", user?.id],
    });
  }, []);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeklyData = [3, 2, 4, 2, 3, 4, 3] // Mock engagement data

  return (
    <SafeAreaView className="flex-1">
      {/* Gradient Background */}
      <LinearGradient
        colors={["#ffecd2", "#fcb69f", "#a1c4fd", "#c2e9fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
     

      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Last Activity Badge */}
          <View className="flex-row items-center bg-white/60 rounded-2xl px-3 py-2">
            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-2">
              <Ionicons name="chatbubble-ellipses" size={16} color="#6366f1" />
            </View>
            <View>
              <Text className="text-xs font-semibold text-neutral-700">6:00 PM</Text>
              <Text className="text-xs text-neutral-500">Last Session</Text>
            </View>
            <View className="w-2 h-2 bg-orange-400 rounded-full ml-1 -mt-3" />
          </View>

          {/* Center Stat */}
          <View className="items-center">
            <Text className="text-3xl font-bold text-neutral-800">{assessments?.length || 0}</Text>
            <Text className="text-xs text-neutral-500">sessions</Text>
          </View>

          {/* Right Stat */}
          <View className="items-end">
            <Text className="text-base font-semibold text-neutral-700">Connect</Text>
            <View className="h-0.5 w-16 bg-violet-500 mt-1 rounded-full" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Weekly Engagement Card */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-medium text-neutral-600">Weekly Engagement</Text>
            <View className="flex-row">
              <TouchableOpacity className="w-8 h-8 bg-white/70 rounded-full items-center justify-center mr-2">
                <Ionicons name="chevron-back" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity className="w-8 h-8 bg-white/70 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white/80 rounded-3xl p-5 backdrop-blur-sm">
            {/* Chart Area */}
            <View className="h-36 justify-center mb-4">
              <View className="flex-row items-end justify-between px-2">
                {weeklyData.map((value, index) => (
                  <View key={index} className="items-center">
                    <View className="w-3 h-3 rounded-full bg-emerald-400 mb-1" style={{ marginBottom: value * 8 }} />
                    {index < weeklyData.length - 1 && (
                      <View
                        className="absolute border-t border-dashed border-emerald-300"
                        style={{ width: 30, top: "50%" }}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Day Labels */}
            <View className="flex-row justify-between border-t border-neutral-100 pt-3">
              {weekDays.map((day, index) => (
                <View key={day} className="items-center flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className="w-px h-2 bg-neutral-200" />
                  </View>
                  <Text className="text-xs text-neutral-400">{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          <View className="w-[48%] bg-white/60 rounded-2xl p-4 mb-3">
            <StatCard
              icon="flash"
              iconBgColor="#a78bfa"
              label="Weekly Avg"
              value={`${assessments?.length || 0} sessions`}
            />
          </View>
          <View className="w-[48%] bg-white/60 rounded-2xl p-4 mb-3">
            <StatCard icon="calendar" iconBgColor="#f9a8d4" label="Last Week" value="0 sessions" />
          </View>
          <View className="w-[48%] bg-white/60 rounded-2xl p-4">
            <StatCard icon="water" iconBgColor="#93c5fd" label="Today" value="0 entries" />
          </View>
          <View className="w-[48%] bg-white/60 rounded-2xl p-4">
            <StatCard icon="heart" iconBgColor="#fca5a5" label="Connections" value="0 active" />
          </View>
        </View>

        {/* Wellness Forecast */}
        <View className="mb-4">
          <Text className="text-base font-medium text-neutral-600 mb-3">Wellness Forecast</Text>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-violet-100 rounded-full items-center justify-center">
              <Ionicons name="sunny" size={16} color="#8b5cf6" />
            </View>
            <View className="flex-1 mx-3 h-2 rounded-full overflow-hidden bg-neutral-200">
              <LinearGradient
                colors={["#a78bfa", "#f472b6", "#fb923c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full w-3/4 rounded-full"
              />
            </View>
            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
              <Ionicons name="moon" size={16} color="#f97316" />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-white/80 rounded-3xl p-5 mb-4">
          <Text className="text-base text-neutral-600 leading-6 mb-3">
            Your wellness journey is looking <Text className="text-emerald-500 font-semibold">positive</Text> today.
          </Text>
          <Text className="text-base text-neutral-600 leading-6">
            Join <Text className="text-violet-500 font-semibold underline">VENT Community</Text> to connect with others,
            share your experiences, and continue your healing journey.
          </Text>
        </View>

        {/* Account Info Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-neutral-700 mb-3 pl-2">Account Information</Text>
          <View className="bg-white/80 rounded-3xl p-4">
            <InfoRow label="User ID" value={user?.id} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={user?.phone} />
            <InfoRow label="Auth Provider" value={user?.app_metadata?.provider} />
          </View>
        </View>

        {/* Profile Info Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-neutral-700 mb-3 pl-2">Profile Information</Text>
          <View className="bg-white/80 rounded-3xl p-4">
            <InfoRow label="Username" value={profile?.username} />
            <InfoRow label="First Name" value={profile?.first_name} />
            <InfoRow label="Last Name" value={profile?.last_name} />
            <InfoRow label="Date of Birth" value={profile?.dob} />
          </View>
        </View>

        {/* Assessment Info Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-neutral-700 mb-3 pl-2">Assessment Information</Text>
          <View className="bg-white/80 rounded-3xl p-4">
            {assessments && assessments.length > 0 ? (
              assessments.map((assessment, index) => (
                <View key={assessment.id} className="mb-4">
                  <Text className="text-lg font-semibold text-violet-500 mb-2">
                    Assessment {index + 1}: {assessment.question_id}
                  </Text>
                  <InfoRow label="Response" value={formatAssessmentResponse(assessment.response)} />
                  <InfoRow label="Version" value={assessment.assessment_version?.toString()} />
                  <InfoRow label="Last Updated" value={new Date(assessment.updated_at).toLocaleDateString()} />
                  {index < assessments.length - 1 && <View className="h-px bg-neutral-200 my-3" />}
                </View>
              ))
            ) : (
              <Text className="text-base text-neutral-400 italic text-center py-3">No assessment data available</Text>
            )}
          </View>
        </View>

        {/* Debug Data Display */}
        {isDebugMode && debugData && (
          <View className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <Text className="text-sm font-semibold text-yellow-800 mb-2">Debug Data:</Text>
            {debugData.username && (
              <Text className="text-xs text-yellow-700 mb-1">Username: {debugData.username}</Text>
            )}
            {debugData.fullName && (
              <Text className="text-xs text-yellow-700 mb-1">Full Name: {debugData.fullName}</Text>
            )}
            {debugData.dob && (
              <Text className="text-xs text-yellow-700 mb-1">DOB: {new Date(debugData.dob).toLocaleDateString()}</Text>
            )}
            {debugData.phoneNumber && (
              <Text className="text-xs text-yellow-700 mb-1">Phone: {debugData.phoneNumber}</Text>
            )}
            {debugData.role && (
              <Text className="text-xs text-yellow-700 mb-1">Role: {debugData.role}</Text>
            )}
          </View>
        )}

        {/* Sign Out / Clear Data Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center mb-6 ${
            isDebugMode ? "bg-yellow-500" : "bg-red-500"
          }`}
          onPress={handleSignOut}
        >
          <Text className="text-white font-semibold text-base">
            {isDebugMode ? "Clear Data" : "Sign Out"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center"
        style={{
          shadowColor: "#10b981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity
        className="absolute bottom-8 left-6 w-12 h-12 bg-white/80 rounded-full items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Ionicons name="ellipsis-horizontal" size={22} color="#6b7280" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default HomeScreen
