// Define the steps for the profile setup
export enum ProfileStep {
  NAME_DOB = 0,
  USERNAME = 1,
  PHONE_NUMBER = 2,
}
export interface ProfileData {
  fullName: string;
  dob: Date | null;
}

// AsyncStorage keys
export const STORAGE_KEYS = {
  PROFILE_STEP: "profile_step",
  FIRST_NAME: "first_name",
  LAST_NAME: "last_name",
  DATE_OF_BIRTH: "date_of_birth",
  STAY_ANONYMOUS: "stay_anonymous",
  USERNAME: "username",
  PHONE_NUMBER: "phone_number",
};
