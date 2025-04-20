import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";

/**
 * Hook for signing in with OTP
 * @returns The sign in with OTP mutation
 */
export const useSignInWithOtpMutation = () => {
  return useMutation({
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
};