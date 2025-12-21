/**
 * Onboarding Data Storage Utilities
 * 
 * Provides generic secure storage functions for onboarding data using expo-secure-storage.
 * Data is saved locally and retrieved when the user returns to complete onboarding.
 * 
 * Storage keys:
 * - ONBOARDING_FULL_NAME: User's full name (string)
 * - ONBOARDING_DOB: User's date of birth (ISO string - serialize Date to ISO, deserialize back to Date)
 * - ONBOARDING_USERNAME: User's chosen username (string)
 */

import * as SecureStore from "expo-secure-store";

// Storage keys for onboarding data
export const ONBOARDING_STORAGE_KEYS = {
  FULL_NAME: "onboarding_fullName",
  DOB: "onboarding_dob",
  USERNAME: "onboarding_username",
  MOBILE: "onboarding_mobile",
} as const;

/**
 * Saves a value to secure storage using the provided key.
 * For Date objects, serializes to ISO string automatically.
 * Empty strings or null values will delete the key from storage.
 * 
 * @param key - The storage key to save the value under
 * @param value - The value to save (string, number, or Date). Dates are automatically serialized to ISO strings.
 * @returns Promise that resolves when save is complete
 */
export async function saveToStorage(key: string, value: string | number | Date | null): Promise<void> {
  try {
    if (value === null || value === undefined) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    // Handle Date objects by serializing to ISO string
    if (value instanceof Date) {
      const isoString = value.toISOString();
      await SecureStore.setItemAsync(key, isoString);
      return;
    }

    // Handle string and number values
    const stringValue = String(value);
    if (stringValue.trim().length === 0) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    await SecureStore.setItemAsync(key, stringValue);
  } catch (error) {
    console.error(`Error saving to storage with key "${key}":`, error);
    throw error;
  }
}

/**
 * Retrieves a value from secure storage using the provided key.
 * 
 * @param key - The storage key to retrieve the value from
 * @returns Promise that resolves with the stored value as a string, or null if not found
 */
export async function retrieveFromStorage(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error(`Error retrieving from storage with key "${key}":`, error);
    return null;
  }
}
