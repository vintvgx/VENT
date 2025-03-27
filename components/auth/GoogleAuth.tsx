import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes,
  } from '@react-native-google-signin/google-signin'
  import { supabase } from '@/lib/supabase/supabase'
  
  export default function () {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: 'YOUR CLIENT ID FROM GOOGLE CONSOLE',
    })
  
    return (
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices()
            const userInfo = await GoogleSignin.signIn()
            if (userInfo.data && userInfo.data.idToken) {
              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: userInfo.data.idToken,
              })
              console.log(error, data)
            } else {
              throw new Error('no ID token present!')
            }
          } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
              // user cancelled the login flow
              console.error("User cancelled the login flow")
            } else if (error.code === statusCodes.IN_PROGRESS) {
              // operation (e.g. sign in) is in progress already
              console.error("User sign in is in progress")
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
              // play services not available or outdated
              console.error("Google play service is not available")
            } else {
              // some other error happened
              console.error("Unknown error occurred.")
            }
          }
        }}
      />
    )
  }