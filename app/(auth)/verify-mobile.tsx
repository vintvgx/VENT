import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthHook';
import { useAuth } from '@/context/auth/AuthContext';
import MobileVerification from '@/components/auth/MobileOTPVerification';


const VerifyMobileScreen = () => {
  const { authState } = useAuth();
  
  // This will redirect if user is not authenticated or doesn't need verification
  useAuthGuard(true, true);

  if (authState.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "Verify Phone Number",
        headerBackVisible: false,
      }} />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Two-Factor Authentication</Text>
          <Text style={styles.subtitle}>
            For added security, please verify your phone number
          </Text>
        </View>
        
        <MobileVerification 
          isSecondFactor={true}
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifyMobileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});