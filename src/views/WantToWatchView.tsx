import { h } from 'preact';
import UserListContent from '../components/UserListContent';

/**
 * Want to Watch View
 *
 * Client-side view for the Want to Watch list.
 */
export default function WantToWatchView() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-6xl" aria-hidden="true">📋</span>
          <h1 className="text-5xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Want to Watch
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-20">
          Movies and TV series you've saved for later
        </p>
      </header>

      {/* User List Content */}
      <UserListContent
        status="want_to_watch"
        title="Want to Watch"
        icon="📋"
        emptyMessage="Start building your watchlist by browsing and adding content you want to watch."
      />

      {/* Footer */}
      <footer className="mt-20 text-center text-gray-500 text-sm">
        <p>
          Powered by{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            TMDB API
          </a>
        </p>
        <p className="mt-2">Built with Astro, Preact & Tailwind CSS</p>
      </footer>
    </main>
  );
}
