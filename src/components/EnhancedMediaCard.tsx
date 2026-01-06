import { h } from 'preact';
import { useState } from 'preact/hooks';
import { getPosterUrl, formatRating } from '../services/tmdb';
import StatusActions from './StatusActions';
import MediaModal from './MediaModal';
import Portal from './Portal';
import type { MediaType } from '../types/Media';
import { getProgress } from '../store/mediaStore';

interface EnhancedMediaCardProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  rating: number;
  mediaType: MediaType;
  showActions?: boolean;
  currentStatus?: 'want_to_watch' | 'watching' | 'completed' | null;
}

export default function EnhancedMediaCard({
  tmdbId,
  title,
  posterPath,
  releaseYear,
  rating,
  mediaType,
  showActions = true,
  currentStatus = null
}: EnhancedMediaCardProps) {
  const [showModal, setShowModal] = useState(false);
  const posterUrl = getPosterUrl(posterPath, 'w500'); // Larger poster for bigger cards
  const formattedRating = formatRating(rating);
  const progress = mediaType === 'tv' && currentStatus === 'watching' ? getProgress(tmdbId, mediaType) : null;

  const handleCardClick = (e: any) => {
    // Don't open modal if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.status-actions-container')) {
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <article
        className="enhanced-media-card group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
        onClick={handleCardClick}
        data-tmdb-id={tmdbId}
        data-media-type={mediaType}
      >
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-200">
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Rating Badge */}
          {rating > 0 && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white' }}
              aria-label={`Rating: ${formattedRating} out of 10`}
            >
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{formattedRating}</span>
            </div>
          )}

          {/* Media Type Badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase backdrop-blur-md shadow-lg"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            aria-label={mediaType === 'movie' ? 'Movie' : 'TV Series'}
          >
            {mediaType === 'movie' ? '🎬 Movie' : '📺 TV'}
          </div>

          {/* Progress Badge for Watching TV Series */}
          {progress && (
            <div
              className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl text-sm font-semibold backdrop-blur-md shadow-lg"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: 'var(--color-primary-dark)' }}
            >
              S{progress.season} · E{progress.episode}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <div className="text-center">
              <div className="mb-2">
                <svg className="w-8 h-8 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-white text-sm font-semibold bg-black/40 px-4 py-2 rounded-lg backdrop-blur-sm">
                Click for Details
              </span>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-opacity-80 transition-colors" title={title}>
            {title}
          </h3>

          {/* Year */}
          <p className="text-gray-600 text-base mb-4">
            {releaseYear || 'N/A'}
          </p>

          {/* Action Buttons */}
          {showActions && (
            <div className="status-actions-container" onClick={(e) => e.stopPropagation()}>
              <StatusActions
                tmdbId={tmdbId}
                title={title}
                posterPath={posterPath}
                releaseYear={releaseYear}
                rating={rating}
                mediaType={mediaType}
                currentStatus={currentStatus}
              />
            </div>
          )}
        </div>
      </article>

      {/* Detail Modal - Rendered in Portal at body level */}
      {showModal && (
        <Portal>
          <MediaModal
            tmdbId={tmdbId}
            mediaType={mediaType}
            onClose={() => setShowModal(false)}
          />
        </Portal>
      )}
    </>
  );
}
