import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Router } from 'wouter';
import { initializeSession, isLoggedIn } from '../store/sessionStore';
import { loadFromSupabase } from '../store/mediaStore';
import { markAuthResolved, markDataHydrated, isAppInitialized, subscribeToAppState } from '../store/appStore';
import { registerServiceWorker } from '../lib/registerSW';
import AppShell from './AppShell';
import AppLoadingScreen from './AppLoadingScreen';

/**
 * Root App Component
 *
 * This is the single entry point for the entire SPA.
 * Responsibilities:
 * 1. Initialize auth session (once)
 * 2. Load data from appropriate source (Supabase or localStorage)
 * 3. Register service worker for PWA
 * 4. Show loading screen until appInitialized === true
 * 5. Render AppShell (which contains router and all views)
 *
 * The app mounts ONCE and never unmounts.
 * No page reloads. All navigation is client-side.
 */
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [bootstrapComplete, setBootstrapComplete] = useState(false);

  // Bootstrap phase: runs when app mounts or when initialization is reset
  useEffect(() => {
    // Check if we need to re-bootstrap (e.g., after logout)
    if (!isAppInitialized() && bootstrapComplete) {
      console.log('🔄 [SPA Bootstrap] Re-initialization detected, resetting bootstrap...');
      setBootstrapComplete(false);
      setInitialized(false);
    }

    if (bootstrapComplete) return;

    const bootstrap = async () => {
      try {
        console.log('🚀 [SPA Bootstrap] Starting application initialization...');

        // Step 1: Initialize authentication
        console.log('🔐 [SPA Bootstrap] Initializing auth session...');
        await initializeSession();
        const loggedIn = isLoggedIn();
        console.log(`✅ [SPA Bootstrap] Auth resolved: ${loggedIn ? 'authenticated' : 'guest mode'}`);
        markAuthResolved();

        // Step 2: Load data from appropriate source
        if (loggedIn) {
          console.log('📥 [SPA Bootstrap] Loading data from Supabase...');
          await loadFromSupabase();
          console.log('✅ [SPA Bootstrap] Data loaded from Supabase');
        } else {
          console.log('📂 [SPA Bootstrap] Guest mode - using localStorage');
        }
        markDataHydrated();

        // Step 3: Register service worker for PWA
        console.log('📲 [SPA Bootstrap] Registering service worker...');
        registerServiceWorker();

        console.log('🎉 [SPA Bootstrap] Application bootstrap complete!');
        setBootstrapComplete(true);
      } catch (error) {
        console.error('❌ [SPA Bootstrap] Bootstrap failed:', error);
        // Mark as resolved anyway to prevent infinite loading
        markAuthResolved();
        markDataHydrated();
        setBootstrapComplete(true);
      }
    };

    bootstrap();
  }, [bootstrapComplete, initialized]);

  // Subscribe to app initialization state
  useEffect(() => {
    // Check if already initialized
    if (isAppInitialized()) {
      setInitialized(true);
      return;
    }

    // Subscribe to app state changes
    const unsubscribe = subscribeToAppState((state) => {
      if (state.appInitialized) {
        console.log('✨ [SPA] App initialization complete - rendering UI');
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  // Show loading screen until app is initialized
  if (!initialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 z-[100000]">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mb-8 text-8xl animate-bounce">
            🎬
          </div>

          {/* App Name */}
          <h1
            className="text-4xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Media Tracker
          </h1>

          {/* Loading Spinner */}
          <div className="flex justify-center mb-4">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200"
              style={{ borderTopColor: 'var(--color-primary)' }}
              aria-hidden="true"
            ></div>
          </div>

          {/* Loading Text */}
          <p className="text-gray-600 text-lg animate-pulse">
            Initializing your experience...
          </p>
        </div>
      </div>
    );
  }

  // App is initialized - render the full app shell with router
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
