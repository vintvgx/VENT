import React from 'react';
import { StyleSheet, Text, View, Platform, Image, SafeAreaView, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import AppleAuth from '@/components/auth/AppleAuth';
import GoogleAuth from '@/components/auth/GoogleAuth';
import { useAuthGuard } from '@/hooks/useAuthHook';
import MobileVerification from '@/components/auth/MobileOTPVerification';

const AuthScreen = () => {
  // This will redirect away if user is already authenticated
  useAuthGuard(false, false);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "", 
        headerShown: false 
      }} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>VENT</Text>
          <Text style={styles.tagline}>
            Connect through shared experiences
          </Text>
        </View>
        
        <View style={styles.authContainer}>
          <Text style={styles.sectionTitle}>Sign In / Sign Up</Text>
          
          <View style={styles.socialContainer}>
            <GoogleAuth />
            
            {Platform.OS === 'ios' && (
              <View style={styles.socialButton}>
                <AppleAuth />
              </View>
            )}
          </View>
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>
          
          <View style={styles.phoneContainer}>
            <MobileVerification />
          </View>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  authContainer: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  socialContainer: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    marginVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666',
  },
  phoneContainer: {
    marginBottom: 24,
  },
  footerContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});