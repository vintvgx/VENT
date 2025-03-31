import { AuthProvider, useAuth } from "@/context/auth/AuthContext";
import "@/global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import LoadingScreen from "./components/LoadingScreen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      console.log("Font loading complete, hiding splash");
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep the splash screen visible while fonts load
  }

  // Render the AuthProvider, once font is loaded
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Separate component for content after authentication is initialized
function AppContent() {
  const { authState } = useAuth();
  const colorScheme = useColorScheme();
    
  if (authState.loading) {
    return <LoadingScreen />;
  }

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* Don't wrap Slot in Stack here */}
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}