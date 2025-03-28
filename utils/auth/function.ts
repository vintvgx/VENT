import { supabase } from "@/lib/supabase/supabase";
import { AuthError } from "@supabase/supabase-js";

export const signInWithOtp = async (mobile: string) => { 
    let { error } = await supabase.auth.signInWithOtp({
      phone: mobile,
    });

    if(error) {
        // setError(error)
        console.error(error)
        return error
    }
  };

  const verifyMobile = async (mobile: string, token: string) => {
    let { data, error } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: token,
      type: "sms",
    });

    if(error) {
        // setError(error)
        console.error(error)
    }
  };