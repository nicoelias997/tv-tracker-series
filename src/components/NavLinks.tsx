import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Link } from 'wouter';

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface NavLinksProps {
  currentPath: string;
  isMobile?: boolean;
}

// All navigation links - always visible regardless of auth state
const navLinks: NavLink[] = [
  { href: '/', label: 'Browse', icon: '🎬' },
  { href: '/want-to-watch', label: 'Want to Watch', icon: '📋' },
  { href: '/watching', label: 'Watching', icon: '👀' },
  { href: '/completed', label: 'Completed', icon: '✅' }
];

export default function NavLinks({ currentPath, isMobile = false }: NavLinksProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className={isMobile ? 'space-y-2' : 'flex space-x-1'}>
        <div className={isMobile ? 'h-12 bg-white/10 rounded-lg animate-pulse' : 'h-10 w-24 bg-white/10 rounded-lg animate-pulse'}></div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <>
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
              currentPath === link.href
                ? 'bg-white/20 font-semibold'
                : 'hover:bg-white/10'
            }`}
            aria-current={currentPath === link.href ? 'page' : undefined}
            role="menuitem"
          >
            <span className="mr-2" aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link px-4 py-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
            currentPath === link.href
              ? 'bg-white/20 font-semibold'
              : 'hover:bg-white/10'
          }`}
          aria-current={currentPath === link.href ? 'page' : undefined}
          role="menuitem"
        >
          <span className="mr-2" aria-hidden="true">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </>
  );
}
