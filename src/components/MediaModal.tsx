import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { MediaType, TMDBMovieDetails, TMDBTVDetails } from '../types/Media';
import { getMovieDetails, getTVSeriesDetails, getPosterUrl, getBackdropUrl, formatRating } from '../services/tmdb';
import { getProgress, updateProgress } from '../store/mediaStore';

interface MediaModalProps {
  tmdbId: number;
  mediaType: MediaType;
  onClose: () => void;
}

export default function MediaModal({ tmdbId, mediaType, onClose }: MediaModalProps) {
  const [details, setDetails] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ season: number; episode: number } | null>(null);
  const [editingProgress, setEditingProgress] = useState(false);
  const [tempSeason, setTempSeason] = useState(1);
  const [tempEpisode, setTempEpisode] = useState(1);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = mediaType === 'movie'
          ? await getMovieDetails(tmdbId)
          : await getTVSeriesDetails(tmdbId);

        setDetails(data);

        // Load progress if TV series
        if (mediaType === 'tv') {
          const savedProgress = getProgress(tmdbId, mediaType);
          if (savedProgress) {
            setProgress(savedProgress);
            setTempSeason(savedProgress.season);
            setTempEpisode(savedProgress.episode);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    // Close modal on ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [tmdbId, mediaType, onClose]);

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSaveProgress = () => {
    if (mediaType === 'tv') {
      updateProgress(tmdbId, mediaType, tempSeason, tempEpisode);
      setProgress({ season: tempSeason, episode: tempEpisode });
      setEditingProgress(false);
    }
  };

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTitle = () => {
    if (!details) return '';
    return 'title' in details ? details.title : details.name;
  };

  const getReleaseDate = () => {
    if (!details) return '';
    const date = 'release_date' in details ? details.release_date : details.first_air_date;
    return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent" aria-hidden="true"></div>
            <p className="mt-4 text-gray-600">Loading details...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Details</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : details ? (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Backdrop Image */}
            {details.backdrop_path && (
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
                <img
                  src={getBackdropUrl(details.backdrop_path)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Title and Rating */}
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={getPosterUrl(details.poster_path, 'w342')}
                    alt={`${getTitle()} poster`}
                    className="w-32 md:w-40 object-cover"
                    style={{ display: 'block' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <h2 id="modal-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {getTitle()}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {/* Rating */}
                    {details.vote_average > 0 && (
                      <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full">
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">{formatRating(details.vote_average)}</span>
                      </div>
                    )}

                    {/* Media Type */}
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      {mediaType === 'movie' ? '🎬 Movie' : '📺 TV Series'}
                    </span>

                    {/* Release Date */}
                    <span className="text-gray-600 text-sm">{getReleaseDate()}</span>
                  </div>

                  {/* Runtime / Seasons */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    {'runtime' in details && details.runtime && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatRuntime(details.runtime)}</span>
                      </div>
                    )}

                    {'number_of_seasons' in details && details.number_of_seasons && (
                      <>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span>{details.number_of_seasons} Season{details.number_of_seasons !== 1 ? 's' : ''}</span>
                        </div>
                        {details.number_of_episodes && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <span>{details.number_of_episodes} Episode{details.number_of_episodes !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Progress Tracking for TV Series */}
                  {mediaType === 'tv' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Watching Progress
                      </h3>

                      {editingProgress ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label htmlFor="season" className="text-sm text-gray-600">Season:</label>
                            <input
                              id="season"
                              type="number"
                              min="1"
                              max={('number_of_seasons' in details && details.number_of_seasons) || 999}
                              value={tempSeason}
                              onChange={(e) => setTempSeason(parseInt((e.target as HTMLInputElement).value) || 1)}
                              className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label htmlFor="episode" className="text-sm text-gray-600">Episode:</label>
                            <input
                              id="episode"
                              type="number"
                              min="1"
                              value={tempEpisode}
                              onChange={(e) => setTempEpisode(parseInt((e.target as HTMLInputElement).value) || 1)}
                              className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                            />
                          </div>
                          <button
                            onClick={handleSaveProgress}
                            className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProgress(false)}
                            className="px-4 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {progress ? (
                            <p className="text-gray-700">
                              Currently on: <span className="font-semibold">S{progress.season} · E{progress.episode}</span>
                            </p>
                          ) : (
                            <p className="text-gray-500 text-sm">No progress tracked yet</p>
                          )}
                          <button
                            onClick={() => setEditingProgress(true)}
                            className="px-4 py-1 text-sm font-medium hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {progress ? 'Update' : 'Set Progress'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  {details.overview || 'No overview available.'}
                </p>
              </div>

              {/* Genres */}
              {'genres' in details && details.genres && details.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
