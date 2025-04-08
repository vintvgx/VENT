import { User } from "@supabase/supabase-js";
import { NewUserInput, ProfileModel, UserModel, UserType } from "./user";

/**
 * Host-specific profile model extending the base profile
 * Contains additional fields relevant to service providers
 */
export interface HostProfileModel extends ProfileModel {
    // Professional background
    credentials?: string[];
    specialties: string[];
    yearsOfExperience: number;
    
    // Availability
    availabilitySchedule: {
      weekdays: boolean;
      weekends: boolean;
      evenings: boolean;
      mornings: boolean;
      customHours?: {day: string, hours: string}[];
    };
    
    // Service details
    approaches: string[]; // Therapeutic approaches/methodologies
    supportStyle: string; // e.g. "directive", "non-directive", "coaching"
    maxClientsCapacity: number;
    currentClientCount: number;
    
    // Verifications
    isVerified: boolean;
    verificationDocuments?: string[]; // References to uploaded documents
    backgroundCheckStatus?: 'pending' | 'approved' | 'rejected';
    
    // Reviews and ratings
    averageRating?: number;
    reviewCount?: number;
    
    // Bio and public information
    publicBio: string;
    professionalStatement?: string;
  }

  /**
 * Complete Host User model combining UserModel with HostProfileModel
 */
export interface HostUser extends Omit<UserModel, 'profile'> {
    userType: UserType.HOST;
    profile: HostProfileModel;
    // Host-specific onboarding data
    hostVerification?: {
      submittedAt?: Date;
      approvedAt?: Date;
      status: 'pending' | 'approved' | 'rejected';
    };
  }
  
  /**
 * Factory function to create a basic host user
 */
export function createHostUser(input: NewUserInput, user: User): HostUser {
    return {
      user,
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      dob: input.dob,
      isAnonymous: input.isAnonymous || false,
      profileCompletionPercentage: 20, // Basic info only
      userType: UserType.HOST,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      profile: {
        topicsOfInterest: [],
        experience: [],
        preferredCommunicationStyle: '',
        specialties: [],
        yearsOfExperience: 0,
        availabilitySchedule: {
          weekdays: true,
          weekends: false,
          evenings: false,
          mornings: true
        },
        approaches: [],
        supportStyle: '',
        maxClientsCapacity: 5,
        currentClientCount: 0,
        isVerified: false,
        publicBio: '',
      },
      onboardSelections: {
        areasOfSupport: [],
        shortTermGoals: [],
        longTermGoals: [],
        previousSupport: [],
        currentSupportNeeds: ''
      }
    };
  }