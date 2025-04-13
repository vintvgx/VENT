import { UserType } from "./user";

// Define question types
export enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TEXT = "text",
    SCALE = "scale",
    CHECKBOX = "checkbox"
  }
  
  // Define a generic question interface
  export interface AssessmentQuestion {
    id: string;
    type: QuestionType;
    question: string;
    description?: string;
    required: boolean;
    options?: string[];
    userType: UserType | "all"; // Which user type this question applies to
  }
  
  // Define the assessment state
  export interface AssessmentState {
    answers: Record<string, any>;
    currentQuestionIndex: number;
    isComplete: boolean;
  }