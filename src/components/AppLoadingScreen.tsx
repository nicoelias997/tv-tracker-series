import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { isAppInitialized, subscribeToAppState } from '../store/appStore';

interface AppLoadingScreenProps {
  children: any;
}

/**
 * Global app loading screen
 * Shows loading state until app is fully initialized
 * Prevents render flicker by not showing children until ready
 */
export default function AppLoadingScreen({ children }: AppLoadingScreenProps) {
  const [initialized, setInitialized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if already initialized
    if (isAppInitialized()) {
      setInitialized(true);
      return;
    }

    // Subscribe to app state changes
    const unsubscribe = subscribeToAppState((state) => {
      if (state.appInitialized) {
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="text-center">
          {/* Placeholder during SSR */}
        </div>
      </div>
    );
  }

  // Show loading screen if not initialized
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
            Loading your experience...
          </p>
        </div>
      </div>
    );
  }

  // App is initialized - render children
  return <>{children}</>;
}
