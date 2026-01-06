import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { useLocation } from 'wouter';
import AppBarAuth from './AppBarAuth';
import NavLinks from './NavLinks';

/**
 * AppBar - Fixed top navigation component
 *
 * This component is part of the persistent App Shell.
 * It never unmounts during navigation.
 * Uses wouter's useLocation for active link detection.
 */
export default function AppBar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav
        className="app-bar fixed top-0 left-0 right-0 z-50 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #8b7fc7 0%, #b4a9db 100%)',
          backdropFilter: 'blur(10px)'
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <a
              href="/"
              className="flex items-center space-x-3 text-white font-bold text-xl hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
              aria-label="Go to home page"
            >
              <span className="text-2xl" aria-hidden="true">🎬</span>
              <span className="hidden sm:inline">Media Tracker</span>
              <span className="sm:hidden">Media</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1" role="menubar">
              <div className="flex space-x-1">
                <NavLinks currentPath={location} />
              </div>

              {/* Auth Component */}
              <div className="ml-4 pl-4 border-l border-white/20">
                <AppBarAuth />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="md:hidden pb-4"
              role="menu"
            >
              <NavLinks currentPath={location} isMobile={true} />

              {/* Mobile Auth */}
              <div className="mt-4 pt-4 border-t border-white/20 px-4">
                <AppBarAuth />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" aria-hidden="true"></div>

      {/* Inline styles for nav-link hover effect */}
      <style>{`
        .nav-link {
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: white;
          transition: width 0.3s ease, left 0.3s ease;
        }

        .nav-link:hover::after {
          width: 80%;
          left: 10%;
        }
      `}</style>
    </>
  );
}
