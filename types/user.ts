import { User } from "@supabase/supabase-js";

/**
 * Represents a user in the system, including their basic information,
 * profile data, and onboarding selections.
*/
export interface UserModel {
    user: User;
    firstName: string;
    lastName: string;
    username: string;
    dob: Date | string; 
    isAnonymous: boolean; // Flag for anonymous users
    profileCompletionPercentage: number; // Track completion
    profile: ProfileModel;
    onboardSelections: OnboardSelection; // Link to onboarding data
    createdAt: Date;
    lastActiveAt: Date;
  }
/**
 * Represents the values stored within the user metadata 
 * (supabase.auth.data)
 */
  export interface UserMetaData {
    firstName?: string | null | undefined ;
    lastName?: string | null | undefined;
    username?: string | null | undefined;
    createdAt?: Date | string | null | undefined;
    isAnonymous?: boolean; 
    lastActiveAt?: Date;
    phoneNumber?: string;
    avatar?: string;
    email?: string | null | undefined;
  }
  
  /**
   * Represents a user's profile preferences, interests, and experiences.
   */
export interface ProfileModel {
    // Existing fields
    topicsOfInterest: Array<{topic: string, relevanceScore: number}>;
    experience: Array<{area: string, relevanceScore: number}>;
    // Consider adding:
    preferredCommunicationStyle: string; // e.g. "direct", "nurturing", "analytical"
    boundariesAndTriggers?: string[]; // Optional personal boundaries
    availabilityPreferences?: string; // When they prefer to engage
  }
  
/**
 * Represents the selections made during user onboarding.
 **/
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

  /**
 * User Journey Flow:
 * 1. Social/Email Auth
 * 2. Essential Profile (username, age)
 * 3. Quick Needs Assessment (urgent support areas)
 * 4. Welcome to Home
 * 5. Progressive profile completion (prompted over time)
 */