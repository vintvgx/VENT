// app/(onboarding)/assessment.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
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

// Sample assessment questions
const ASSESSMENT_QUESTIONS = [
  {
    id: "interests",
    question: "What topics are you interested in discussing?",
    options: [
      "Mental Health",
      "Physical Health",
      "Life Experiences",
      "Career",
      "Relationships",
      "Hobbies",
    ],
    multiSelect: true,
  },
  {
    id: "support_type",
    question: "What type of support are you looking for?",
    options: [
      "Someone to listen",
      "Advice from others",
      "Sharing my experiences",
      "Learning from others",
    ],
    multiSelect: true,
  },
  {
    id: "comfort_level",
    question: "How comfortable are you with sharing personal experiences?",
    options: [
      "Very comfortable",
      "Somewhat comfortable",
      "Neutral",
      "Somewhat uncomfortable",
      "Very uncomfortable",
    ],
    multiSelect: false,
  },
];

export default function AssessmentScreen() {
  const showToast = useShowToast();

  const {
    authState: { user },
    setOnboardingStep,
  } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];

  const isOptionSelected = (option: string) => {
    return answers[currentQuestion.id]?.includes(option) || false;
  };

  const toggleOption = (option: string) => {
    setAnswers((prev) => {
      const currentSelections = prev[currentQuestion.id] || [];

      if (currentQuestion.multiSelect) {
        // For multi-select, toggle the selection
        return {
          ...prev,
          [currentQuestion.id]: currentSelections.includes(option)
            ? currentSelections.filter((item) => item !== option)
            : [...currentSelections, option],
        };
      } else {
        // For single-select, replace the selection
        return {
          ...prev,
          [currentQuestion.id]: [option],
        };
      }
    });
  };

  const canProceed = () => {
    // Check if current question has at least one answer
    return answers[currentQuestion.id]?.length > 0;
  };

  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const completeAssessment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error("User not authenticated");

      // Save assessment answers to Supabase
      const { error } = await supabase.from("assessments").upsert({
        user_id: user.id,
        answers: answers,
        completed: true,
        completed_at: new Date(),
      });

      if (error) throw error;

      try {
        // Mark onboarding as complete
        await setOnboardingStep(OnboardingStep.COMPLETED);
      } catch (stepError: unknown) {
        console.error("Error updating onboarding step:", stepError);
        showToast(TOAST.ERROR, `Error updating onboarding step: ${stepError}`)
      }

      // Navigate to home screen
      router.replace("/(app)/home");
    } catch (error: unknown) {
      console.error("Error saving assessment:", error);
      setError("Failed to save your responses. Please try again.");
      showToast(TOAST.ERROR, "Failed to save your responses. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  const isLastQuestion =
    currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Quick Assessment
      </ThemedText>

      <ThemedText style={styles.description}>
        Help us understand your needs better so we can connect you with the
        right community.
      </ThemedText>

      <View style={styles.questionContainer}>
        <ThemedText style={styles.questionText}>
          {currentQuestion.question}
        </ThemedText>

        <ThemedText style={styles.helperText}>
          {currentQuestion.multiSelect
            ? "Select all that apply"
            : "Select one option"}
        </ThemedText>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                isOptionSelected(option) && styles.optionSelected,
              ]}
              onPress={() => toggleOption(option)}>
              <ThemedText
                style={[
                  styles.optionText,
                  isOptionSelected(option) && styles.optionTextSelected,
                ]}>
                {option}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <View style={styles.buttonsContainer}>
        {currentQuestionIndex > 0 && (
          <Button
            variant="outline"
            style={styles.backButton}
            onPress={handleBack}
            disabled={isLoading}>
            <Text>Back</Text>
          </Button>
        )}

        <Button
          size="lg"
          action="primary"
          style={[
            styles.nextButton,
            currentQuestionIndex === 0 && styles.fullWidthButton,
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text>{isLastQuestion ? "Complete" : "Next"}</Text>
          )}
        </Button>
      </View>
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
    marginBottom: 32,
    lineHeight: 22,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    padding: 16,
  },
  optionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    color: "#007AFF",
    fontWeight: "500",
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
});
