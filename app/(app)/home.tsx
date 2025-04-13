import { Stack } from "expo-router";
import React, { useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    ScrollView
} from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthHook";
import { prettyJSON } from "@/utils/strings/function";

// Add this helper function to format assessment responses
const formatAssessmentResponse = (response: { text?: string; value?: string; values?: string[] }) => {
  if (response.text) return response.text;
  if (response.values) return response.values.join(', ');
  if (response.value) return response.value;
  return "Not available";
};

const HomeScreen = () => {
  const { authState: {user, profile, assessment}, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    console.log("Assessment", prettyJSON(assessment))
  })

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Home",
          headerBackVisible: false,
        }}
      />

      <ScrollView style={styles.contentContainer}>
        {/* User Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.userHeader}>
            <Text style={styles.username}>
              @{profile?.username || "Username"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {profile?.role || "Role not set"}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
        </View>

        <Text style={styles.welcomeText}>Welcome to VENT!</Text>

        <Text style={styles.descriptionText}>
          VENT is focused on cultivating peer to peer connections based on
          shared experiences that provide emotional, past trauma or social
          support.
        </Text>

        {/* Account Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoContainer}>
            <InfoRow label="User ID" value={user?.id} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={user?.phone} />
            <InfoRow label="Auth Provider" value={user?.app_metadata?.provider} />
          </View>
        </View>

        {/* Profile Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.infoContainer}>
            <InfoRow label="Username" value={profile?.username} />
            <InfoRow label="First Name" value={profile?.first_name} />
            <InfoRow label="Last Name" value={profile?.last_name} />
            <InfoRow label="Date of Birth" value={profile?.dob} />
          </View>
        </View>

        {/* Assessment Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Assessment Information</Text>
          <View style={styles.infoContainer}>
            {assessment ? (
              <>
                <InfoRow 
                  label="Question ID" 
                  value={assessment.question_id} 
                />
                <InfoRow 
                  label="Response" 
                  value={formatAssessmentResponse(assessment.response)} 
                />
                <InfoRow 
                  label="Version" 
                  value={assessment.assessment_version?.toString()} 
                />
                <InfoRow 
                  label="Last Updated" 
                  value={new Date(assessment.updated_at).toLocaleDateString()} 
                />
              </>
            ) : (
              <Text style={styles.noDataText}>No assessment data available</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button action="negative" onPress={handleSignOut}>
            <ButtonText>Sign Out</ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper component for consistent info row display
const InfoRow = ({ label, value }: { label: string, value?: string | null }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value || "Not available"}</Text>
  </View>
);

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
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    width: 140,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {},
  headerSection: {
    marginBottom: 24,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
});
