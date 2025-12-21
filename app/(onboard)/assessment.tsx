/**
 * Assessment Screen for VENT App
 * 
 */
import { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@/context/auth/AuthContext"
import { useUpdateProfileMutation } from "@/hooks/mutations/auth/useUpdateProfileMutation"
import { useProfile } from "@/hooks/queries/auth/useProfileQuery"
import { useRouter } from "expo-router"
import { AssessmentController } from "@/controller/onboard/AssessmentController"
import { ToastService } from "@/services/ToastService"
import { OnboardingStep } from "@/types/authModel"
import { AssessmentQuestion, AssessmentState, QuestionType } from "@/types/user/onboardModel"
import { UserType } from "@/types/user/user"
import { CLIENT_QUESTIONS, COMMON_QUESTIONS, HOST_QUESTIONS } from "@/utils/auth/assessment_questions"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function AssessmentScreen() {
  const { authState: { user }, setOnboardingStep } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { mutateAsync: updateProfileMutation } = useUpdateProfileMutation()
  const router = useRouter()

  const [assessment, setAssessment] = useState<AssessmentState>({
    answers: {},
    currentQuestionIndex: 0,
    isComplete: false,
  })

  const role = profile?.role
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])

  useEffect(() => {
    // Combine appropriate questions based on user type
    let assessmentQuestions: AssessmentQuestion[] = []
    
    if (role === UserType.HOST) {
      assessmentQuestions = [...HOST_QUESTIONS]
    } else if (role === UserType.CLIENT) {
      assessmentQuestions = [...CLIENT_QUESTIONS]
    }
    
    // Add common questions for all user types
    assessmentQuestions = [...assessmentQuestions, ...COMMON_QUESTIONS]
    
    setQuestions(assessmentQuestions)
  }, [role])

  const currentQuestion = questions[assessment.currentQuestionIndex]

  const handleAnswer = async (questionId: string, answer: any) => {
    setAssessment((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }))

    // Save current answer to Supabase
    try {
      await AssessmentController.saveCurrentAnswer(questionId, answer, user, questions)
    } catch (e: unknown) {
      console.log("Error saving answer to supabase:", e)
      ToastService.error(`Error saving answer to supabase: ${e}`)
    }
  }

  const goToNextQuestion = () => {
    if (assessment.currentQuestionIndex < questions.length - 1) {
      setAssessment((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }))
    } else {
      setAssessment((prev) => ({
        ...prev,
        isComplete: true,
      }))
    }
  }

  const goToPreviousQuestion = () => {
    if (assessment.currentQuestionIndex > 0) {
      setAssessment((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }))
    }
  }

  const saveAssessmentData = async () => {
    try {
      // Update the profile to mark assessment as completed
      await updateProfileMutation({
        assessment_completed: true
      })
      
      // Mark onboarding as completed
      await setOnboardingStep(OnboardingStep.COMPLETED)

      // Navigate to home/dashboard
      await router.replace('/(app)/home')

      // Delete onboardingStep ref in storage
      await AsyncStorage.removeItem("onboardingStep")
    } catch (error) {
      console.error("Error saving assessment data:", error)
    }
  }


  const renderQuestionComponent = () => {
    if (!currentQuestion) return null

    const currentAnswer = assessment.answers[currentQuestion.id]

    switch (currentQuestion.type) {
      case QuestionType.SCALE:
        // For SCALE questions, options is an array of strings like ["0-1", "1-3", "3-5", "5-10", "10+"]
        // Render them as selectable option buttons similar to multiple choice
        const selectedScale = currentAnswer || ""
        return (
          <View className="gap-2.5">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedScale === option
              return (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center rounded-xl p-4 border-2 ${
                    isSelected ? "bg-indigo-50 border-indigo-500" : "bg-gray-50 border-transparent"
                  }`}
                  onPress={() => handleAnswer(currentQuestion.id, option)}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-lg bg-white justify-center items-center mr-3.5">
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={isSelected ? "#6366F1" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold mb-0.5 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {option}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-indigo-50 justify-center items-center">
                      <Ionicons name="checkmark" size={16} color="#6366F1" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        )

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <View className="gap-2.5">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = currentAnswer === option
              return (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center rounded-xl p-4 border-2 ${
                    isSelected ? "bg-indigo-50 border-indigo-500" : "bg-gray-50 border-transparent"
                  }`}
                  onPress={() => handleAnswer(currentQuestion.id, option)}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-lg bg-white justify-center items-center mr-3.5">
                    <Ionicons
                      name="ellipse-outline"
                      size={22}
                      color={isSelected ? "#6366F1" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold mb-0.5 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {option}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-indigo-50 justify-center items-center">
                      <Ionicons name="checkmark" size={16} color="#6366F1" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        )

      case QuestionType.TEXT:
        return (
          <View className="mb-4">
            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-base text-gray-800 min-h-[120px]"
              placeholder="Type your answer here..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={currentAnswer || ""}
              onChangeText={(text) => handleAnswer(currentQuestion.id, text)}
            />
          </View>
        )

      case QuestionType.CHECKBOX:
        const selectedItems = Array.isArray(currentAnswer) ? currentAnswer : []
        return (
          <View className="gap-2.5">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = selectedItems.includes(option)
              return (
                <TouchableOpacity
                  key={index}
                  className={`flex-row items-center rounded-xl p-4 border-2 ${
                    isSelected ? "bg-indigo-50 border-indigo-500" : "bg-gray-50 border-transparent"
                  }`}
                  onPress={() => {
                    const newSelection = isSelected
                      ? selectedItems.filter((item: string) => item !== option)
                      : [...selectedItems, option]
                    handleAnswer(currentQuestion.id, newSelection)
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    className={`w-6 h-6 rounded border-2 justify-center items-center mr-3 ${
                      isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-base font-semibold mb-0.5 ${isSelected ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        )

      default:
        return null
    }
  }

  if (assessment.isComplete) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 rounded-full bg-green-100 justify-center items-center mb-6">
            <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">Assessment Complete!</Text>
          <Text className="text-base text-gray-500 text-center mb-8">
            Thank you for completing your assessment. We'll use this to personalize your experience.
          </Text>
          <TouchableOpacity
            className="bg-indigo-500 rounded-full py-4 px-8"
            onPress={saveAssessmentData}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">Finish Onboarding</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView className="flex-1 bg-neutral-50">
        <ScrollView className="flex-1" contentContainerClassName="p-6 pb-32" showsVerticalScrollIndicator={false}>
          {currentQuestion && (
            <>
              <View className="mb-8">
                <Text className="text-2xl font-bold text-gray-800 mb-2 leading-9">
                  {currentQuestion.question.split(" ").map((word, index) => {
                    // Highlight specific keywords
                    const keywords = ["support", "comfortable", "goals", "feelings"]
                    const isKeyword = keywords.some((kw) => word.toLowerCase().includes(kw))
                    return isKeyword ? (
                      <Text key={index} className="text-indigo-500 underline">
                        {word}{" "}
                      </Text>
                    ) : (
                      <Text key={index}>{word} </Text>
                    )
                  })}
                </Text>
                {currentQuestion.description && (
                  <Text className="text-base text-gray-500 leading-6">{currentQuestion.description}</Text>
                )}
              </View>

              {renderQuestionComponent()}

              {/* Progress indicator */}
              <Text className="text-center text-sm text-gray-400 mt-6">
                Question {assessment.currentQuestionIndex + 1} of {questions.length}
              </Text>
            </>
          )}
        </ScrollView>

        {/* Navigation buttons */}
        <View className="flex-row items-center px-6 pb-10 gap-3 absolute bottom-0 left-0 right-0 bg-neutral-50">
          {assessment.currentQuestionIndex > 0 && (
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-gray-100 justify-center items-center"
              onPress={goToPreviousQuestion}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className={`flex-1 h-14 rounded-full justify-center items-center ${
              currentQuestion && AssessmentController.isValidAnswer(currentQuestion, assessment.answers[currentQuestion?.id])
                ? "bg-indigo-500"
                : "bg-indigo-300"
            }`}
            onPress={goToNextQuestion}
            disabled={!currentQuestion || !AssessmentController.isValidAnswer(currentQuestion, assessment.answers[currentQuestion?.id])}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold">
              {assessment.currentQuestionIndex === questions.length - 1 ? "Finish" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
