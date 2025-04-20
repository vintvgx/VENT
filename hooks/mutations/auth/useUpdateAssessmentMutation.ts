import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";
import { AssessmentResponse } from "@/types/user/onboard";
import { useAuth } from "@/context/auth/AuthContext";

/**
 * Hook for updating user assessment
 * @returns The update assessment mutation
 */
export const useUpdateAssessmentMutation = () => {
  const {
    authState: { user },
  } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<AssessmentResponse>) => {
      if (!user) throw new Error("Not authenticated");

      // Prepare the data to upsert
      const assessmentData = {
        user_id: user.id,
        ...updates,
      };

      const { data, error } = await supabase
        .from("assessments")
        .upsert(assessmentData)
        .select("*")
        .single();

      if (error) throw error;
      return data as AssessmentResponse;
    },
    onError: (data) => {
      console.error("Error updating assessment data:", data);
      ToastService.error("Failed to update assessment data.");
    },
    onSuccess: (data) => {
      // Update the assessment in the cache
      queryClient.setQueryData(["assessment", user?.id], data);
    },
  });
};