import { h } from 'preact';
import UserListContent from '../components/UserListContent';

/**
 * Completed View
 *
 * Client-side view for the Completed list.
 */
export default function CompletedView() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-6xl" aria-hidden="true">✅</span>
          <h1 className="text-5xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Completed
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-20">
          Movies and TV series you've finished watching
        </p>
      </header>

      {/* User List Content */}
      <UserListContent
        status="completed"
        title="Completed"
        icon="✅"
        emptyMessage="Mark movies and TV series as completed to build your viewing history."
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
