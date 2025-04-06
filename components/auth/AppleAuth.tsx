import { StyleSheet, Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import React from "react";
import { supabase } from "@/lib/supabase/supabase";
import { updateUserMetadata } from "@/utils/auth/function";
import { TOAST, useShowToast } from "../ui/toast/useToast";

const AppleAuth = () => {
  const showToast = useShowToast();

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={5}
      style={{ width: 200, height: 64 }}
      onPress={async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
          // Sign in via Supabase Auth.
          if (credential.identityToken) {
            const { error, data } = await supabase.auth.signInWithIdToken({
              provider: "apple",
              token: credential.identityToken,
            });

            if (error) {
              throw error;
            }

            // Update user metadata if sign-in was successful
            if (data.user) {
              const metadataResult = await updateUserMetadata({
                firstName: credential.fullName?.givenName,
                lastName: credential.fullName?.familyName,
                email: credential.email,
              });

              if (!metadataResult.success) {
                console.warn(
                  "User created but metadata update failed:",
                  metadataResult.error
                );
                showToast(
                  TOAST.INFO,
                  "User authenticated successfully. METADATA NOT UPDATED!"
                );
                return;
              }

              console.log("User metadata saved successfully");
            }

            // User is signed in
            console.log("Apple authentication successful:", data.user);
            showToast(TOAST.SUCCESS, `${data.user.email} authenticated successfully`)
          } else {
            throw new Error("No identityToken.");
          }
        } catch (e: unknown) {
          showToast(TOAST.ERROR, e as string)
          if (
            e instanceof Error &&
            "code" in e &&
            e.code === "ERR_REQUEST_CANCELED"
          ) {
            console.log("User canceled Apple sign-in");
          } else {
            console.error("Apple sign-in error:", e);
          }
        }
      }}
    />
  );
};

export default AppleAuth;

const styles = StyleSheet.create({});
