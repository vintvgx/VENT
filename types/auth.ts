import { Session, User } from '@supabase/supabase-js';
import { ProfileModel } from './user/user';
import { AssessmentResponse } from './user/onboard';

// This state tracks:
// - user: The currently authenticated user (null if not logged in)
// - session: The active auth session (null if not authenticated) 
// - loading: Whether auth state is being initialized/updated
// - isAuthenticated: Whether there is an active authenticated session
export enum OnboardingStep {
  NONE = 'none',
  ROLE = 'role',
  PROFILE = 'profile',
  ASSESSMENT = 'assessment',
  COMPLETED = 'completed'
}

export  type AuthContextType = {
    authState: AuthState;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
    setOnboardingStep: (state: OnboardingStep) => Promise<void>;
    updateUserProfile:  () => Promise<void>;
  };
  
export type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ProfileModel | null;
  assessments: AssessmentResponse[] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStep?: OnboardingStep;
};
  