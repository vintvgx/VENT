// src/lib/supabase.js
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js'

// Get the variables from Expo Constants
const supabaseUrl = 'https://fkpjukpmuvdmfxshiarm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGp1a3BtdXZkbWZ4c2hpYXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTM2NDksImV4cCI6MjA1ODY2OTY0OX0.LCqb6fIHnKp3hnSU1NC2_7KGrHEBCqViYhUk2w9BJJU'

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  // Tells Supabase Auth to continuously refresh the session automatically
  // if the app is in the foreground. When this is added, you will continue
  // to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
  // `SIGNED_OUT` event if the user's session is terminated. This should
  // only be registered once.
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })