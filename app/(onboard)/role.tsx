/**
 * Role Selection Screen for VENT App
 * Copy this to: app/(onboarding)/role-selection.tsx
 *
 * Redesigned with the new UI style matching Alyx screenshots
 * Uses NativeWind (Tailwind CSS for React Native)
 */
import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useQueryClient } from "@tanstack/react-query"
import { useShowToast, TOAST } from "@/components/ui/toast/useToast"
import { useAuth } from "@/context/auth/AuthContext"
import { useProfile } from "@/hooks/queries/auth/useProfileQuery"
import { OnboardingStep } from "@/types/authModel"
import { upsertProfile } from "@/utils/auth/function"
import { UserType } from "@/types/user/user"

interface RoleOption {
  id: UserType
  title: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: UserType.HOST,
    title: "Host",
    description: "Provide support to others based on your experiences",
    icon: "hand-left-outline",
  },
  {
    id: UserType.CLIENT,
    title: "Client",
    description: "Connect with others for support and understanding",
    icon: "heart-outline",
  },
]

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoContent, setInfoContent] = useState<{
    title: string;
    content: string;
  }>({
    title: "",
    content: "",
  });

  const queryClient = useQueryClient();

  const showToast = useShowToast();

  const {
    authState: { user, profile },
    setOnboardingStep,
  } = useAuth();

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      showToast(TOAST.INFO, "Please select a role to continue");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User not authenticated");

      // Upsert the role to Supabase using the centralized function
      const result = await upsertProfile({
        userId: user.id,
        role: selectedRole,
        username: profile?.username
      });

      if (!result.success) {
        showToast(TOAST.ERROR, "Error updating profile data!")
        console.error("Error upserting profile data:", result.error);
        return
      } else if (result.data) {
        // Update the profile in the query cache so it's immediately available
        queryClient.setQueryData(["profile", user.id], result.data);
        // Also invalidate to ensure a refetch happens and authState is updated
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }

      try {
        // Move to next step
        await setOnboardingStep(OnboardingStep.ASSESSMENT);
      } catch (stepError: unknown) {
        console.error("Error updating onboarding step:", stepError);
        showToast(TOAST.ERROR, `Error updating onboarding step: ${stepError}`);
      }
    } catch (error) {
      console.error("Error saving role:", error);
      setError("Failed to save your selection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-28" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2 leading-9">
            How would you like to use <Text className="text-indigo-500 underline">VENT?</Text>
          </Text>
          <Text className="text-base text-gray-500 leading-6">
            Select the role that best matches your goals for using the app.
          </Text>
        </View>

        <View className="gap-3">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id
            return (
              <TouchableOpacity
                key={option.id}
                className={`flex-row items-center rounded-2xl p-5 border-2 ${
                  isSelected ? "bg-indigo-50 border-indigo-500" : "bg-gray-50 border-transparent"
                }`}
                onPress={() => setSelectedRole(option.id)}
                activeOpacity={0.7}
              >
                <View className="w-11 h-11 rounded-xl bg-white justify-center items-center mr-4">
                  <Ionicons name={option.icon} size={24} color={isSelected ? "#6366F1" : "#9CA3AF"} />
                </View>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold mb-1 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                    {option.title}
                  </Text>
                  <Text className="text-sm text-gray-500 leading-5">{option.description}</Text>
                </View>
                {isSelected && (
                  <View className="w-7 h-7 rounded-full bg-indigo-50 justify-center items-center">
                    <Ionicons name="checkmark" size={18} color="#6366F1" />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View className="flex-row items-center px-6 pb-10 gap-3 absolute bottom-0 left-0 right-0 bg-neutral-50">
        <TouchableOpacity
          className={`flex-1 h-14 rounded-full justify-center items-center ${
            selectedRole ? "bg-indigo-500" : "bg-indigo-300"
          }`}
          onPress={handleContinue}
          disabled={!selectedRole || isLoading}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">{isLoading ? "Saving..." : "Continue"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
