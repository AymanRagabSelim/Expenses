import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Ideally, use expo-constants or .env, but for quick setup we paste keys.
// Replace these with your actual keys from the web project
const supabaseUrl = 'https://ouvmvcgjuneoenhqcdue.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dm12Y2dqdW5lb2VuaHFjZHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTE1ODgsImV4cCI6MjA4MDU4NzU4OH0.djVt1pY3u8KQxCCwrP1iHx-iFQNpltdl-Y1uqc3dHXc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
