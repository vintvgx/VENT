// app/(onboarding)/profile.tsx
import { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase/supabase";
import { router } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/auth";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";

export default function ProfileScreen() {
  const showToast = useShowToast();

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //   const pickImage = async () => {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 0.8,
  //     });

  //     if (!result.canceled) {
  //       setAvatarUri(result.assets[0].uri);
  //     }
  //   };

  //   const uploadAvatar = async (uri: string): Promise<string | null> => {
  //     try {
  //       if (!user) throw new Error('User not authenticated');

  //       // Convert URI to Blob
  //       const response = await fetch(uri);
  //       const blob = await response.blob();

  //       // Generate unique filename
  //       const fileExt = uri.split('.').pop();
  //       const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  //       const filePath = `avatars/${fileName}`;

  //       // Upload to Supabase Storage
  //       const { error } = await supabase.storage
  //         .from('avatars')
  //         .upload(filePath, blob);

  //       if (error) throw error;

  //       // Get public URL
  //       const { data } = supabase.storage
  //         .from('avatars')
  //         .getPublicUrl(filePath);

  //       return data.publicUrl;
  //     } catch (error) {
  //       console.error('Error uploading avatar:', error);
  //       return null;
  //     }
  //   };

  const saveProfile = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User not authenticated");

      // Upload avatar if selected
      //   let avatarUrl = null;
      //   if (avatarUri) {
      //     avatarUrl = await uploadAvatar(avatarUri);
      //   }

      // Create profile in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim(),
        bio: bio.trim(),
        //   avatar_url: avatarUrl,
        updated_at: new Date(),
      });

      if (error) throw error;

      try {
      // Move to next step
      await setOnboardingStep(OnboardingStep.ASSESSMENT);
      } catch (stepError: unknown) {
        console.error("Error updating onboarding step:", stepError);
        showToast(TOAST.ERROR, `Error updating onboarding step: ${stepError}`)
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      setError("Failed to save profile. Please try again.");
      showToast(TOAST.ERROR, "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Create Your Profile
      </ThemedText>

      <ThemedText style={styles.description}>
        Tell us a bit about yourself to help connect with others who share
        similar experiences.
      </ThemedText>

      {/* <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>Add Photo</ThemedText>
          </View>
        )}
      </TouchableOpacity> */}

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>About Me</ThemedText>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Share a bit about yourself..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Button
        size="lg"
        action="primary"
        style={styles.button}
        onPress={saveProfile}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text>Continue</Text>
        )}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});
