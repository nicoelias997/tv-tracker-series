import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { WatchStatus, MediaType } from '../types/Media';
import {
  addToList,
  removeFromList,
  updateStatus,
  getItemStatus,
  movieToMediaItem,
  tvToMediaItem,
} from '../store/mediaStore';
import {
  shouldShowGuestWarning,
  markGuestWarningShown,
  markHasGuestData,
  isGuestMode,
} from '../store/appStore';
import type { TMDBMovie, TMDBTVSeries } from '../types/Media';
import {
  showGuestModeInfo,
  showRemoveConfirmation,
  showStatusChangeConfirmation,
  showError,
} from '../lib/sweetalert';

interface StatusActionsProps {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  releaseYear: string;
  rating: number;
  mediaType: MediaType;
  currentStatus?: WatchStatus | null;
}

export default function StatusActions({
  tmdbId,
  title,
  posterPath,
  releaseYear,
  rating,
  mediaType,
  currentStatus: initialStatus = null,
}: StatusActionsProps) {
  // Always start with null to avoid hydration mismatch
  const [currentStatus, setCurrentStatus] = useState<WatchStatus | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Update status when store changes
  useEffect(() => {
    setMounted(true);

    const updateCurrentStatus = () => {
      const status = getItemStatus(tmdbId, mediaType);
      setCurrentStatus(status);
    };

    // Listen for store updates
    window.addEventListener('mediaStoreUpdate', updateCurrentStatus);
    updateCurrentStatus();

    return () => {
      window.removeEventListener('mediaStoreUpdate', updateCurrentStatus);
    };
  }, [tmdbId, mediaType]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="w-full">
        <div className="w-full bg-gray-200 animate-pulse h-10 rounded-lg"></div>
      </div>
    );
  }

  const handleAddToList = async (status: WatchStatus) => {
    try {
      // Show guest mode info on first add (non-blocking)
      if (shouldShowGuestWarning()) {
        // Show info but don't block - user can continue
        await showGuestModeInfo();
        markGuestWarningShown();
      }

      // Create media item
      const mediaItem =
        mediaType === 'movie'
          ? movieToMediaItem(
              {
                id: tmdbId,
                title,
                poster_path: posterPath,
                release_date: `${releaseYear}-01-01`,
                vote_average: rating,
              } as TMDBMovie,
              status
            )
          : tvToMediaItem(
              {
                id: tmdbId,
                name: title,
                poster_path: posterPath,
                first_air_date: `${releaseYear}-01-01`,
                vote_average: rating,
              } as TMDBTVSeries,
              status
            );

      await addToList(mediaItem);

      // Mark that user has guest data if in guest mode
      if (isGuestMode()) {
        markHasGuestData();
      }

      setShowMenu(false);
    } catch (error) {
      console.error('Error adding to list:', error);
      showError('Failed to add item', 'Please try again');
    }
  };

  const handleUpdateStatus = async (newStatus: WatchStatus) => {
    // Ask for confirmation before changing status
    const confirmed = await showStatusChangeConfirmation(title, newStatus);
    if (!confirmed) {
      setShowMenu(false);
      return;
    }

    try {
      await updateStatus(tmdbId, mediaType, newStatus);
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating status:', error);
      showError('Failed to update status', 'Please try again');
    }
  };

  const handleRemove = async () => {
    // Ask for confirmation before removing
    const confirmed = await showRemoveConfirmation(title);
    if (!confirmed) {
      return;
    }

    try {
      await removeFromList(tmdbId, mediaType);
    } catch (error) {
      console.error('Error removing from list:', error);
      showError('Failed to remove item', 'Please try again');
    }
  };

  const statusLabels = {
    want_to_watch: 'Want to Watch',
    watching: 'Watching',
    completed: 'Completed',
  };

  const statusColors = {
    want_to_watch: 'bg-blue-500 hover:bg-blue-600',
    watching: 'bg-amber-500 hover:bg-amber-600',
    completed: 'bg-emerald-500 hover:bg-emerald-600',
  };

  if (!currentStatus) {
    // Not in list - show "Add to List" button with dropdown
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          onBlur={() => setTimeout(() => setShowMenu(false), 200)}
          className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          aria-label="Add to list"
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          + Add to List
        </button>

        {showMenu && (
          <div
            className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10 animate-fade-in"
            role="menu"
            aria-label="Select watch status"
          >
            <button
              onClick={() => handleAddToList('want_to_watch')}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 transition-colors focus:outline-none focus:bg-blue-100"
              role="menuitem"
            >
              📋 Want to Watch
            </button>
            <button
              onClick={() => handleAddToList('watching')}
              className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-gray-700 transition-colors focus:outline-none focus:bg-yellow-100"
              role="menuitem"
            >
              👀 Watching
            </button>
            <button
              onClick={() => handleAddToList('completed')}
              className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 transition-colors focus:outline-none focus:bg-green-100"
              role="menuitem"
            >
              ✅ Completed
            </button>
          </div>
        )}
      </div>
    );
  }

  // In list - show current status and options to change
  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          onBlur={() => setTimeout(() => setShowMenu(false), 200)}
          className={`w-full ${statusColors[currentStatus]} text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
          aria-label={`Current status: ${statusLabels[currentStatus]}. Click to change`}
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          {statusLabels[currentStatus]} ▼
        </button>

        {showMenu && (
          <div
            className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10 animate-fade-in"
            role="menu"
            aria-label="Change watch status"
          >
            {currentStatus !== 'want_to_watch' && (
              <button
                onClick={() => handleUpdateStatus('want_to_watch')}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 transition-colors focus:outline-none focus:bg-blue-100"
                role="menuitem"
              >
                📋 Want to Watch
              </button>
            )}
            {currentStatus !== 'watching' && (
              <button
                onClick={() => handleUpdateStatus('watching')}
                className="w-full text-left px-4 py-2 hover:bg-yellow-50 text-gray-700 transition-colors focus:outline-none focus:bg-yellow-100"
                role="menuitem"
              >
                👀 Watching
              </button>
            )}
            {currentStatus !== 'completed' && (
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="w-full text-left px-4 py-2 hover:bg-green-50 text-gray-700 transition-colors focus:outline-none focus:bg-green-100"
                role="menuitem"
              >
                ✅ Completed
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        aria-label={`Remove ${title} from list`}
      >
        Remove
      </button>
    </div>
  );
}
