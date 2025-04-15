import { AssessmentQuestion, QuestionType } from "@/types/user/onboard";
import { UserType } from "@/types/user/user";

// Define assessment questions for hosts
export const HOST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "host_experience",
    type: QuestionType.SCALE,
    question: "How many years of experience do you have in your field?",
    description:
      "This helps us match you with clients who need your level of expertise.",
    required: true,
    options: ["0-1", "1-3", "3-5", "5-10", "10+"],
    userType: UserType.HOST,
  },
  {
    id: "host_specialties",
    type: QuestionType.CHECKBOX,
    question: "What are your areas of specialty?",
    description: "Select all that apply to your professional background.",
    required: true,
    options: [
      "Trauma Support",
      "Anxiety & Stress",
      "Depression",
      "Relationships",
      "Career Guidance",
      "Life Transitions",
      "Grief & Loss",
      "Self-Esteem",
    ],
    userType: UserType.HOST,
  },
  {
    id: "host_approach",
    type: QuestionType.MULTIPLE_CHOICE,
    question: "What best describes your support style?",
    required: true,
    options: [
      "Directive - I provide clear guidance and suggestions",
      "Non-directive - I primarily listen and help clients find their own answers",
      "Coaching - I focus on setting goals and measuring progress",
      "Holistic - I address all aspects of wellbeing",
    ],
    userType: UserType.HOST,
  },
  {
    id: "host_bio",
    type: QuestionType.TEXT,
    question: "Write a brief professional bio for your profile",
    description:
      "This will be visible to potential clients looking for support.",
    required: true,
    userType: UserType.HOST,
  },
];

// Define assessment questions for clients
export const CLIENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "client_needs",
    type: QuestionType.CHECKBOX,
    question: "What are you looking for support with?",
    description: "Select all areas where you'd like guidance or support.",
    required: true,
    options: [
      "Healing from trauma",
      "Managing anxiety",
      "Overcoming depression",
      "Relationship issues",
      "Career challenges",
      "Life transitions",
      "Grief and loss",
      "Building self-esteem",
    ],
    userType: UserType.CLIENT,
  },
  {
    id: "client_goals",
    type: QuestionType.TEXT,
    question: "What are your primary goals in seeking support?",
    description: "This helps us match you with the right support person.",
    required: true,
    userType: UserType.CLIENT,
  },
  {
    id: "client_experience",
    type: QuestionType.MULTIPLE_CHOICE,
    question:
      "Have you sought support through counseling or similar services before?",
    required: true,
    options: [
      "Yes, and it was helpful",
      "Yes, but it wasn't a good fit",
      "No, this is my first time",
      "Prefer not to say",
    ],
    userType: UserType.CLIENT,
  },
  {
    id: "client_style",
    type: QuestionType.MULTIPLE_CHOICE,
    question: "What type of support style would work best for you?",
    description:
      "This helps us match you with a host who fits your preferences.",
    required: true,
    options: [
      "Someone who gives direct advice and guidance",
      "Someone who mostly listens and helps me find my own answers",
      "Someone who focuses on goal-setting and progress",
      "I'm not sure yet",
    ],
    userType: UserType.CLIENT,
  },
];

export const COMMON_QUESTIONS: AssessmentQuestion[] = [
  //TODO Apply time availability, language preference, etc.
  {
    id: "communication_preference",
    type: QuestionType.MULTIPLE_CHOICE,
    question: "What is your preferred communication style?",
    required: true,
    options: [
      "Text-based chat",
      "Voice calls",
      "Video calls",
      "In-person meetings (when available)",
    ],
    userType: "all",
  },
];
