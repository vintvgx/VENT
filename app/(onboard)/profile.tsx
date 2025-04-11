import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from "react-native";
import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase/supabase";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/auth";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
import { Calendar, ChevronDown } from 'lucide-react-native';

export default function ProfileScreen() {
  const showToast = useShowToast();

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Populate fields with existing data if available
  useEffect(() => {
    if (user?.user_metadata) {
      const metadata = user.user_metadata;
      if (metadata.firstName) setFirstName(metadata.firstName);
      if (metadata.lastName) setLastName(metadata.lastName);
      if (metadata.username) setUsername(metadata.username);
      if (metadata.phoneNumber) setPhoneNumber(metadata.phoneNumber);
      if (metadata.createdAt) {
        try {
          setDateOfBirth(new Date(metadata.createdAt));
        } catch (e) {
          console.error("Invalid date format:", e);
        }
      }
    }
  }, [user]);

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    
    // Add additional validation rules if needed
    // For example: only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return false;
    }
    
    setUsernameError(null);
    return true;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDateSelect = (date: Date) => {
    setDateOfBirth(date);
    setShowDatePicker(false);
  };

  // Simple date picker modal - in a real app, you might want to use a library like @react-native-community/datetimepicker
  const renderDatePickerModal = () => {
    // This is a simplified date picker. In a production app, you would use a proper date picker component
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    const [year, setYear] = useState(dateOfBirth?.getFullYear() || new Date().getFullYear() - 20);
    const [month, setMonth] = useState(dateOfBirth?.getMonth() || 0);
    const [day, setDay] = useState(dateOfBirth?.getDate() || 1);
    
    const confirmDate = () => {
      const newDate = new Date(year, month, day);
      handleDateSelect(newDate);
    };
    
    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <ThemedText style={styles.datePickerTitle}>Select Date of Birth</ThemedText>
            
            <View style={styles.datePickerControls}>
              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Month</ThemedText>
                <ScrollView style={styles.datePickerScroll}>
                  {months.map((monthName, index) => (
                    <TouchableOpacity 
                      key={monthName} 
                      style={[
                        styles.datePickerItem,
                        month === index && styles.datePickerItemSelected
                      ]}
                      onPress={() => setMonth(index)}
                    >
                      <ThemedText style={month === index ? styles.datePickerTextSelected : {}}>
                        {monthName}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Day</ThemedText>
                <ScrollView style={styles.datePickerScroll}>
                  {days.map((d) => (
                    <TouchableOpacity 
                      key={d} 
                      style={[
                        styles.datePickerItem,
                        day === d && styles.datePickerItemSelected
                      ]}
                      onPress={() => setDay(d)}
                    >
                      <ThemedText style={day === d ? styles.datePickerTextSelected : {}}>
                        {d}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <ThemedText style={styles.datePickerLabel}>Year</ThemedText>
                <ScrollView style={styles.datePickerScroll}>
                  {years.map((y) => (
                    <TouchableOpacity 
                      key={y} 
                      style={[
                        styles.datePickerItem,
                        year === y && styles.datePickerItemSelected
                      ]}
                      onPress={() => setYear(y)}
                    >
                      <ThemedText style={year === y ? styles.datePickerTextSelected : {}}>
                        {y}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.datePickerButtons}>
              <Button 
                size="sm" 
                action="secondary" 
                onPress={() => setShowDatePicker(false)}
                style={styles.datePickerButton}
              >
                <Text>Cancel</Text>
              </Button>
              <Button 
                size="sm" 
                action="primary" 
                onPress={confirmDate}
                style={styles.datePickerButton}
              >
                <Text>Confirm</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const saveProfile = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Validate username first as it's required
    if (!validateUsername(username)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User not authenticated");

      // Create profile in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        updated_at: new Date(),
      });

      if (error) throw error;

      try {
        // Move to next step
        await setOnboardingStep(OnboardingStep.ROLE);
      } catch (stepError: unknown) {
        console.error("Error updating onboarding step:", stepError);
        showToast(TOAST.ERROR, `Error updating onboarding step: ${stepError}`);
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.container,
            keyboardVisible && styles.keyboardVisibleContainer
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="subtitle" style={styles.title}>
            Set Up Your Profile
          </ThemedText>

          <ThemedText style={styles.description}>
            Please complete your profile information. This helps us personalize your experience and connect you with others.
          </ThemedText>

          <View style={styles.formContainer}>
            {/* Username - Most prominent as required */}
            <View style={styles.usernameContainer}>
              <ThemedText style={styles.usernameLabel}>Username *</ThemedText>
              <TextInput
                style={[styles.input, usernameError && styles.inputError]}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  validateUsername(text);
                }}
                placeholder="Choose a unique username"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {usernameError && (
                <ThemedText style={styles.errorText}>{usernameError}</ThemedText>
              )}
            </View>

            {/* First Name and Last Name in a row */}
            <View style={styles.nameRow}>
              <View style={styles.halfInput}>
                <ThemedText style={styles.label}>First Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              
              <View style={styles.halfInput}>
                <ThemedText style={styles.label}>Last Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Date of Birth</ThemedText>
              <TouchableOpacity 
                style={styles.dateInputContainer}
                onPress={() => {
                  Keyboard.dismiss();
                  setShowDatePicker(true);
                }}
              >
                <Text style={styles.dateInputText}>
                  {dateOfBirth ? formatDate(dateOfBirth) : "Select your date of birth"}
                </Text>
                <Calendar size={20} color="#666" />
              </TouchableOpacity>
              {renderDatePickerModal()}
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Your phone number"
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          <Button
            size="lg"
            action="primary"
            style={[styles.button, keyboardVisible && styles.keyboardVisibleButton]}
            onPress={saveProfile}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text>Continue</Text>
            )}
          </Button>
          
          {/* Extra space at the bottom to ensure scrollability */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100, // Extra padding at the bottom
  },
  keyboardVisibleContainer: {
    paddingBottom: Platform.OS === 'ios' ? 200 : 160, // Even more padding when keyboard is visible
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    marginBottom: 24,
    lineHeight: 22,
    color: "#666",
  },
  formContainer: {
    marginBottom: 16,
  },
  usernameContainer: {
    marginBottom: 24,
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  usernameLabel: {
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfInput: {
    width: "48%",
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
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    marginTop: 4,
    fontSize: 12,
  },
  button: {
    marginTop: 24,
  },
  keyboardVisibleButton: {
    marginTop: 16,
  },
  dateInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  dateInputText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  datePickerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  datePickerScroll: {
    height: 200,
  },
  datePickerItem: {
    padding: 10,
    alignItems: "center",
  },
  datePickerItemSelected: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
  },
  datePickerTextSelected: {
    fontWeight: "700",
    color: "#007AFF",
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  bottomPadding: {
    height: 40, // Extra space at the bottom
  },
});