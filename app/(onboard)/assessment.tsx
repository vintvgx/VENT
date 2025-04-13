// app/(onboard)/assessment.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button } from "@/components/ui/button";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase/supabase";
import { router, useRouter } from "expo-router";
import { useAuth } from "@/context/auth/AuthContext";
import { OnboardingStep } from "@/types/auth";
import { TOAST, useShowToast } from "@/components/ui/toast/useToast";
import TextQuestion from "../components/assessment/TextQuestion";
import { AssessmentQuestion, AssessmentState, QuestionType } from "@/types/user/onboard";
import MultipleChoiceQuestion from "../components/assessment/MultipleChoiceQuestion";
import ScaleQuestion from "../components/assessment/ScaleQuestion";
import CheckboxQuestion from "../components/assessment/CheckboxQuestion";
import { ThemedView } from "@/components/ThemedView";
import { UserType } from "@/types/user/user";
import { CLIENT_QUESTIONS, COMMON_QUESTIONS, HOST_QUESTIONS } from "@/utils/auth/assessment_questions";

const AssessmentScreen = () => {
  const router = useRouter();
  const { authState: {user, profile}, setOnboardingStep, updateUserProfile } = useAuth();
  const [assessment, setAssessment] = useState<AssessmentState>({
    answers: {},
    currentQuestionIndex: 0,
    isComplete: false
  });

  // Determine which questions to show based on user type
  const role = profile?.role;
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  
  useEffect(() => {
    // Combine appropriate questions based on user type
    let assessmentQuestions: AssessmentQuestion[] = [];
    
    if (role === UserType.HOST) {
      assessmentQuestions = [...HOST_QUESTIONS];
    } else if (role === UserType.CLIENT) {
      assessmentQuestions = [...CLIENT_QUESTIONS];
    }
    
    // Add common questions for all user types
    assessmentQuestions = [...assessmentQuestions, ...COMMON_QUESTIONS];
    
    setQuestions(assessmentQuestions);
  }, [role]);

  const currentQuestion = questions[assessment.currentQuestionIndex];

  const handleAnswer = (questionId: string, answer: any) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));
  };

  const goToNextQuestion = () => {
    if (assessment.currentQuestionIndex < questions.length - 1) {
      setAssessment(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      // Assessment is complete
      setAssessment(prev => ({
        ...prev,
        isComplete: true
      }));
      
      // Save assessment data
      saveAssessmentData();
    }
  };

  const goToPreviousQuestion = () => {
    if (assessment.currentQuestionIndex > 0) {
      setAssessment(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const saveAssessmentData = async () => {
    try {
      // Format the assessment data according to your user model
      const assessmentData = formatAssessmentData(assessment.answers);
      
      // TODO update function of uploading assessment data (include in profile object or create table ? )
      // Update user profile with assessment data
      // await updateUserProfile();
      
      // Mark onboarding as completed
      await setOnboardingStep(OnboardingStep.COMPLETED);
      
      // Navigate to home/dashboard
      router.replace('/(app)/home');
    } catch (error) {
      console.error('Error saving assessment data:', error);
      // Handle error appropriately
    }
  };

  const formatAssessmentData = (answers: Record<string, any>) => {
    // Transform answers into the format needed for your user profile
    // This will vary based on your data model
    
    if (role === UserType.HOST) {
      return {
        profile: {
          // Host-specific profile updates
          yearsOfExperience: answers.host_experience,
          specialties: answers.host_specialties,
          supportStyle: answers.host_approach,
          publicBio: answers.host_bio,
          preferredCommunicationStyle: answers.communication_preference
        }
      };
    } else {
      return {
        onboardSelections: {
          // Client-specific profile updates
          currentSupportNeeds: answers.client_needs,
          shortTermGoals: [answers.client_goals],
          previousSupport: [answers.client_experience],
          preferredHostStyle: answers.client_style,
          preferredCommunicationStyle: answers.communication_preference
        }
      };
    }
  };

  // Render the appropriate question component based on question type
  const renderQuestionComponent = () => {
    if (!currentQuestion) return null;

    const questionProps = {
      question: currentQuestion,
      value: assessment.answers[currentQuestion.id] || null,
      onChange: (value: any) => handleAnswer(currentQuestion.id, value)
    };

    switch (currentQuestion.type) {
      case QuestionType.TEXT:
        return <TextQuestion {...questionProps} />;
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoiceQuestion {...questionProps} />;
      case QuestionType.SCALE:
        return <ScaleQuestion {...questionProps} />;
      case QuestionType.CHECKBOX:
        return <CheckboxQuestion {...questionProps} />;
      default:
        return null;
    }
  };

  // If assessment is complete, show a summary or completion screen
  if (assessment.isComplete) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Assessment Complete!</ThemedText>
        <ThemedText style={styles.text}>Thank you for completing your assessment.</ThemedText>
        <Button
          style={styles.button}
          onPress={() => saveAssessmentData()}
        >
          <Text>Finish Onboarding</Text>
        </Button>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.container}>
          {currentQuestion && (
            <>
              <ThemedText style={styles.title}>{currentQuestion.question}</ThemedText>
              
              {currentQuestion.description && (
                <ThemedText style={styles.description}>{currentQuestion.description}</ThemedText>
              )}
              
              <View style={styles.questionContainer}>
                {renderQuestionComponent()}
              </View>
              
              <View style={styles.navigationContainer}>
                <Button
                  variant="outline"
                  style={[styles.navButton, assessment.currentQuestionIndex === 0 && styles.disabledButton]}
                  disabled={assessment.currentQuestionIndex === 0}
                  onPress={goToPreviousQuestion}
                >
                  <Text>Previous</Text>
                </Button>
                
                <Button
                  style={styles.navButton}
                  disabled={currentQuestion.required && !assessment.answers[currentQuestion.id]}
                  onPress={goToNextQuestion}
                >
                  <Text>
                    {assessment.currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  </Text>
                </Button>
              </View>
              
              <ThemedText style={styles.progress}>
                Question {assessment.currentQuestionIndex + 1} of {questions.length}
              </ThemedText>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  questionContainer: {
    marginVertical: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  navButton: {
    flex: 0.45,
  },
  disabledButton: {
    opacity: 0.5,
  },
  progress: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  button: {
    marginTop: 24,
  },
  text: {
    fontSize: 16,
    marginVertical: 12,
  }
});

export default AssessmentScreen;