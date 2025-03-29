import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { isPossiblePhoneNumber } from 'libphonenumber-js';
import { supabase } from '@/lib/supabase/supabase';
import { signInWithOtp } from '@/utils/auth/function';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth/AuthContext';

interface MobileVerificationProps {
  isSecondFactor?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const MobileVerification: React.FC<MobileVerificationProps> = ({
  isSecondFactor = false,
  onSuccess,
  onError
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setNeedsMobileVerification } = useAuth();

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      // trim whitespaces from phone number input
      const sanitizedPhone = phoneNumber.trim()
      
      // Validate phone number format
      if (!isPossiblePhoneNumber(sanitizedPhone)) {
        throw new Error('Please enter a valid phone number');
      }

      const response = await signInWithOtp(sanitizedPhone);
      
      if (response && 'message' in response) {
        throw new Error(response.message);
      }
      
      setCodeSent(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!verificationCode || verificationCode.length < 6) {
        throw new Error('Please enter the 6-digit verification code');
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: isSecondFactor ? 'phone_change' : 'sms',
      });

      if (error) {
        throw new Error(error.message);
      }

      // If this was used as a second factor, mark mobile verification as complete
      if (isSecondFactor) {
        setNeedsMobileVerification(false);
      }
      
      // Navigate to home after successful verification
      router.replace('/(app)/home');
      
      onSuccess?.();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!codeSent ? (
        <>
          <Text style={styles.title}>
            {isSecondFactor 
              ? 'Verify your phone number for 2FA' 
              : 'Sign in with your phone number'}
          </Text>
          
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number (e.g. +1234567890)"
            keyboardType="phone-pad"
            editable={!loading}
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Send Verification Code
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter verification code</Text>
          
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {phoneNumber}
          </Text>
          
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Verify Code
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.textButton}
            onPress={() => setCodeSent(false)}
            disabled={loading}
          >
            <Text style={styles.textButtonText}>
              Change phone number
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
  },
  textButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default MobileVerification;