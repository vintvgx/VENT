import { UserType } from "./user";

// Define question types
export enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TEXT = "text",
    SCALE = "scale",
    CHECKBOX = "checkbox"
  }

  export interface AssessmentResponse {
    id: string;
    user_id: string;
    question_id: string;
    response: {
      text?: string;
      value?: string;
      values?: string[];
    };
    assessment_version: number;
    created_at: string;
    updated_at: string;
  }

  export interface FormattedAssessmentData {
    // Host-specific data
    yearsOfExperience?: string;
    specialties?: string[];
    supportStyle?: string;
    publicBio?: string;
    
    // Client-specific data
    supportNeeds?: string[];
    goals?: string;
    previousSupport?: string;
    preferredHostStyle?: string;
    
    // Common data
    communicationPreference?: string;
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