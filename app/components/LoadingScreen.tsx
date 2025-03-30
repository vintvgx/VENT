import { View, ActivityIndicator, useColorScheme } from 'react-native';

export default function LoadingScreen() {
    const colorScheme = useColorScheme();
  
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: "white"
    //   backgroundColor: colorScheme.background  //TODO update to use theme color
    }}>
      <ActivityIndicator 
      size="large" 
      color="black"//{colors.primary} //TODO update to use theme color
      />
    </View>
  );
} 