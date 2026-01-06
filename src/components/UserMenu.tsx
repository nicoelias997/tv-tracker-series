import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { signOut } from '../services/authService';
import type { User } from '@supabase/supabase-js';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoggingOut(false);
      setIsOpen(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ focusRingColor: 'var(--color-primary)' }}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {getInitials(user.email || 'U')}
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Signed in
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></span>
                Signing out...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
