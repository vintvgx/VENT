import { supabase } from "@/lib/supabase/supabase";
import { AuthError } from "@supabase/supabase-js";

/**
 * Sends an OTP to the provided mobile number
 * @param mobile The phone number to send OTP to
 * @returns Error object if the operation fails
 */
export const signInWithOtp = async (mobile: string) => { 
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: mobile,
    });

    if(error) {
      console.error('OTP Error:', error);
      return error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('OTP Error:', error);
    return { message: 'An unexpected error occurred' };
  }
};

/**
 * Verifies an OTP code for a mobile number
 * @param mobile The phone number
 * @param token The OTP code
 * @param type The verification type (sms or phone_change)
 * @returns Object with success flag and session/user data
 */
export const verifyOtp = async (
  mobile: string, 
  token: string, 
  type: 'sms' | 'phone_change' = 'sms'
) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: token,
      type: type,
    });

    if(error) {
      console.error('Verification Error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Verification Error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Links a phone number to an already authenticated user
 * @param phoneNumber The phone number to link
 * @returns Object with success flag and data/error
 */
export const linkPhoneNumber = async (phoneNumber: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      phone: phoneNumber
    });

    if(error) {
      console.error('Phone Linking Error:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Phone Linking Error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

/**
 * Gets the current user session
 * @returns Current session or null
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Get Session Error:', error);
    return null;
  }
  
  return data.session;
};

/**
 * Signs out the current user
 * @returns Success status and any error
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign Out Error:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Sign Out Error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};