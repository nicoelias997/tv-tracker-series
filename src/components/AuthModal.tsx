import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { signIn, signUp } from '../services/authService';
import { showDuplicateEmailError, showAuthError, showSuccess } from '../lib/sweetalert';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ mode: initialMode, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLInputElement>(null);

  // Validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  // Animation on mount
  useEffect(() => {
    // Trigger animation after mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Focus first input
    setTimeout(() => {
      firstFocusableRef.current?.focus();
    }, 100);

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [loading]);

  // Focus trapping
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [mode]);

  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    // Clear any validation errors when closing
    setEmailError(null);
    setPasswordError(null);
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    console.log('Form submitted', { mode, email, hasPassword: !!password });

    // Validation
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    console.log('Validation results:', { isEmailValid, isPasswordValid });

    if (!isEmailValid || !isPasswordValid) {
      console.log('Validation failed, not submitting');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      console.log('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log(`Attempting ${mode}...`, { email });

      const result = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);

      console.log(`${mode} result:`, {
        hasUser: !!result.user,
        hasSession: !!result.session,
        hasError: !!result.error,
        errorMessage: result.error?.message
      });

      if (result.error) {
        setLoading(false);

        // Check for duplicate email error - be more specific
        const errorMsg = result.error.message.toLowerCase();
        console.log('Auth error:', errorMsg);

        // Supabase duplicate user error: "User already registered"
        if (errorMsg.includes('user already registered') || errorMsg.includes('email address already exists')) {
          await showDuplicateEmailError();
          // Switch to login mode for convenience
          if (mode === 'signup') {
            setMode('login');
          }
        } else {
          // Show generic auth error with user-friendly message
          await showAuthError(result.error.message);
        }
        return;
      }

      // Handle signup confirmation requirement
      if (mode === 'signup') {
        if (!result.session) {
          // Email confirmation required
          setLoading(false);
          await showSuccess(
            'Account Created!',
            'Please check your email to confirm your account. Once confirmed, you can sign in.'
          );
          // Switch to login mode for next step
          setMode('login');
          setEmail(email);
          setPassword('');
          setConfirmPassword('');
          return;
        }
        // If session exists, signup with auto-confirm is enabled
        console.log('✅ Signup successful with auto-confirm');
      }

      // Success - proceed with onSuccess callback
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      await showAuthError(errorMessage);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmailError(null);
    setPasswordError(null);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative transform transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          zIndex: 100000,
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 id="auth-modal-title" className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' ? 'Sign in to access your watchlist' : 'Sign up to start tracking your media'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              ref={firstFocusableRef}
              id="email"
              type="email"
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
              onBlur={() => !isClosing && validateEmail(email)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                emailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              style={!emailError ? { focusRingColor: 'var(--color-primary)' } : {}}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
              onBlur={() => !isClosing && validatePassword(password)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                passwordError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
              }`}
              style={!passwordError ? { focusRingColor: 'var(--color-primary)' } : {}}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onInput={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ focusRingColor: 'var(--color-primary)' }}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <button
            onClick={switchMode}
            className="text-sm hover:underline"
            style={{ color: 'var(--color-primary)' }}
            disabled={loading}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
