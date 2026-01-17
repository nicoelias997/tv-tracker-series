import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import BrowseContent from '../components/BrowseContent';
import { getPopularMovies, getPopularTVSeries } from '../services/tmdb';
import type { TMDBMovie, TMDBTVSeries } from '../types/Media';

/**
 * Browse View - Main discovery page
 *
 * Client-side view for browsing popular movies and TV series.
 * Fetches initial data on mount.
 */
export default function BrowseView() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [tvSeries, setTVSeries] = useState<TMDBTVSeries[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [moviesResponse, tvResponse] = await Promise.all([
          getPopularMovies(1),
          getPopularTVSeries(1)
        ]);
        setMovies(moviesResponse.results);
        setTVSeries(tvResponse.results);
        setError(null);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load content';
        setError(errorMessage);
        console.error('Error fetching TMDB data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1
          className="text-5xl md:text-6xl font-bold mb-4 py-2 px-1"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.2
          }}
        >
          Discover Amazing Content
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
          Browse popular movies and TV series, search for your favorites, and track what you're watching
        </p>
      </header>

      {error ? (
        /* Error State */
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center" role="alert">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error Loading Content</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">
            Please check that your TMDB API key is configured correctly in the .env file
          </p>
        </div>
      ) : (
        /* Browse Component with Search & Pagination */
        <BrowseContent
          initialMovies={movies}
          initialTVSeries={tvSeries}
        />
      )}

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
