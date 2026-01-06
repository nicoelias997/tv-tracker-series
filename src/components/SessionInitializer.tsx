import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { initializeSession, isLoggedIn } from '../store/sessionStore';
import { loadFromSupabase } from '../store/mediaStore';
import { markAuthResolved, markDataHydrated } from '../store/appStore';
import { registerServiceWorker } from '../lib/registerSW';

/**
 * Component that initializes the Supabase session on app load
 * This should be rendered once at the root of the app
 * Marks auth and data as resolved to enable app initialization
 */
export default function SessionInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Prevent re-initialization
    if (initialized) return;

    const initialize = async () => {
      try {
        console.log('🔄 Initializing session...');

        // Step 1: Initialize auth session from Supabase
        await initializeSession();
        const loggedIn = isLoggedIn();
        console.log(`✅ Auth resolved: ${loggedIn ? 'authenticated' : 'guest mode'}`);

        // Mark auth as resolved
        markAuthResolved();

        // Step 2: Load media data
        if (loggedIn) {
          console.log('📥 Loading data from Supabase...');
          await loadFromSupabase();
          console.log('✅ Data loaded from Supabase');
        } else {
          console.log('📂 Guest mode - using localStorage');
        }

        // Mark data as hydrated
        markDataHydrated();

        // Step 3: Register service worker for PWA
        registerServiceWorker();

        setInitialized(true);
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);

        // Even on error, mark as resolved to prevent infinite loading
        markAuthResolved();
        markDataHydrated();
        setInitialized(true);
      }
    };

    initialize();
  }, [initialized]);

  // This component doesn't render anything
  return null;
}
