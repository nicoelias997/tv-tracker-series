import { h } from 'preact';
import UserListContent from '../components/UserListContent';

/**
 * Watching View
 *
 * Client-side view for the Currently Watching list.
 */
export default function WatchingView() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <span className="text-6xl" aria-hidden="true">👀</span>
          <h1 className="text-5xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Watching
          </h1>
        </div>
        <p className="text-gray-600 text-lg ml-20">
          Movies and TV series you're currently watching
        </p>
      </header>

      {/* User List Content */}
      <UserListContent
        status="watching"
        title="Watching"
        icon="👀"
        emptyMessage="Add content you're actively watching to keep track of your progress."
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
        <p className="mt-2">
          Built by{' '}
          <a
            href="https://chipper-puffpuff-ffcd43.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Nico
          </a>
        </p>
      </footer>
    </main>
  );
}
