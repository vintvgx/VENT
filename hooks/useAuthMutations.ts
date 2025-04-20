import { TOAST } from "@/components/ui/toast/useToast";
import { useAuth } from "@/context/auth/AuthContext";
import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";
import { AssessmentResponse } from "@/types/user/onboard";
import { ProfileModel } from "@/types/user/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "./queries/auth/useProfileQuery";

export const useAuthMutations = () => {
  const {
    authState: { user },
  } = useAuth();
  const queryClient = useQueryClient();

  const {data: profile, isLoading: profileLoading} = useProfile()

  /**
   * Mutation for updating user profile
   * @param updates - Partial<ProfileModel>
   * @returns ProfileModel
   */
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ProfileModel>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username: profile?.username,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      console.log("Profile data updated successfully.")
      return data as ProfileModel;
    },
    onError: (data) => {
      console.error("Error updating profile data:", data);
      ToastService.error("Failed to update profile data.");
    },
    onSuccess: (data) => {
      // Update the profile in the cache
      queryClient.setQueryData(["profile", user?.id], data);
    },
  });

  /**
   * Mutation for updating user assessment
   * @param updates - Partial<AssessmentResponse>
   * @returns AssessmentResponse
   */
  const updateAssessmentMutation = useMutation({
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

  /**
   * Mutation for verifying OTP
   * @param phone - string
   * @param token - string
   * @returns Session
   */
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) throw error;
      return data;
    },
    onError: (data) => {
      console.error("Error verifying OTP:", data);
      ToastService.error("Failed to verify OTP.");
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful verification
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
    },
  });

  /**
   * Mutation for signing in with OTP
   * @param phone - string
   * @returns Session
   */
  const signInWithOtpMutation = useMutation({
    mutationFn: async ({ phone }: { phone: string }) => {
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return data;
    },
    onError: (data) => {
      console.error("Error signing in with OTP:", data);
      ToastService.error("Failed to sign in with OTP.");
    },
  });
  

  return {
    updateProfileMutation,
    updateAssessmentMutation,
    signInWithOtpMutation,
    verifyOtpMutation,
  };
};
