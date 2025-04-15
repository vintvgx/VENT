import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";
import { AssessmentQuestion, QuestionType } from "@/types/user/onboard";
import { User } from "@supabase/supabase-js";

export class AssessmentController {
  static saveCurrentAnswer = async (
    questionId: string,
    answer: any,
    user: User | null,
    questions: AssessmentQuestion[]
  ) => {
    console.log("Saving user answer")
    try {
      if (!user?.id) return;

      // Format the response based on question type
      let formattedResponse;
      const question = questions.find((q) => q.id === questionId);

      if (!question) return;

      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
          formattedResponse = { value: answer };
          break;
        case QuestionType.CHECKBOX:
          formattedResponse = { values: answer };
          break;
        case QuestionType.SCALE:
          formattedResponse = { value: answer };
          break;
        case QuestionType.TEXT:
          formattedResponse = { text: answer };
          break;
        default:
          formattedResponse = { value: answer };
      }

      // Upsert the answer to Supabase
      const { error } = await supabase.from("assessments").upsert(
        {
          user_id: user.id,
          question_id: questionId,
          response: formattedResponse,
          updated_at: new Date(),
        },
        {
          // update the existing record with the new values (instead of creating new row)
          onConflict: "user_id,question_id",
        }
      );

      if (error) throw error;
      ToastService.success('Your response has been saved');
    } catch (error) {
      console.error("Error saving answer:", error);
      ToastService.error('Failed to save your response. Please try again.');
    }
  };


  static isValidAnswer = (question: AssessmentQuestion, answer: any): boolean => {
    if (question.required && !answer) return false;
    
    // Additional type-specific validation
    switch (question.type) {
      case QuestionType.TEXT:
        return typeof answer === 'string' && answer.trim().length > 0;
      case QuestionType.MULTIPLE_CHOICE:
        return answer !== undefined && answer !== null;
      // Add cases for other question types
      default:
        return !!answer;
    }
  };
}
