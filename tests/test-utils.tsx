import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

// Create a wrapper for components that need providers
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={DefaultTheme}>
        {children}
      </ThemeProvider>
    </GluestackUIProvider>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: TestProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render }; 