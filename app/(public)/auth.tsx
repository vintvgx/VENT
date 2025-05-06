import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, ButtonText } from "@/components/ui/button";
import { useShowToast } from "@/components/ui/toast/useToast";
import { signInWithApple, signInWithGoogle } from "@/utils/auth/function";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  View
} from "react-native";

const { height, width } = Dimensions.get("window")

const AuthScreen = () => {
  const showToast = useShowToast();

  const theme = useTheme();
  //TODO Check if authGuard is needed 
  // This will redirect away if user is already authenticated
  // useAuthGuard(false, false);

  const [isAuthVisible, setIsAuthVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(height)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  const showAuthPanel = () => {
    setIsAuthVisible(true)
    // Animate auth panel up
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
    
    // Animate content up to make room for auth panel
    Animated.timing(contentAnim, {
      toValue: -height * 0.25, // Move up by approximately half the auth panel height
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  const hideAuthPanel = () => {
    // Animate auth panel down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsAuthVisible(false)
    })
    
    // Animate content back to original position
    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Hide header */}
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      {/* App Title */}
 

      {/* Main content */}
      <Animated.View 
        style={[
          styles.contentContainer,
          { transform: [{ translateY: contentAnim }] }
        ]}
      >
        {/* TODO Fix title display */}
        {/* <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.appTitle}>VENT</ThemedText>
        <ThemedText style={styles.appTagline}>Connect • Share • Heal</ThemedText>
      </View> */}

        <ThemedView style={styles.card}>
          <ThemedText type="title" style={styles.headerText}>Connect with others through shared experiences</ThemedText>
          <ThemedText type="subtitle" style={styles.subHeaderText}>A safe space for peer-to-peer support</ThemedText>

          {/* Card with content */}
          <ThemedView style={styles.noteCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar} />
              <View style={[styles.avatar, { marginLeft: -10 }]} />
              <View style={[styles.avatar, { marginLeft: -10 }]} />
              <ThemedText style={styles.shareText}>Share</ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.noteTitle}>Community Support</ThemedText>

            <View style={styles.bulletContainer}>
              <ThemedText style={styles.bulletPoint}>
                • Connect with others who understand your journey
              </ThemedText>
              <ThemedText style={styles.bulletPoint}>
                • Share experiences in a safe, supportive environment
              </ThemedText>
            </View>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Upcoming events</ThemedText>
            <ThemedText style={styles.eventText}>
              Join our weekly support circles and guided discussions
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Animated.View>

      {/* Sign In / Sign Up button */}
      <Button
        style={styles.signButton}
        onPress={showAuthPanel} //TODO update to handleMobileAuth when isAuthVisible
        accessibilityLabel="Sign up or sign in"
        action="secondary"
        variant="solid"
      >
        <Ionicons color={theme.dark ? 'black' : 'white'} name={isAuthVisible ? "call-outline" : "person-outline"} size={24} />
        <ButtonText className="ml-2" variant="solid">{isAuthVisible ? "Continue with Mobile" : "Sign Up / Sign In"}</ButtonText>
      </Button>

      <Animated.View
        style={[
          styles.authPanel,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Button
          style={styles.closeButton}
          onPress={hideAuthPanel}
          variant="link"
          action="default"
        >
          <Ionicons color={theme.dark ? 'white' : 'black'} name="chevron-down" size={24} />
        </Button>

        <ThemedText type="title" style={styles.authTitle}>Let's get started</ThemedText>
        <ThemedText type="subtitle" style={styles.authSubtitle}>
          Welcome to Vent—a safe space to share and connect.
        </ThemedText>

        <View style={styles.authButtons}>
          <Button
            style={styles.socialButton}
            accessibilityLabel="Continue with Google"
            action="primary"
            variant="outline"
            onPress={() => signInWithGoogle(showToast)}
          >
            <Ionicons name="logo-google" size={24} color="#4285F4" />
            <ButtonText variant="solid" style={styles.buttonText}>Continue with Google</ButtonText>
          </Button>

          <Button
            style={styles.socialButton}
            accessibilityLabel="Continue with Apple"
            action="primary"
            variant="outline"
            onPress={() => signInWithApple(showToast)} 
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
            <ButtonText variant="solid" style={styles.buttonText}>Continue with Apple</ButtonText>
          </Button>

        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    position: 'absolute',
    top: Platform.OS === "ios" ? 60 : 40,
    width: '100%',
    height: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backgroundColor: 'red'
  },
  appTitle: {
    fontSize: 52,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
  },
  appTagline: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1,
    opacity: 0.8,
  },
  themeToggle: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 100 : 80, // Make room for the title
  },
  card: {
    width: "100%",
    height: "80%", // Adjusted to make room for the title
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#6a8caf'
  },
  headerText: {
    textAlign: "center",
    marginBottom: 10,
  },
  subHeaderText: {
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.9,
  },
  noteCard: {
    width: "90%",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ccc",
  },
  shareText: {
    marginLeft: 5,
    fontSize: 12,
    opacity: 0.7,
  },
  noteTitle: {
    fontSize: 22,
    marginBottom: 15,
  },
  bulletContainer: {
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  eventText: {
    fontSize: 14,
    lineHeight: 20,
  },
  signButton: {
    marginBottom: 40,
    borderRadius: 20,
    marginHorizontal: 45,
    height: 40,
  },
  signButtonText: {
    marginLeft: 8,
  },
  authPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "46%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingTop: 15,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    // backgroundColor: '#222',
  },
  closeButton: {
    alignSelf: "center",
    marginBottom: 10,
  },
  authTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: '#fff',
  },
  authSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 35,
    paddingHorizontal: 20,
    color: '#aaa',
    width: '70%',
    alignSelf: 'center'
  },
  authButtons: {
    width: "100%",
    // alignItems: "center",
    gap: 15,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderWidth: 0,
    marginHorizontal: 20,
    borderRadius: 20,
    height: 40,
    alignContent: 'center'
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
  }
});