/**
 * Global Application Store
 * Manages auth state, guest mode, and UI state in a unified way
 */

import type { User } from '@supabase/supabase-js';
import { subscribeToSession, getUser } from './sessionStore';

// Store state
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  guestModeWarningShown: boolean;
  hasGuestData: boolean;
  // Initialization flags
  authResolved: boolean;
  dataHydrated: boolean;
  appInitialized: boolean;
}

// Listeners
type AppStateListener = (state: AppState) => void;
let listeners: AppStateListener[] = [];

// Initial state
let state: AppState = {
  user: null,
  isAuthenticated: false,
  guestModeWarningShown: false,
  hasGuestData: false,
  // Initialization flags - start as false
  authResolved: false,
  dataHydrated: false,
  appInitialized: false,
};

// Local storage keys
const GUEST_WARNING_KEY = 'tmdb_guest_warning_shown';
const HAS_GUEST_DATA_KEY = 'tmdb_has_guest_data';

/**
 * Initialize the app store
 */
export function initializeAppStore(): void {
  // Load guest mode flags from localStorage
  if (typeof window !== 'undefined') {
    state.guestModeWarningShown = localStorage.getItem(GUEST_WARNING_KEY) === 'true';
    state.hasGuestData = localStorage.getItem(HAS_GUEST_DATA_KEY) === 'true';
  }

  // Get initial auth state (may be null if session not loaded yet)
  state.user = getUser();
  state.isAuthenticated = state.user !== null;

  // Subscribe to session changes - this will update when session is initialized
  subscribeToSession((user) => {
    const wasAuthenticated = state.isAuthenticated;
    state.user = user;
    state.isAuthenticated = user !== null;

    // Only notify if auth state actually changed to avoid unnecessary re-renders
    if (wasAuthenticated !== state.isAuthenticated) {
      console.log('Auth state changed:', state.isAuthenticated ? 'logged in' : 'logged out');
    }
    notifyListeners();
  });

  // Don't notify yet - wait for session to be initialized
}

/**
 * Get current app state
 */
export function getAppState(): AppState {
  return { ...state };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return state.isAuthenticated;
}

/**
 * Check if user is in guest mode (not authenticated)
 */
export function isGuestMode(): boolean {
  return !state.isAuthenticated;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return state.user;
}

/**
 * Mark that guest mode warning has been shown
 */
export function markGuestWarningShown(): void {
  state.guestModeWarningShown = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_WARNING_KEY, 'true');
  }
  notifyListeners();
}

/**
 * Check if guest warning should be shown
 */
export function shouldShowGuestWarning(): boolean {
  return isGuestMode() && !state.guestModeWarningShown;
}

/**
 * Mark that user has guest data
 */
export function markHasGuestData(): void {
  state.hasGuestData = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem(HAS_GUEST_DATA_KEY, 'true');
  }
  notifyListeners();
}

/**
 * Check if user has guest data
 */
export function hasGuestData(): boolean {
  return state.hasGuestData;
}

/**
 * Clear guest mode flags (called after migration or on logout)
 */
export function clearGuestModeFlags(): void {
  state.guestModeWarningShown = false;
  state.hasGuestData = false;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_WARNING_KEY);
    localStorage.removeItem(HAS_GUEST_DATA_KEY);
  }
  notifyListeners();
}

/**
 * Subscribe to app state changes
 */
export function subscribeToAppState(callback: AppStateListener): () => void {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(): void {
  const currentState = { ...state };
  listeners.forEach(listener => listener(currentState));
}

/**
 * Mark auth as resolved
 */
export function markAuthResolved(): void {
  state.authResolved = true;
  console.log('Auth resolved');
  checkAndMarkAppInitialized();
}

/**
 * Mark data as hydrated
 */
export function markDataHydrated(): void {
  state.dataHydrated = true;
  console.log('Data hydrated');
  checkAndMarkAppInitialized();
}

/**
 * Check if app is fully initialized and mark it
 */
function checkAndMarkAppInitialized(): void {
  if (state.authResolved && state.dataHydrated && !state.appInitialized) {
    state.appInitialized = true;
    console.log('🎉 App fully initialized!');
    notifyListeners();
  }
}

/**
 * Check if app is initialized
 */
export function isAppInitialized(): boolean {
  return state.appInitialized;
}

/**
 * Check if auth is resolved
 */
export function isAuthResolved(): boolean {
  return state.authResolved;
}

/**
 * Check if data is hydrated
 */
export function isDataHydrated(): boolean {
  return state.dataHydrated;
}

/**
 * Reset initialization flags
 * Call this when logging out to force re-initialization
 */
export function resetInitialization(): void {
  state.authResolved = false;
  state.dataHydrated = false;
  state.appInitialized = false;
  console.log('🔄 Initialization flags reset');
  notifyListeners();
}

// Initialize on module load (browser only)
if (typeof window !== 'undefined') {
  initializeAppStore();
}
