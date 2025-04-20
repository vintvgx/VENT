import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";
import { ProfileModel } from "@/types/user/user";
import { useAuth } from "@/context/auth/AuthContext";
import { useProfile } from "@/hooks/queries/auth/useProfileQuery";

/**
 * Hook for updating user profile
 * @returns The update profile mutation
 */
export const useUpdateProfileMutation = () => {
  const {
    authState: { user },
  } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
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
      console.log("Profile data updated successfully.");
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
};