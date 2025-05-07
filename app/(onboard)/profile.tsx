"use client";

import { useState, useEffect, useRef } from "react";
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
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase/supabase";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/authModel";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
import { Calendar, Check } from "lucide-react-native";
import React from "react";
import { ProfileStep, STORAGE_KEYS } from "@/types/user/profileModel";
import { ProfileController } from "@/controller/onboard/ProfileController";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfileScreen() {
  const queryClient = useQueryClient();

  const showToast = useShowToast();

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [stayAnonymous, setStayAnonymous] = useState(false);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isUnderage, setIsUnderage] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState<ProfileStep>(
    ProfileStep.NAME_DOB
  );
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Date picker state
  const [pickerYear, setPickerYear] = useState(
    dateOfBirth?.getFullYear() || new Date().getFullYear() - 20
  );
  const [pickerMonth, setPickerMonth] = useState(dateOfBirth?.getMonth() || 0);
  const [pickerDay, setPickerDay] = useState(dateOfBirth?.getDate() || 1);

  // Load saved data on initial render
  useEffect(() => {
    loadSavedData();
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
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
          const dob = new Date(metadata.createdAt);
          setDateOfBirth(dob);
          setPickerYear(dob.getFullYear());
          setPickerMonth(dob.getMonth());
          setPickerDay(dob.getDate());
          ProfileController.checkAge(dob);
        } catch (e) {
          console.error("Invalid date format:", e);
        }
      }
    }
  }, [user]);

  // Load saved data from AsyncStorage
  const loadSavedData = async () => {
    try {
      // Get all saved values
      const [
        savedStep,
        savedFirstName,
        savedLastName,
        savedDOB,
        savedAnonymous,
        savedUsername,
        savedPhone,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE_STEP),
        AsyncStorage.getItem(STORAGE_KEYS.FIRST_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.DATE_OF_BIRTH),
        AsyncStorage.getItem(STORAGE_KEYS.STAY_ANONYMOUS),
        AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
        AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER),
      ]);

      // Set values if they exist
      if (savedFirstName) setFirstName(savedFirstName);
      if (savedLastName) setLastName(savedLastName);
      if (savedAnonymous) setStayAnonymous(savedAnonymous === "true");
      if (savedUsername) setUsername(savedUsername);
      if (savedPhone) setPhoneNumber(savedPhone);

      // Handle date of birth
      if (savedDOB) {
        const dob = new Date(savedDOB);
        setDateOfBirth(dob);
        setPickerYear(dob.getFullYear());
        setPickerMonth(dob.getMonth());
        setPickerDay(dob.getDate());
        ProfileController.checkAge(dob);
      }

      // Navigate to the appropriate step
      if (savedStep) {
        const step = Number.parseInt(savedStep);
        if (!isNaN(step)) {
          // Determine which step to navigate to based on completed data
          let targetStep = step as ProfileStep;

          // If we have name and DOB but no username, go to username step
          if (targetStep >= ProfileStep.USERNAME && !savedUsername) {
            targetStep = ProfileStep.USERNAME;
          }
          // If we have username but no phone, go to phone step
          else if (targetStep >= ProfileStep.PHONE_NUMBER && !savedPhone) {
            targetStep = ProfileStep.PHONE_NUMBER;
          }

          animateToStep(targetStep);
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  // Animate between steps
  const animateToStep = (step: ProfileStep) => {
    Animated.timing(slideAnim, {
      toValue: -step * Dimensions.get("screen").width, // Slide left based on step
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCurrentStep(step);
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError("Username is required");
      return false;
    }

    // Add additional validation rules if needed
    // For example: only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      return false;
    }

    setUsernameError(null);
    return true;
  };

  const handleDateSelect = (date: Date) => {
    setDateOfBirth(date);
    setShowDatePicker(false);
    ProfileController.checkAge(date);
  };

  // Simple date picker modal - in a real app, you might want to use a library like @react-native-community/datetime picker
  const renderDatePickerModal = () => {
    // This is a simplified date picker. In a production app, you would use a proper date picker component
    const years = Array.from(
      { length: 100 },
      (_, i) => new Date().getFullYear() - i
    );
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const confirmDate = () => {
      const newDate = new Date(pickerYear, pickerMonth, pickerDay);
      handleDateSelect(newDate);
    };

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <ThemedText style={styles.datePickerTitle}>
              Select Date of Birth
            </ThemedText>

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
                        pickerMonth === index && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setPickerMonth(index)}>
                      <ThemedText
                        style={
                          pickerMonth === index
                            ? styles.datePickerTextSelected
                            : {}
                        }>
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
                        pickerDay === d && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setPickerDay(d)}>
                      <ThemedText
                        style={
                          pickerDay === d ? styles.datePickerTextSelected : {}
                        }>
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
                        pickerYear === y && styles.datePickerItemSelected,
                      ]}
                      onPress={() => setPickerYear(y)}>
                      <ThemedText
                        style={
                          pickerYear === y ? styles.datePickerTextSelected : {}
                        }>
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
                style={styles.datePickerButton}>
                <Text>Cancel</Text>
              </Button>
              <Button
                size="sm"
                action="primary"
                onPress={confirmDate}
                style={styles.datePickerButton}>
                <Text>Confirm</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleNextStep = async () => {
    if (currentStep === ProfileStep.NAME_DOB) {
      // Validate DOB is selected
      if (!dateOfBirth && !stayAnonymous) {
        showToast(TOAST.ERROR, "Please select your date of birth");
        return;
      }

      // Check age if DOB is provided
      if (dateOfBirth && !ProfileController.checkAge(dateOfBirth)) {
        showToast(
          TOAST.INFO,
          "Users must be over the age of 18 to use VENT :("
        );
        return; // Don't proceed if underage
      }

      // Save progress and move to next step
      await ProfileController.saveToStorage(ProfileStep.NAME_DOB, {
        firstName,
        lastName,
        dateOfBirth,
        stayAnonymous,
        username,
        phoneNumber,
      });

      animateToStep(ProfileStep.USERNAME);
    } else if (currentStep === ProfileStep.USERNAME) {
      // Validate username
      if (!validateUsername(username)) {
        return;
      }

      // Save progress and move to next step
      await ProfileController.saveToStorage(ProfileStep.USERNAME, {
        firstName,
        lastName,
        dateOfBirth,
        stayAnonymous,
        username,
        phoneNumber,
      });
      animateToStep(ProfileStep.PHONE_NUMBER);
    } else {
      // Final step - save profile
      await ProfileController.saveToStorage(ProfileStep.PHONE_NUMBER, {
        firstName,
        lastName,
        dateOfBirth,
        stayAnonymous,
        username,
        phoneNumber,
      });

      saveProfile();
    }
  };

  const handlePrevStep = () => {
    if (currentStep === ProfileStep.USERNAME) {
      animateToStep(ProfileStep.NAME_DOB);
    } else if (currentStep === ProfileStep.PHONE_NUMBER) {
      animateToStep(ProfileStep.USERNAME);
    }
  };

  const saveProfile = async () => {
    // Dismiss keyboard
    Keyboard.dismiss();

    // Validate username as it's required
    if (!validateUsername(username)) {
      animateToStep(ProfileStep.USERNAME);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User not authenticated");

      console.log("Date of birth", dateOfBirth);

      // Create profile in Supabase
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        first_name: stayAnonymous ? "" : firstName.trim(),
        last_name: stayAnonymous ? "" : lastName.trim(),
        username: username.trim(),
        phone_number: phoneNumber.trim(),
        dob: dateOfBirth ? dateOfBirth.toISOString() : null,
        is_anon: stayAnonymous,
        updated_at: new Date(),
      });

      if (error) {
        throw error;
      } else {
        // re-fetch profile data
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }

      try {
        // Clear saved progress data since onboarding is complete
        await Promise.all(
          Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key))
        );

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

  // Step progress indicator
  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[0, 1, 2].map((step) => (
          <View
            key={step}
            style={[
              styles.stepDot,
              currentStep === step ? styles.activeStepDot : {},
            ]}
          />
        ))}
      </View>
    );
  };

  // Toggle for anonymous mode
  const renderAnonymousToggle = () => {
    return (
      <TouchableOpacity
        style={styles.anonymousToggle}
        onPress={() => setStayAnonymous(!stayAnonymous)}>
        <View
          style={[
            styles.toggleBox,
            stayAnonymous ? styles.toggleBoxActive : {},
          ]}>
          {stayAnonymous && <Check size={16} color="#FFFFFF" />}
        </View>
        <ThemedText style={styles.toggleText}>
          Stay anonymous (hide my name)
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Determine if the next button should be disabled
  const isNextButtonDisabled = () => {
    if (isLoading) return true;

    if (currentStep === ProfileStep.NAME_DOB) {
      // Disable if underage or if DOB is required but not provided
      return isUnderage || (!stayAnonymous && !dateOfBirth);
    }

    if (currentStep === ProfileStep.USERNAME) {
      // Disable if username is invalid
      return !username || !!usernameError;
    }

    return false;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            keyboardVisible && styles.keyboardVisibleContainer,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle" style={styles.title}>
            Set Up Your Profile
          </ThemedText>

          <ThemedText style={styles.description}>
            Please complete your profile information. This helps us personalize
            your experience and connect you with others.
          </ThemedText>

          {renderStepIndicator()}

          <View style={styles.formContainer}>
            <Animated.View
              style={[
                styles.stepContainer,
                { transform: [{ translateX: slideAnim }] },
              ]}>
              {/* Step 1: Name and DOB */}
              <View style={styles.step}>
                <View style={styles.nameContainer}>
                  <ThemedText style={styles.sectionTitle}>
                    What's your name?
                  </ThemedText>

                  {!stayAnonymous && (
                    <>
                      <View style={styles.nameRow}>
                        <View style={styles.halfInput}>
                          <ThemedText style={styles.label}>
                            First Name
                          </ThemedText>
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
                          <ThemedText style={styles.label}>
                            Last Name
                          </ThemedText>
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
                    </>
                  )}

                  {renderAnonymousToggle()}
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.sectionTitle}>
                    When were you born?
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.dateInputContainer}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowDatePicker(true);
                    }}>
                    <Text style={styles.dateInputText}>
                      {dateOfBirth
                        ? ProfileController.formatDate(dateOfBirth)
                        : "Select your date of birth"}
                    </Text>
                    <Calendar size={20} color="#666" />
                  </TouchableOpacity>
                  {isUnderage && (
                    <ThemedText style={styles.errorText}>
                      You must be at least 18 years old to use this app
                    </ThemedText>
                  )}
                  {renderDatePickerModal()}
                </View>
              </View>

              {/* Step 2: Username */}
              <View style={styles.step}>
                <View style={styles.usernameContainer}>
                  <ThemedText style={styles.sectionTitle}>
                    Choose a username
                  </ThemedText>
                  <ThemedText style={styles.usernameDescription}>
                    This is how others will see you in the community.
                  </ThemedText>
                  <TextInput
                    style={[styles.input, usernameError && styles.inputError]}
                    value={username}
                    autoCorrect={false}
                    autoComplete="username"
                    autoFocus={true}
                    onChangeText={(text) => {
                      setUsername(text);
                      validateUsername(text);
                    }}
                    placeholder="Choose a unique username"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                  {usernameError && (
                    <ThemedText style={styles.errorText}>
                      {usernameError}
                    </ThemedText>
                  )}
                </View>
              </View>

              {/* Step 3: Phone Number */}
              <View style={styles.step}>
                <View style={styles.phoneContainer}>
                  <ThemedText style={styles.sectionTitle}>
                    What's your phone number?
                  </ThemedText>
                  <ThemedText style={styles.phoneDescription}>
                    We'll use this to help you connect with others.
                  </ThemedText>
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
            </Animated.View>
          </View>

          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <Button
                size="lg"
                action="secondary"
                style={[styles.backButton]}
                onPress={handlePrevStep}
                disabled={isLoading}>
                <Text>Back</Text>
              </Button>
            )}

            <Button
              size="lg"
              action="primary"
              style={[
                styles.button,
                currentStep > 0 ? styles.nextButton : styles.fullButton,
                keyboardVisible && styles.keyboardVisibleButton,
                isNextButtonDisabled() && styles.disabledButton,
              ]}
              onPress={handleNextStep}
              disabled={isNextButtonDisabled()}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text>
                  {currentStep === ProfileStep.PHONE_NUMBER
                    ? "Finish"
                    : "Continue"}
                </Text>
              )}
            </Button>
          </View>

          {/* Extra space at the bottom to ensure user can scroll */}
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
    paddingBottom: Platform.OS === "ios" ? 120 : 100, // Extra padding at the bottom
  },
  keyboardVisibleContainer: {
    paddingBottom: Platform.OS === "ios" ? 200 : 160, // Even more padding when keyboard is visible
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
    color: "#666",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CCCCCC",
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: "#007AFF",
    width: 24,
  },
  formContainer: {
    marginBottom: 16,
    overflow: "hidden",
  },
  stepContainer: {
    flexDirection: "row",
    width: "300%", // 3 steps side by side
  },
  step: {
    width: "33.333%", // Each step takes 1/3 of the container
    paddingRight: 16,
  },
  nameContainer: {
    marginBottom: 24,
  },
  usernameContainer: {
    marginBottom: 24,
  },
  phoneContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  usernameDescription: {
    marginBottom: 12,
    color: "#666",
  },
  phoneDescription: {
    marginBottom: 12,
    color: "#666",
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
  buttonContainer: {
    flexDirection: "row",
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  backButton: {
    marginRight: 8,
    flex: 0.4,
  },
  nextButton: {
    flex: 0.6,
  },
  fullButton: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
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
  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  toggleBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleBoxActive: {
    backgroundColor: "#007AFF",
  },
  toggleText: {
    fontSize: 14,
    color: "#333",
  },
  bottomPadding: {
    height: 40, // Extra space at the bottom
  },
});
