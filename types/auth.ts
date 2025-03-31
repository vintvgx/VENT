import { Session, User } from '@supabase/supabase-js';

// This state tracks:
// - user: The currently authenticated user (null if not logged in)
// - session: The active auth session (null if not authenticated) 
// - loading: Whether auth state is being initialized/updated
// - isAuthenticated: Whether there is an active authenticated session
export type AuthState = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
  };
  

export type AuthContextType = {
    authState: AuthState;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
  };