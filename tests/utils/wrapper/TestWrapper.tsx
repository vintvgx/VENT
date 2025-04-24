import { AuthProvider } from "@/context/auth/AuthContext";
import { render, waitFor, act } from "@testing-library/react-native";
import { ReactNode } from "react";

/**
 * Wrapper for the test component with proper async initialization
 */
export const TestWrapper = ({ children }: { children: ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
  };
  
  /**
   * Helper function to render with the TestWrapper and wait for initialization
   */
  export const renderWithAuth = async (ui: React.ReactElement) => {
    const result = render(ui, { wrapper: TestWrapper });
    
    // Wait for auth initialization to complete
    await act(async () => {
      await waitFor(() => {
        // This will wait until initialization completes
      }, { timeout: 1000 });
    });
    
    return result;
  };