// app/(onboard)/assessment.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthContext";
import { ToastService } from "@/services/ToastService";
import { OnboardingStep } from "@/types/auth";
import { AssessmentQuestion, AssessmentState, QuestionType } from "@/types/user/onboard";
import { UserType } from "@/types/user/user";
import { CLIENT_QUESTIONS, COMMON_QUESTIONS, HOST_QUESTIONS } from "@/utils/auth/assessment_questions";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { AssessmentController } from '../../controller/onboard/AssessmentController';
import CheckboxQuestion from "../components/assessment/CheckboxQuestion";
import MultipleChoiceQuestion from "../components/assessment/MultipleChoiceQuestion";
import ScaleQuestion from "../components/assessment/ScaleQuestion";
import TextQuestion from "../components/assessment/TextQuestion";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AssessmentScreen = () => {
  const { authState: {user, profile}, setOnboardingStep } = useAuth();

  const router = useRouter();

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

  const handleAnswer = async (questionId: string, answer: any) => {
    setAssessment(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    }));

    // Save current answer to Supabase 
    try {
    await AssessmentController.saveCurrentAnswer(questionId, answer, user, questions);
    } catch (e: unknown) {
      console.log("Error saving answer to supabase:", e)
      ToastService.error(`Error saving answer to supabase: ${e}`)
    }
  };

  const goToNextQuestion = () => {
    // check if assessment current index is at the last question
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
      
      // Mark onboarding as completed
      await setOnboardingStep(OnboardingStep.COMPLETED);

      // Delete onboardingStep ref in storage
      await AsyncStorage.removeItem("onboardingStep");
      
      // Navigate to home/dashboard
      router.replace('/(app)/home');
    } catch (error) {
      console.error('Error saving assessment data:', error);
      // Handle error appropriately
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
                  disabled={!AssessmentController.isValidAnswer(currentQuestion, assessment.answers[currentQuestion.id])}  
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