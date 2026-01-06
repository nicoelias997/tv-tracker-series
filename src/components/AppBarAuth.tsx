import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getUser, subscribeToSession } from '../store/sessionStore';
import { hasGuestData, clearGuestModeFlags } from '../store/appStore';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';
import Portal from './Portal';
import type { User } from '@supabase/supabase-js';
import { showDataMigrationOffer, showError, showSuccess } from '../lib/sweetalert';

export default function AppBarAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());

    // Subscribe to session changes
    const unsubscribe = subscribeToSession((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async () => {
    setShowAuthModal(false);
    // User state will be updated via the session subscription

    // Check if user has guest data to migrate
    if (hasGuestData()) {
      const { getGuestDataCount, migrateGuestDataToSupabase, clearLocalCache } = await import('../store/mediaStore');
      const itemCount = getGuestDataCount();

      if (itemCount > 0) {
        // Offer to migrate data
        const shouldMigrate = await showDataMigrationOffer(itemCount);

        if (shouldMigrate) {
          try {
            const migratedCount = await migrateGuestDataToSupabase();
            showSuccess(
              'Data Migrated!',
              `${migratedCount} item${migratedCount !== 1 ? 's' : ''} saved to your account`
            );
            clearGuestModeFlags();
          } catch (error) {
            console.error('Error migrating data:', error);
            showError('Migration Failed', 'Some items could not be migrated. Please try again.');
          }
        } else {
          // User chose not to migrate - clear guest data
          clearLocalCache();
          clearGuestModeFlags();
        }
      }
    }

    // Load user data from Supabase
    const { loadFromSupabase } = await import('../store/mediaStore');
    await loadFromSupabase();
  };

  const handleLogout = async () => {
    console.log('🚪 [Logout] Starting logout process...');

    // Step 1: Reset initialization flags to show loading screen
    const { resetInitialization } = await import('../store/appStore');
    resetInitialization();

    // Step 2: Clear local media store cache
    const { clearAll } = await import('../store/mediaStore');
    clearAll();
    clearGuestModeFlags();

    // Step 3: Update UI to show logged out state
    setUser(null);

    console.log('✅ [Logout] Logout complete - app will re-initialize');
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-8 bg-white/20 rounded-lg animate-pulse"></div>
        <div className="w-20 h-8 bg-white/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        // Logged in - show user menu
        <UserMenu user={user} onLogout={handleLogout} />
      ) : (
        // Logged out - show login/signup buttons
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoginClick}
            className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-white"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUpClick}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Auth Modal - Rendered in Portal at body level */}
      {showAuthModal && (
        <Portal>
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleAuthSuccess}
          />
        </Portal>
      )}
    </>
  );
}
