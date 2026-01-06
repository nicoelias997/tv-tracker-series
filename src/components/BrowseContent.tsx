import { h } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import type { TMDBMovie, TMDBTVSeries, MediaType } from '../types/Media';
import { getPopularMovies, getPopularTVSeries, searchMovies, searchTVSeries } from '../services/tmdb';
import { getItemStatus } from '../store/mediaStore';
import EnhancedMediaCard from './EnhancedMediaCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import SkeletonGrid from './SkeletonGrid';

interface BrowseContentProps {
  initialMovies?: TMDBMovie[];
  initialTVSeries?: TMDBTVSeries[];
}

export default function BrowseContent({ initialMovies = [], initialTVSeries = [] }: BrowseContentProps) {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [movies, setMovies] = useState<TMDBMovie[]>(initialMovies);
  const [tvSeries, setTVSeries] = useState<TMDBTVSeries[]>(initialTVSeries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch content based on search query, media type, and page
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (searchQuery && searchQuery.length >= 3) {
          // Search mode
          response = mediaType === 'movie'
            ? await searchMovies(searchQuery, currentPage)
            : await searchTVSeries(searchQuery, currentPage);
        } else {
          // Browse popular mode
          response = mediaType === 'movie'
            ? await getPopularMovies(currentPage)
            : await getPopularTVSeries(currentPage);
        }
        if (mediaType === 'movie') {
          setMovies(response.results as TMDBMovie[]);
        } else {
          setTVSeries(response.results as TMDBTVSeries[]);
        }

        setTotalPages(Math.min(response.total_pages, 500)); // TMDB limits to 500 pages
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [mediaType, searchQuery, currentPage]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  const handleMediaTypeChange = useCallback((type: MediaType) => {
    setMediaType(type);
    setCurrentPage(1); // Reset to first page on type change
    setSearchQuery(''); // Clear search when switching types
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentItems = mediaType === 'movie' ? movies : tvSeries;

  // Helper to get year
  const getYear = (item: TMDBMovie | TMDBTVSeries): string => {
    if ('release_date' in item) {
      return item.release_date?.split('-')[0] || 'N/A';
    } else if ('first_air_date' in item) {
      return item.first_air_date?.split('-')[0] || 'N/A';
    }
    return 'N/A';
  };

  // Helper to get title
  const getTitle = (item: TMDBMovie | TMDBTVSeries): string => {
    return 'title' in item ? item.title : item.name;
  };

  return (
    <div>
      {/* Search Bar */}
      <SearchBar
        placeholder={`Search ${mediaType === 'movie' ? 'movies' : 'TV series'}...`}
        onSearch={handleSearch}
        initialValue={searchQuery}
      />

      {/* Media Type Toggle */}
      <div className="flex justify-center mb-8" role="group" aria-label="Media type selection">
        <div className="inline-flex bg-gray-100 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => handleMediaTypeChange('movie')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              mediaType === 'movie'
                ? 'text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={mediaType === 'movie' ? {
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 2px 8px rgba(139, 127, 199, 0.3)'
            } : {}}
            aria-pressed={mediaType === 'movie'}
            aria-label="Show movies"
          >
            🎬 Movies
          </button>
          <button
            onClick={() => handleMediaTypeChange('tv')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              mediaType === 'tv'
                ? 'text-white shadow-md'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={mediaType === 'tv' ? {
              backgroundColor: 'var(--color-primary)',
              boxShadow: '0 2px 8px rgba(139, 127, 199, 0.3)'
            } : {}}
            aria-pressed={mediaType === 'tv'}
            aria-label="Show TV series"
          >
            📺 TV Series
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6 text-center">
        {searchQuery && searchQuery.length >= 3 ? (
          <div className="inline-block px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-900 font-medium">
              🔍 Searching for: <span className="font-bold">"{searchQuery}"</span>
              {!loading && currentItems.length > 0 && (
                <> - Found {currentItems.length} result{currentItems.length !== 1 ? 's' : ''} on this page</>
              )}
            </p>
          </div>
        ) : !searchQuery && !loading ? (
          <div className="inline-block px-6 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
            <p className="font-medium">
              📺 Browsing Popular {mediaType === 'movie' ? 'Movies' : 'TV Series'}
              {currentItems.length > 0 && <> - Page {currentPage} of {totalPages}</>}
            </p>
          </div>
        ) : null}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8" role="alert">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Content</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <SkeletonGrid count={20} />
      ) : currentItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            {searchQuery ? `No ${mediaType === 'movie' ? 'movies' : 'TV series'} found for "${searchQuery}"` : 'No content available'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 rounded-lg font-medium text-white shadow-sm hover:shadow-md transition-all"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Media Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            role="list"
            aria-label={mediaType === 'movie' ? 'Movies' : 'TV series'}
          >
            {currentItems.map((item) => {
              const currentStatus = getItemStatus(item.id, mediaType);
              return (
                <div key={`${mediaType}-${item.id}`} role="listitem">
                  <EnhancedMediaCard
                    tmdbId={item.id}
                    title={getTitle(item)}
                    posterPath={item.poster_path}
                    releaseYear={getYear(item)}
                    rating={item.vote_average}
                    mediaType={mediaType}
                    currentStatus={currentStatus}
                  />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
