import { supabase } from "@/lib/supabase/supabase";
import { useAuth } from "@/context/auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { ProfileModel } from "@/types/user/user";
import { logDebug } from "@/utils/strings/function";

export function useProfile() {
  const { authState: { user } } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;

      logDebug("Profile data fetched successfully.")
      return data as ProfileModel;
    },
    enabled: !!user,
  });
}