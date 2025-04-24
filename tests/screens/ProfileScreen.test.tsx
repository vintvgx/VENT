import ProfileScreen from "@/app/(onboard)/profile";
import {
  cleanup,
  waitFor
} from "@testing-library/react-native";
import React from "react";
import { mockAuth } from "../utils/auth-mock";
import {
  clickButton,
  expectInputField,
  expectSupabaseUpsert,
  fillFormFields,
  selectDateOfBirth
} from "../utils/test-utils";
import { renderWithAuth } from "../utils/wrapper/TestWrapper";

/**
 * Mocking the supabase client
 */
jest.mock("@/lib/supabase/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockReturnValue({
        data: {
          session: {
            user: {
              id: "test-user-id",
            },
          },
        },
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn(),
    },
    from: jest.fn().mockImplementation((table) => ({
      select: jest.fn().mockImplementation(() => ({
        eq: jest.fn().mockImplementation(() => ({
          single: jest.fn().mockResolvedValue({
            data: { assessment_completed: true },
            error: null,
          }),
        })),
      })),
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock React Query
jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: jest.fn().mockImplementation(({ children }) => children),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}));


// Mock toast service
jest.mock("@/components/ui/toast/useToast", () => ({
  useShowToast: jest.fn().mockReturnValue(jest.fn()),
  TOAST: {
    ERROR: "error",
    SUCCESS: "success",
    INFO: "info",
  },
}));

// Mock router for navigation
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

// Mock the useAuth hook
jest.mock("@/context/auth/AuthContext", () => ({
  ...jest.requireActual("@/context/auth/AuthContext"),
  useAuth: () => mockAuth,
}));

//Mock generating unique username
jest.mock("nanoid", () => ({
  nanoid: jest.fn().mockReturnValue("test-username"),
}));


describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // This will unmount any rendered components
    jest.clearAllMocks();
  });

  it("renders profile form with initial state", async () => {
    await renderWithAuth(<ProfileScreen />);

    // Check if form fields are present
    expectInputField("First name");
    expectInputField("Last name");
    expectInputField("Choose a unique username");
    expectInputField("Your phone number");
  });

  it("handles successful profile update", async () => {
    // Mock successful mutation
    await renderWithAuth(<ProfileScreen />);

    // 1. Fill in name fields and select DOB in step 1
    fillFormFields({
      "First name": "John",
      "Last name": "Doe",
    });

    // Select date of birth (e.g., January 1, 1990)
    await selectDateOfBirth(1990, 0, 1);

    // 2. Click continue to go to step 2
    clickButton("Continue");

    // Verify username is displayed
    expectInputField("Choose a unique username");

    // 3. Fill in username in step 2
    fillFormFields({ "Choose a unique username": "janeDoe1" });
    clickButton("Continue");

    // 4. Click continue to go to step 3
    clickButton("Continue");

    // 5. Fill in phone number in step 3
    fillFormFields({ "Your phone number": "+19999999999" });

    // 6. Click finish
    clickButton("Continue");

    // Verify Supabase was called with correct data
    await waitFor(() => {
      expectSupabaseUpsert("profiles", {
        first_name: "John",
        last_name: "Doe",
        username: "janeDoe1",
        phone_number: "+19999999999",
        date_of_birth: "1990-01-01",
      });
    });
  });
});

//   it("handles profile update error", async () => {
//     // Mock error in mutation
//     mockMutation({ error: new Error("Update failed") });

//     render(<ProfileScreen />, { wrapper: TestWrapper });

//     // Fill in form fields
//     fillFormFields({
//       "First name": "John",
//       "Last name": "Doe",
//     });

//     // Submit the form
//     clickButton("Continue");

//     // Verify error is displayed
//     await waitFor(() => {
//       expectErrorMessage("Failed to save profile");
//     });
//   });

//   it("validates username format", async () => {
//     render(<ProfileScreen />, { wrapper: TestWrapper });

//     // We'd need to navigate to the username step first
//     // This would require more complicated test setup to simulate
//     // the multi-step form navigation
//     fillFormFields({
//       "First name": "John",
//       "Last name": "Doe",
//     });

//     // Select date of birth (e.g., January 1, 1990)
//     await selectDateOfBirth(1990, 0, 1);

//     // 2. Click continue to go to step 2
//     clickButton("Continue");

//     // For now, test the basic validation function by directly
//     // inputting an invalid username
//     fillFormFields({ "Choose a unique username": "invalid@username" });
//     clickButton("Continue");

//     // Expect error message for invalid username
//     expectErrorMessage(
//       "Username can only contain letters, numbers, and underscores"
//     );
//   });
// });
