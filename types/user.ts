import { User } from "@supabase/supabase-js";

// Consider adding these fields to UserModel
export interface UserModel {
    user: User;
    firstName: string;
    lastName: string;
    username: string;
    DOB: Date;
    isAnonymous: boolean; // Flag for anonymous users
    profileCompletionPercentage: number; // Track completion
    profile: ProfileModel;
    onboardSelections: OnboardSelection; // Link to onboarding data
    createdAt: Date;
    lastActiveAt: Date;
  }
  
  // Add relevance scoring to interests/experiences
  export interface ProfileModel {
    // Existing fields
    topicsOfInterest: Array<{topic: string, relevanceScore: number}>;
    experience: Array<{area: string, relevanceScore: number}>;
    // Consider adding:
    preferredCommunicationStyle: string; // e.g. "direct", "nurturing", "analytical"
    boundariesAndTriggers?: string[]; // Optional personal boundaries
    availabilityPreferences?: string; // When they prefer to engage
  }
  
  // Rename for consistency and expand
  export interface OnboardSelection {
    // Existing fields with relevance scoring
    areasOfSupport: Array<{area: string, urgency: number}>;
    shortTermGoals: Array<{goal: string, priority: number}>;
    longTermGoals: Array<{goal: string, priority: number}>;
    previousSupport: Array<{type: string, helpfulness: number}>;
    // Additional useful fields
    currentSupportNeeds: string; // Free text field for immediate needs
    matchPreferences?: {
      experienceLevels: string[], // e.g. "peer", "professional", "lived experience"
      demographicPreferences?: string[] // Optional demographic preferences
    };
  }


  //Social/Email Auth → Essential Profile (username, age) → Quick Needs Assessment (urgent support areas) → Welcome to Home → Progressive profile completion (prompted over time)