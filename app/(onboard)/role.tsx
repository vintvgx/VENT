// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const role = () => {
//   return (
//     <View>
//       <Text>select</Text>
//     </View>
//   )
// }

// export default role

// const styles = StyleSheet.create({})

// app/(onboarding)/role-selection.tsx
import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase/supabase';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/auth/AuthContext';
import { TOAST, useShowToast } from '@/components/ui/toast/useToast';

// Define the user roles
enum UserRole {
  HOST = 'host',
  CLIENT = 'client'
}

export default function role() {
  const showToast = useShowToast();

  const { authState: {user} } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoContent, setInfoContent] = useState<{ title: string; content: string }>({
    title: '',
    content: ''
  });
  
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = colorScheme === 'light' ? Colors.light.icon : Colors.dark.icon;
  
  const hostInfo = {
    title: 'Becoming a Host',
    content: 'As a host, youll provide emotional and social support to others based on your own experiences. Hosts listen, share wisdom, and help others navigate their challenges. This role is ideal if you have experience youd like to share to help others, and youre willing to dedicate time to supporting the community. Hosts undergo additional verification and training to ensure they can provide appropriate support.'
  };
  
  const clientInfo = {
    title: 'Joining as a Client',
    content: 'As a client, youll be able to connect with supportive hosts who have experiences similar to yours. This role allows you to seek guidance, share your challenges, and learn from others who understand what youre going through. Clients can browse hosts by shared experiences, send connection requests, and engage in meaningful conversations in a safe, supportive environment.'
  };
  
  const showInfoModal = (role: UserRole) => {
    const content = role === UserRole.HOST ? hostInfo : clientInfo;
    setInfoContent(content);
    setInfoModalVisible(true);
  };
  
  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      showToast(TOAST.INFO, 'Please select a role to continue')
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error('User not authenticated');
      
      // Save the role to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: selectedRole,
          updated_at: new Date(),
        });
        
      if (error) throw error;
      
      // Continue to the next step in onboarding
      router.replace('/(onboard)/profile');
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save your selection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
            selectedRole === UserRole.HOST && styles.selectedCard
          ]}
          onPress={() => setSelectedRole(UserRole.HOST)}
          activeOpacity={0.8}
        >
          <View style={styles.optionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>Host</ThemedText>
            <TouchableOpacity
              onPress={() => showInfoModal(UserRole.HOST)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
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
            selectedRole === UserRole.CLIENT && styles.selectedCard
          ]}
          onPress={() => setSelectedRole(UserRole.CLIENT)}
          activeOpacity={0.8}
        >
          <View style={styles.optionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>Client</ThemedText>
            <TouchableOpacity
              onPress={() => showInfoModal(UserRole.CLIENT)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialIcons name="info-outline" size={22} color={iconColor} />
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.optionDescription}>
            Connect with others for support and understanding
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
      
      <Button
        size="lg"
        action="primary"
        style={styles.button}
        onPress={handleContinue}
        disabled={isLoading || !selectedRole}
      >
        <Text>Continue</Text>
      </Button>
      
      {/* Info Modal */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
      >
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
              onPress={() => setInfoModalVisible(false)}
            >
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
    borderColor: '#DDDDDD',
    borderRadius: 12,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  selectedCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
  },
  optionDescription: {
    lineHeight: 22,
  },
  button: {
    marginTop: 'auto',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    lineHeight: 24,
    marginBottom: 8,
  },
  modalButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
});