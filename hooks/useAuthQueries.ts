import { useAuth } from "@/context/auth/AuthContext";
import { supabase } from "@/lib/supabase/supabase";
import { AssessmentResponse } from "@/types/user/onboard";
import { ProfileModel } from "@/types/user/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuthQueries = () => {
  const {
    authState: { user },
  } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as ProfileModel;
    },
    enabled: !!user,
  });

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
};
