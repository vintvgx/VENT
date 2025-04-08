import { Session, User } from '@supabase/supabase-js';

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
  };
  
export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingStep?: OnboardingStep;
};
  