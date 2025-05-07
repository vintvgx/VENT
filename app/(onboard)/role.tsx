// app/(onboarding)/role-selection.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/auth/AuthContext";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase/supabase";
import { OnboardingStep } from "@/types/authModel";
import { UserType } from "@/types/user/user";
import { prettyJSON } from "@/utils/strings/function";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RoleSelectionScreen() {
  const queryClient = useQueryClient();

  const showToast = useShowToast();

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();

  const { data: profile, isLoading: profileLoading } = useProfile();

  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoContent, setInfoContent] = useState<{
    title: string;
    content: string;
  }>({
    title: "",
    content: "",
  });

  const colorScheme = useColorScheme() ?? "light";
  const iconColor =
    colorScheme === "light" ? Colors.light.icon : Colors.dark.icon;

  const hostInfo = {
    title: "Becoming a Host",
    content:
      "As a host, you'll provide emotional and social support to others based on your own experiences. Hosts listen, share wisdom, and help others navigate their challenges. This role is ideal if you have experience you'd like to share to help others, and you're willing to dedicate time to supporting the community. Hosts undergo additional verification and training to ensure they can provide appropriate support.",
  };

  const clientInfo = {
    title: "Joining as a Client",
    content:
      "As a client, you'll be able to connect with supportive hosts who have experiences similar to yours. This role allows you to seek guidance, share your challenges, and learn from others who understand what you're going through. Clients can browse hosts by shared experiences, send connection requests, and engage in meaningful conversations in a safe, supportive environment.",
  };

  const showInfoModal = (role: UserType) => {
    const content = role === UserType.HOST ? hostInfo : clientInfo;
    setInfoContent(content);
    setInfoModalVisible(true);
  };

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

      // Save the role to Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username: profile?.username,
        role: selectedRole,
        updated_at: new Date(),
      });

      if (error) {
        throw error;
      } else {
        // re-fetch profile data
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

  if (profileLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading profile…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        How would you like to use VENT?
      </ThemedText>

      <ThemedText style={styles.description}>
        Select the role that best matches your goals for using the app.
      </ThemedText>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedRole === UserType.HOST && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole(UserType.HOST)}
          activeOpacity={0.8}>
          <View style={styles.optionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
              Host
            </ThemedText>
            <TouchableOpacity
              onPress={() => showInfoModal(UserType.HOST)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <MaterialIcons name="info-outline" size={22} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.optionDescription}>
            Provide support to others based on your experiences
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedRole === UserType.CLIENT && styles.selectedCard,
          ]}
          onPress={() => setSelectedRole(UserType.CLIENT)}
          activeOpacity={0.8}>
          <View style={styles.optionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
              Client
            </ThemedText>
            <TouchableOpacity
              onPress={() => showInfoModal(UserType.CLIENT)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <MaterialIcons name="info-outline" size={22} color={iconColor} />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.optionDescription}>
            Connect with others for support and understanding
          </ThemedText>
        </TouchableOpacity>
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Button
        size="lg"
        action="primary"
        style={styles.button}
        onPress={handleContinue}
        disabled={isLoading || !selectedRole}>
        <Text>Continue</Text>
      </Button>

      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {infoContent.title}
            </ThemedText>

            <ScrollView style={styles.modalScroll}>
              <ThemedText style={styles.modalText}>
                {infoContent.content}
              </ThemedText>
            </ScrollView>

            <Button
              size="md"
              action="primary"
              style={styles.modalButton}
              onPress={() => setInfoModalVisible(false)}>
              <Text>Got it</Text>
            </Button>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  selectedCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
  },
  optionDescription: {
    lineHeight: 22,
  },
  button: {
    marginTop: "auto",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    lineHeight: 24,
    marginBottom: 8,
  },
  modalButton: {
    alignSelf: "center",
    minWidth: 120,
  },
});
