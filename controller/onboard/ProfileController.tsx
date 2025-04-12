import AsyncStorage from "@react-native-async-storage/async-storage"
import { supabase } from "@/lib/supabase/supabase"
import { OnboardingStep } from "@/types/auth"
import { ProfileStep, STORAGE_KEYS } from "@/types/user/profile"

interface SaveProfileParams {
  userId: string
  firstName: string
  lastName: string
  username: string
  phoneNumber: string
  dateOfBirth: Date | null
  stayAnonymous: boolean
}

export class ProfileController {
    /**
     *  Check if date of birth makes user at least 18 years old
     * 
     * @param dob the inputted date of birth
     * @returns true if underage
     */
  static checkAge(dob: Date): boolean {
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    return age >= 18
  }

  /**
   * Saves form data to storage as they are inputted by user.
   * 
   * @param step the specified [ProfileStep] 
   * @param formData the inputted data
   */
  static async saveToStorage(step: ProfileStep, formData: {
    firstName: string
    lastName: string
    stayAnonymous: boolean
    dateOfBirth: Date | null
    username: string
    phoneNumber: string
  }) {
    try {
      const data = {
        [STORAGE_KEYS.PROFILE_STEP]: step.toString(),
        [STORAGE_KEYS.FIRST_NAME]: formData.firstName,
        [STORAGE_KEYS.LAST_NAME]: formData.lastName,
        [STORAGE_KEYS.STAY_ANONYMOUS]: formData.stayAnonymous.toString(),
      }

      if (formData.dateOfBirth) {
        data[STORAGE_KEYS.DATE_OF_BIRTH] = formData.dateOfBirth.toISOString()
      }

      if (step >= ProfileStep.USERNAME) {
        data[STORAGE_KEYS.USERNAME] = formData.username
      }

      if (step >= ProfileStep.PHONE_NUMBER) {
        data[STORAGE_KEYS.PHONE_NUMBER] = formData.phoneNumber
      }

      await Promise.all(Object.entries(data).map(([key, value]) => AsyncStorage.setItem(key, value)))
    } catch (error) {
      console.error("Error saving progress:", error)
      throw error
    }
  }

  /**
   * Loads available data from AsyncStorage and sets the values if they exists.
   * 
   * TODO update implementation in profile.tsx
   * 
   * @returns the set values
   */
  static async loadSavedData() {
    try {
      const [savedStep, savedFirstName, savedLastName, savedDOB, savedAnonymous, savedUsername, savedPhone] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE_STEP),
          AsyncStorage.getItem(STORAGE_KEYS.FIRST_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.LAST_NAME),
          AsyncStorage.getItem(STORAGE_KEYS.DATE_OF_BIRTH),
          AsyncStorage.getItem(STORAGE_KEYS.STAY_ANONYMOUS),
          AsyncStorage.getItem(STORAGE_KEYS.USERNAME),
          AsyncStorage.getItem(STORAGE_KEYS.PHONE_NUMBER),
        ])

      return {
        step: savedStep ? Number.parseInt(savedStep) : null,
        firstName: savedFirstName || "",
        lastName: savedLastName || "",
        dateOfBirth: savedDOB ? new Date(savedDOB) : null,
        stayAnonymous: savedAnonymous === "true",
        username: savedUsername || "",
        phoneNumber: savedPhone || "",
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
      throw error
    }
  }

  /**
   * Formats date to local date string.
   * 
   * @param date the inputted date
   * @returns 
   */
  static formatDate(date: Date | null): string {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  static async saveProfile(params: SaveProfileParams): Promise<void> {
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: params.userId,
        firstName: params.stayAnonymous ? "" : params.firstName.trim(),
        lastName: params.stayAnonymous ? "" : params.lastName.trim(),
        username: params.username.trim(),
        phoneNumber: params.phoneNumber.trim(),
        dateOfBirth: params.dateOfBirth ? params.dateOfBirth.toISOString() : null,
        isAnonymous: params.stayAnonymous,
        updated_at: new Date(),
      })

      if (error) throw error

      // Clear saved progress data
      await Promise.all(Object.values(STORAGE_KEYS).map((key) => AsyncStorage.removeItem(key)))
    } catch (error) {
      console.error("Error saving profile:", error)
      throw error
    }
  }
}