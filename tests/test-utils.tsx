import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { ThemeProvider } from "@react-navigation/native";
import { DefaultTheme } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Modified approach to avoid direct import of GluestackUIProvider
// This creates a mock wrapper instead of using the actual provider
const MockGluestackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

// Create a wrapper for components that need providers
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <MockGluestackProvider>
        <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
      </MockGluestackProvider>
    </QueryClientProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: TestProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react-native";

// Override render method
export { customRender as render };
