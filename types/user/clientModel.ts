import { User } from "@supabase/supabase-js";
import { NewUserInput, ProfileModel, UserModel, UserType } from "./user";

/**
 * Client-specific profile model extending the base profile
 * Contains fields relevant to those seeking support
 */
export interface ClientProfileModel extends ProfileModel {
    // Support needs
    primarySupportNeeds: string[];
    supportIntensityPreference: 'light' | 'moderate' | 'intensive';
    
    // Preferences for matching
    preferredHostCharacteristics?: {
      experienceLevel?: 'peer' | 'professional' | 'both';
      specialties?: string[];
      communicationStyle?: string[];
    };
    
    // History
    previousSupportExperience?: {
      type: string;
      duration: string;
      wasHelpful: boolean;
      notes?: string;
    }[];
    
    // Privacy settings
    privacyPreferences: {
      shareRealName: boolean;
      shareJourneyWithHost: boolean;
    };
    
    // Progress tracking
    journeyMilestones?: {
      milestone: string;
      achievedDate?: Date;
      status: 'not-started' | 'in-progress' | 'completed';
    }[];
    
    // Emergency contact (optional but recommended)
    emergencyContact?: {
      name: string;
      relationship: string;
      phoneNumber: string;
      email?: string;
    };
  }

  /**
 * Complete Client User model combining UserModel with ClientProfileModel
 */
export interface ClientUser extends Omit<UserModel, 'profile'> {
    userType: UserType.CLIENT;
    profile: ClientProfileModel;
    // Client-specific onboarding data
    supportPlan?: {
      createdAt: Date;
      lastUpdatedAt: Date;
      goals: string[];
      notesForHost?: string;
    };
  }


/**
 * Factory function to create a basic client user
 */
// export function createClientUser(input: NewUserInput, user: User): ClientUser {
//     return {
//       user,
//       firstName: input.firstName,
//       lastName: input.lastName,
//       username: input.username,
//       dob: input.dob,
//       isAnonymous: input.isAnonymous || false,
//       profileCompletionPercentage: 20, // Basic info only
//       userType: UserType.CLIENT,
//       createdAt: new Date(),
//       lastActiveAt: new Date(),
//       profile: {
//         role: UserType.CLIENT,
//         topicsOfInterest: [],
//         experience: [],
//         preferredCommunicationStyle: '',
//         primarySupportNeeds: [],
//         supportIntensityPreference: 'moderate',
//         privacyPreferences: {
//           shareRealName: false,
//           shareJourneyWithHost: false
//         }
//       },
//       onboardSelections: {
//         areasOfSupport: [],
//         shortTermGoals: [],
//         longTermGoals: [],
//         previousSupport: [],
//         currentSupportNeeds: ''
//       }
//     };
//   }