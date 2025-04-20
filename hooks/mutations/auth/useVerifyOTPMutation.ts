import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/supabase";
import { ToastService } from "@/services/ToastService";
import { useAuth } from "@/context/auth/AuthContext";

/**
 * Hook for verifying OTP
 * @returns The verify OTP mutation
 */
export const useVerifyOtpMutation = () => {
  const queryClient = useQueryClient();
  const { authState: { user } } = useAuth();

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["assessments", user?.id]});
    },
  });
};