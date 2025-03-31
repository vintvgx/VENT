import { useTheme } from '@react-navigation/native';
import { View, ActivityIndicator, useColorScheme } from 'react-native';

export default function LoadingScreen() {
    const colorScheme = useColorScheme();
    const theme = useTheme()

    // const theme = {
    //  background: colorScheme === 'dark' ? '#121212' : 'white',
    //  primary: colorScheme === 'dark' ? 'white' : 'black'
    //   };
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background
    //   backgroundColor: colorScheme.background  //TODO update to use theme color
    }}>
      <ActivityIndicator 
      size="large" 
      color="black"//{colors.primary} //TODO update to use theme color
      />
    </View>
  );
} 