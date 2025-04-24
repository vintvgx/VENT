import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import * as authUtils from "@/utils/auth/function";
import { QueryClient } from "@tanstack/react-query";

/**
 * Mocking the router
 */
jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

/**
 * Expects a text input field to be present in the screen
 * @param placeholder - The placeholder text of the input field
 */
export const expectInputField = (placeholder: string) => {
  expect(screen.getByPlaceholderText(placeholder)).toBeTruthy();
};

/**
 * Changes the text value of an input field
 * @param placeholder - The placeholder text of the input field
 * @param value - The new value to set
 */
export const changeInputText = (placeholder: string, value: string) => {
  fireEvent.changeText(screen.getByPlaceholderText(placeholder), value);
};

/**
 * Fills in multiple form fields at once
 * @param fields - Object containing field placeholders and their values
 */
export const fillFormFields = (fields: Record<string, string>) => {
  Object.entries(fields).forEach(([placeholder, value]) => {
    changeInputText(placeholder, value);
  });
};

/**
 * Button Utilities
 */

/**
 * Expects a button to be present and checks its disabled state
 * @param text - The text content of the button
 * @param disabled - Whether the button should be disabled (default: false)
 */
export const expectButtonDisabled = (
  text: string,
  disabled: boolean = false
) => {
  const button = screen.getByText(text);
  expect(button).toBeTruthy();
  expect(button.props.accessibilityState.disabled).toBe(disabled);
};

/**
 * Clicks a button by its text content
 * @param text - The text content of the button
 */
export const clickButton = (text: string) => {
  fireEvent.press(screen.getByText(text));
};

/**
 * Form Submission Utilities
 */

/**
 * Submits a form with the given fields and clicks the submit button
 * @param fields - Object containing field placeholders and their values
 * @param submitButtonText - The text content of the submit button
 */
export const submitForm = (
  fields: Record<string, string>,
  submitButtonText: string
) => {
  fillFormFields(fields);
  clickButton(submitButtonText);
};

/**
 * Error Handling Utilities
 */

/**
 * Expects an error message to be displayed
 * @param message - The error message text to look for
 */
export const expectErrorMessage = (message: string) => {
  expect(screen.getByText(message)).toBeTruthy();
};

/**
 * Navigation Utilities
 */

/**
 * Mocks the router navigation
 * @param route - The route to navigate to
 */
export const expectNavigation = async (route: string) => {
  await waitFor(() => {
  expect(router.replace).toHaveBeenCalledWith(route);
  })
};

/**
 * Mocking the auth utils
 */
jest.mock("@/utils/auth/function", () => ({
  checkProfileStatus: jest.fn(),
  checkRoleStatus: jest.fn(),
  checkAssessmentStatus: jest.fn(),
}));

/**
 * Expects the auth status to be called with the given userID
 * @param status - The status to expect
 * @param userID - The userID to expect
 */
export const expectAuthStatus = (status: string, userID: string) => {
  switch (status) {
    case "profile":
      expect(authUtils.checkProfileStatus).toHaveBeenCalledWith(userID);
      break;
    case "role":
      expect(authUtils.checkRoleStatus).toHaveBeenCalledWith(userID);
      break;
    case "assessment":
      expect(authUtils.checkAssessmentStatus).toHaveBeenCalledWith(userID);
      break;
  }
};

/**
 * Supabase Utilities
 */

/**
 * Expects a Supabase upsert call with the given data
 * @param table - The table name
 * @param data - The data to be upserted
 */
export const expectSupabaseUpsert = (
  table: string,
  data: Record<string, any>
) => {
  const { supabase } = require("@/lib/supabase/supabase");
  expect(supabase.from).toHaveBeenCalledWith(table);
  expect(supabase.from(table).upsert).toHaveBeenCalledWith(data);
};

/**
 * Mutation Utilities
 */

/**
 * Mocks a React Query mutation with the given state
 * @param options - The mutation state options
 */
export const mockMutation = (options: {
  success?: boolean;
  error?: Error;
  isLoading?: boolean;
}) => {
  const { useMutation } = require("@tanstack/react-query");
  (useMutation as jest.Mock).mockReturnValue({
    mutate: jest
      .fn()
      .mockResolvedValue(options.success ? { success: true } : undefined),
    mutateAsync: jest
      .fn()
      .mockResolvedValue(options.success ? { success: true } : undefined),
    isLoading: options.isLoading ?? false,
    isError: !!options.error,
    isSuccess: options.success ?? false,
    error: options.error ?? null,
  });
};

/**
 * Selects a date of birth in the date picker
 * @param year - The year of the date
 * @param month - The month of the date
 * @param day - The day of the date
 */
export const selectDateOfBirth = async (year: number, month: number, day: number) => {
  // Find and click the date input to open the picker
  const dateInput = screen.getByText("Select your date of birth");
  fireEvent.press(dateInput);

  // Wait for the modal to appear
  await waitFor(() => {
    expect(screen.getByText("Select Date of Birth")).toBeTruthy();
  });

  // Select year
  const yearButton = screen.getByText(year.toString());
  fireEvent.press(yearButton);

  // Select month (months are 0-indexed in JavaScript)
  const monthButton = screen.getByText(
    new Date(2000, month, 1).toLocaleString("default", { month: "long" })
  );
  fireEvent.press(monthButton);

  // Select day
  const dayButton = screen.getByText(day.toString());
  fireEvent.press(dayButton);

  // Confirm the selection
  const confirmButton = screen.getByText("Confirm");
  fireEvent.press(confirmButton);
};

/**
 * Mocking the query client
 */
export const mockQueryClient = {
  invalidateQueries: jest.fn(),
  clear: jest.fn(),
  // Add any other methods you actually use in your code
} as unknown as QueryClient;  // Type cast to QueryClient