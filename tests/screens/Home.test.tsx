/**
 * File for testing the Home screen
 */

import { cleanup } from "@testing-library/react-native";
import { renderWithAuth } from "../utils/wrapper/TestWrapper";
import HomeScreen from "@/app/(app)/home";
import { mockAuth, mockAuthenticatedAuth } from "../utils/auth-mock";

/**
 * Mocking the supabase client (signed in user)
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

// Mock the useAuth hook with a signed in user
jest.mock("@/context/auth/AuthContext", () => ({
  ...jest.requireActual("@/context/auth/AuthContext"),
  useAuth: () => mockAuthenticatedAuth,
}));

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // This will unmount any rendered components
    jest.clearAllMocks();
  });

  it("should render", () => {
    renderWithAuth(<HomeScreen />);
  });
});
