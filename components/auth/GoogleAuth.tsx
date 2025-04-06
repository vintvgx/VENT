import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/lib/supabase/supabase";
import { updateUserMetadata } from "@/utils/auth/function";
import { TOAST, useShowToast } from "../ui/toast/useToast";

export default function () {
  const showToast = useShowToast();

  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    iosClientId:
      "49402666160-hrdp0lalkae29cjs5biltjbv9cbc2tsb.apps.googleusercontent.com",
    webClientId:
      "49402666160-vs5sjj0q2td8k3320j0or0v0fag0k7lr.apps.googleusercontent.com",
    profileImageSize: 150,
  });

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const response = await GoogleSignin.signIn();
          if (isSuccessResponse(response)) {
            const { idToken, user } = response.data;

            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: idToken!!,
            });

            if (data.session) {
              console.log(`Google user signed in: ${data.user.email}`);
            } else {
              console.error("Google sign-in failed with non-success response");
            }

            // Update user metadata if sign-in was successful
            if (data.user) {
              const metadataResult = await updateUserMetadata({
                firstName: user?.givenName,
                lastName: user?.familyName,
                email: user.email,
              });

              if (!metadataResult.success) {
                console.warn(
                  "User created but metadata update failed:",
                  metadataResult.error
                );
                showToast(
                  TOAST.INFO,
                  `${data.user.email} authenticated successfully. METADATA NOT UPDATED!`
                );
                return;
              }
              console.log("User metadata saved successfully");
            }

            console.log("Google authentication successful:", data.user);
            showToast(TOAST.SUCCESS, `${user.email} authenticated successfully`)
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
            console.error("User cancelled the login flow");
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // operation (e.g. sign in) is in progress already
            console.error("User sign in is in progress");
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
            console.error("Google play service is not available");
          } else {
            // some other error happened
            console.error("Unknown error occurred.");
          }
        }
      }}
    />
  );
}
