/**
 * Layout for (auth) directory
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade',
    }} />
  );
}