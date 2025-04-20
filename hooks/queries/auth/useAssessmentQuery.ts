import { useAuth } from "@/context/auth/AuthContext";
import { supabase } from "@/lib/supabase/supabase";
import { AssessmentResponse } from "@/types/user/onboard";
import { useQuery } from "@tanstack/react-query";

export function useAssessment() {
    const { authState: { user } } = useAuth();

    const { data: assessmentData } = useQuery({
        queryKey: ["assessment", user?.id],
        queryFn: async () => {
          if (!user) return null;
    
          const { data, error } = await supabase
            .from("assessments")
            .select("*")
            .eq("user_id", user.id)
            .single();
    
          if (error) {
            // If no assessment exists yet, that's not an error
            if (error.code === "PGRST116") return null;
            throw error;
          }
    
          return data as AssessmentResponse[];
        },
        enabled: !!user,
      });
}