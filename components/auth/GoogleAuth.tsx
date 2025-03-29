import {
    GoogleSignin,
    GoogleSigninButton,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
  } from '@react-native-google-signin/google-signin'
  import { supabase } from '@/lib/supabase/supabase'
  
  export default function () {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      iosClientId: "49402666160-hrdp0lalkae29cjs5biltjbv9cbc2tsb.apps.googleusercontent.com",
      webClientId: '49402666160-vs5sjj0q2td8k3320j0or0v0fag0k7lr.apps.googleusercontent.com',
      profileImageSize: 150
    })
  
    return (
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices()
            const response = await GoogleSignin.signIn()
            if(isSuccessResponse(response)) {
               const {idToken, user} = response.data

               const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken!!
              })
            }

            // if (userInfo.data && userInfo.data.idToken) {
            //   const { data, error } = await supabase.auth.signI nWithIdToken({
            //     provider: 'google',
            //     token: userInfo.data.idToken,
            //   })
            //   console.log(error, data)
            // } else {
            //   throw new Error('no ID token present!')
            // }
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