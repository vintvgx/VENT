import { supabase } from "@/lib/supabase/supabase";
import { AuthState } from "@/types/auth";
import { UserMetaData, UserType } from "@/types/user/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid";

/**
 * Generate a unique username
 * TODO Delete / user name is updated within user name
 */
const generateUsername = () => {
  return `user_${nanoid(8)}`;
};

/**
 * Updates user metadata after successful authentication
 * @param userData Optional user data from authentication provider
 * @param phoneNumber Optional phone number (primarily for mobile auth)
 * @returns Object containing success status and any error
 */
export const updateUserMetadata = async (
  userData?: UserMetaData
) => {
  try {
    // Initialize user metadata with optional values from auth provider
    // Empty values are acceptable as user will complete profile during onboarding
    // All fields will be collected during the PROFILE step of onboarding flow
    const metadataToUpdate = {
      first_name: userData?.firstName || "",
      last_name: userData?.lastName || "",
      username: userData?.username || await generateUsername(),
      avatar_url: userData?.avatar || "",
      mobile: userData?.phoneNumber || "",
      email: userData?.email || "",
    };

    // Update user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: metadataToUpdate,
    });

    if (error) {
      console.warn("Failed to update user metadata:", error);
      return { success: false, error };
    }

    return { success: true, error: null, user: data.user };
  } catch (error) {
    console.error("Error updating user metadata:", error);
    return { success: false, error };
  }
};

/**
 * Sends an OTP to the provided mobile number
 * @param mobile The phone number to send OTP to
 * @returns Error object if the operation fails
 */
export const signInWithOtp = async (mobile: string) => {
  try {
    console.log("Signing in with mobile: ", mobile);
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: mobile,
    });

    if (error) {
      console.error("OTP Error:", error);
      return { success: false, error };
    }

    // Log success with response data
    console.log("OTP request successful. Response:", data);
    return { success: true, data };
  } catch (error) {
    console.error("OTP Error:", error);
    return { message: "An unexpected error occurred" };
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
  type: "sms" | "phone_change" = "sms"
) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: token,
      type: type,
    });

    if (error) {
      console.error("Verification Error:", error);
      return { success: false, error };
    }

    if (data.session === undefined) {
      return { success: false, data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Verification Error:", error);
    return { success: false, message: "An unexpected error occurred" };
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
      phone: phoneNumber,
    });

    if (error) {
      console.error("Phone Linking Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Phone Linking Error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

/**
 * Gets the current user session
 * @returns Current session or null
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Get Session Error:", error);
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
      console.error("Sign Out Error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign Out Error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

// Check if user has selected a role
export const checkRoleStatus = async (userId: string | undefined) => {
  if (userId === undefined) return false

  try {
    // Query profiles table in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    // Check if role exists and is either 'host' or 'client'
    return data && data.role && (data.role === UserType.HOST || data.role === UserType.CLIENT);
  } catch (error) {
    console.error('Error in role check:', error);
    return false;
  }
};

// Check if user has completed profile setup
export const checkProfileStatus = async (userId: string | undefined) => {
  if (userId === undefined) return false

  try {
    // Query your profile table in Supabase
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking profile:", error);
      return false;
    }

    // Check if profile exists and has required fields
    return data && data.name && data.bio; // adjust based on your required fields
  } catch (error) {
    console.error("Error in profile check:", error);
    return false;
  }
};

// Check if user has completed assessment
export const checkAssessmentStatus = async (userId: string | undefined) => {
  if (userId === undefined) return false
  
  try {
    // Query your assessments table in Supabase
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error checking assessment:", error);
      return false;
    }

    // Check if assessment exists and is complete
    return data && data.completed;
  } catch (error) {
    console.error("Error in assessment check:", error);
    return false;
  }
};
