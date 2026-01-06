import type { User, Session } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '../services/authService';

// Session state
let currentUser: User | null = null;
let currentSession: Session | null = null;
let listeners: Array<(user: User | null) => void> = [];

/**
 * Initialize session from Supabase
 */
export async function initializeSession(): Promise<void> {
  const session = await getSession();
  currentSession = session;
  currentUser = session?.user || null;

  // Subscribe to auth state changes
  onAuthStateChange((session) => {
    currentSession = session;
    currentUser = session?.user || null;
    notifyListeners();
  });
}

/**
 * Get current user
 */
export function getUser(): User | null {
  return currentUser;
}

/**
 * Get current session
 */
export function getSessionData(): Session | null {
  return currentSession;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return currentUser !== null;
}

/**
 * Subscribe to session changes
 */
export function subscribeToSession(callback: (user: User | null) => void): () => void {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(listener => listener !== callback);
  };
}

/**
 * Notify all listeners of session change
 */
function notifyListeners(): void {
  listeners.forEach(listener => listener(currentUser));
}

/**
 * Set user (used after login)
 */
export function setUser(user: User | null): void {
  currentUser = user;
  notifyListeners();
}

/**
 * Clear session (used after logout)
 */
export function clearSession(): void {
  currentUser = null;
  currentSession = null;
  notifyListeners();
}
