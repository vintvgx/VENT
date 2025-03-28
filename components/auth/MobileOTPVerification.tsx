import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { AuthError } from "@supabase/supabase-js";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { signInWithOtp } from "@/utils/auth/function";


// ... existing code ...
interface MobileOTPVerificationProps {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
  
  const MobileOTPVerification: React.FC<MobileOTPVerificationProps> = ({
    onSuccess,
    onError
  }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const handleSignIn = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Validate phone number format
        if (!isPossiblePhoneNumber(phoneNumber)) {
          throw new Error('Please enter a valid phone number');
        }
  
        const response = await signInWithOtp(phoneNumber);
        
        // if (response.error) {
        //   throw new Error(response.error);
        // }
  
        onSuccess?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
        setError(errorMessage);
        onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          editable={!loading}
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
  
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending OTP...' : 'Sign In with OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    button: {
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    errorText: {
      color: '#FF3B30',
      marginBottom: 16,
    },
  });
  // ... existing code ...