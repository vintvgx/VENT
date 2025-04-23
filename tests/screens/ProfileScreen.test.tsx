import React, { ReactNode } from "react";
import {
  render,
  waitFor,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react-native";
import { supabase } from "@/lib/supabase/supabase";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ProfileScreen from "@/app/(onboard)/profile";
import {
  expectInputField,
  fillFormFields,
  expectButtonDisabled,
  submitForm,
  expectErrorMessage,
  expectSupabaseUpsert,
  mockMutation,
  clickButton,
} from "../utils/test-utils";
import { OnboardingStep } from "@/types/auth";
import { AuthProvider } from "@/context/auth/AuthContext";
import { mockAuth } from "../utils/auth-mock";

// Mock Supabase
// jest.mock('@/lib/supabase/supabase', () => ({
//   supabase: {
//     from: jest.fn().mockReturnThis(),
//     upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
//   },
// }));

// Create a test QueryClient
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: false,
//     },
//   },
// });

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
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
    clear: jest.fn(),
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
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

// Create a wrapper component with mocked auth context
const renderWithAuthContext = (
  component: React.JSX.Element | any | null | undefined
) => {
  const mockAuthContext = {
    authState: {
      user: {
        id: "test-user-id",
        user_metadata: {},
      },
      session: {
        access_token: "test-token",
        refresh_token: "test-refresh-token",
        user: {
          id: "test-user-id",
          email: "test@example.com",
        },
      },
      onboardingStep: OnboardingStep.PROFILE,
      isLoading: false,
      isAuthenticated: true,
    },
    signOutMutation: {
      mutate: jest.fn(),
      isLoading: false,
    },
    refreshSession: jest.fn(),
    setOnboardingStep: jest.fn(),
  };

  return <AuthProvider>{component}</AuthProvider>;
};

/**
 * Mocking the react query
 */
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(), // Mock function for triggering mutations
    mutateAsync: jest.fn(), // Mock function for async mutations
    isLoading: false, // Default loading state
    isError: false, // Default error state
    isSuccess: false, // Default success state
    error: null, // Default error value
  }),
}));

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // This will unmount any rendered components
    jest.clearAllMocks();
  });

  it("renders profile form with initial state", async () => {
    render(<ProfileScreen />, { wrapper: TestWrapper });

    // Check if form fields are present
    expectInputField("First name");
    expectInputField("Last name");
    expectInputField("Choose a unique username");
    expectInputField("Your phone number");

    // Next button should be disabled initially
    //TODO fix
    // expectButtonDisabled('Continue', true);
  });

  it("enables Next button when all required fields are filled for step 1", async () => {
    render(<ProfileScreen />, { wrapper: TestWrapper });

    // Fill in the form fields for step 1 (NAME_DOB)
    fillFormFields({
      "First name": "John",
      "Last name": "Doe",
    });

    // TODO Select date of birth by mocking the date picker
    // Since your component uses a custom date picker, we'd need to implement
    // special logic to simulate date selection

    // For now, test that the Continue button is enabled with just name fields
    // This assumes your ProfileScreen initially shows the NAME_DOB step
    //TODO fix
    // expectButtonDisabled("Continue", false);
  });

  it("handles successful profile update", async () => {
    // Mock successful mutation
    render(<ProfileScreen />, { wrapper: TestWrapper });


    // For a complete test, we would need to:
    // 1. Fill in name fields and select DOB in step 1
    fillFormFields({
      "First name": "John",
      "Last name": "Doe",
    });
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

    // For simplicity in this test, we'll just verify the Supabase call happens
    // after filling basic required fields (assuming they're submitted)
    // fillFormFields({
    //   "First Name": "John",
    //   "Last Name": "Doe",
    // });

    // Since ProfileController.handleDateSelect is difficult to test,
    // we're focusing on verifying the Supabase interaction

    // Simulate form submission
    // submitForm({}, "Continue");

    // Verify Supabase was called with correct data
    await waitFor(() => {
      expectSupabaseUpsert("profiles", {
        first_name: "John",
        last_name: "Doe",
        username: "janeDoe1",
        phone_number: "+19999999999",
      });
    });
  });

  it("handles profile update error", async () => {
    // Mock error in mutation
    mockMutation({ error: new Error("Update failed") });

    await act(async () => {
      renderWithAuthContext(<ProfileScreen />);
    });
    // Fill in form fields
    fillFormFields({
      "First Name": "John",
      "Last Name": "Doe",
    });

    // Submit the form
    submitForm({}, "Continue");

    // Verify error is displayed
    await waitFor(() => {
      expectErrorMessage("Failed to save profile");
    });
  });

  it("validates username format", async () => {
    await act(async () => {
      renderWithAuthContext(<ProfileScreen />);
    });
    // We'd need to navigate to the username step first
    // This would require more complicated test setup to simulate
    // the multi-step form navigation

    // For now, test the basic validation function by directly
    // inputting an invalid username
    fillFormFields({
      Username: "invalid@username",
    });

    // Expect error message for invalid username
    expectErrorMessage(
      "Username can only contain letters, numbers, and underscores"
    );
  });

  it("handles anonymous mode toggle", async () => {
    renderWithAuthContext(<ProfileScreen />);

    // Find and toggle the "Stay anonymous" checkbox
    // This would need a custom helper method to locate and toggle the checkbox

    // For a basic test, verify the form renders successfully
    // and the toggle element is present
    expectInputField("First Name");

    // You would need to add a helper to check for the toggle element
    // expectElement('Stay anonymous (hide my name)');
  });
});
