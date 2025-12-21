import { Session, User } from '@supabase/supabase-js';
import { UseMutationResult } from '@tanstack/react-query';
import { ProfileModel } from '@/types/user/user';

// This state tracks:
// - user: The currently authenticated user (null if not logged in)
// - session: The active auth session (null if not authenticated) 
// - loading: Whether auth state is being initialized/updated
// - isAuthenticated: Whether there is an active authenticated session
// - profile: The user's profile data from the profiles table
export enum OnboardingStep {
  NONE = 'none',
  ROLE = 'role',
  USERNAME = 'username',
  MOBILE = 'mobile',
  PROFILE = 'profile',
  ASSESSMENT = 'assessment',
  COMPLETED = 'completed'
}

export type DebugOnboardingData = {
  username?: string;
  fullName?: string;
  dob?: string; // ISO string
  phoneNumber?: string;
  role?: string;
};

export type AuthContextType = {
  authState: AuthState;
  refreshSession: () => Promise<void>;
  setOnboardingStep: (state: OnboardingStep) => Promise<void>;
  signOutMutation?: UseMutationResult<void, Error, void>;
  // Debug mode functions
  isDebugMode: boolean;
  enableDebugMode: () => Promise<void>;
  disableDebugMode: () => Promise<void>;
  clearDebugData: () => Promise<void>;
  getDebugData: () => Promise<DebugOnboardingData | null>;
  saveDebugData: (data: Partial<DebugOnboardingData>) => Promise<void>;
  };
  
export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ProfileModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStep?: OnboardingStep;
  isDebugMode?: boolean;
};
  