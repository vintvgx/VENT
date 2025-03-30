import { Stack } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthHook";

const HomeScreen = () => {
  useAuthGuard(true, false); // requires auth , does not require mobile auth
  const { authState, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Home",
          headerBackVisible: false,
        }}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.welcomeText}>Welcome to VENT!</Text>

        <Text style={styles.descriptionText}>
          VENT is focused on cultivating peer to peer connections based on
          shared experiences that provide emotional, past trauma or social
          support.
        </Text>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoTitle}>Account Information</Text>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>User ID:</Text>
            <Text style={styles.userInfoValue}>
              {authState.user?.id || "Not available"}
            </Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Email:</Text>
            <Text style={styles.userInfoValue}>
              {authState.user?.email || "Not available"}
            </Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Phone:</Text>
            <Text style={styles.userInfoValue}>
              {authState.user?.phone || "Not available"}
            </Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Auth Provider:</Text>
            <Text style={styles.userInfoValue}>
              {authState.user?.app_metadata?.provider || "Not available"}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button action="negative" onPress={handleSignOut}>
            <ButtonText>Sign Out</ButtonText>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    lineHeight: 24,
  },
  userInfoContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  userInfoItem: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: "500",
    width: 120,
  },
  userInfoValue: {},
  buttonContainer: {},
});
