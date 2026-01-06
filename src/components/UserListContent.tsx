import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { MediaItem, WatchStatus } from '../types/Media';
import { getByStatus, loadFromSupabase } from '../store/mediaStore';
import { isAuthenticated } from '../store/appStore';
import EnhancedMediaCard from './EnhancedMediaCard';
import { MediaCardSkeletonGrid } from './MediaCardSkeleton';

interface UserListContentProps {
  status: WatchStatus;
  title: string;
  icon: string;
  emptyMessage: string;
}

export default function UserListContent({ status, title, icon, emptyMessage }: UserListContentProps) {
  const [items, setItems] = useState<MediaItem[]>(() => {
    // Initialize with data from store immediately (already loaded during bootstrap)
    return getByStatus(status);
  });

  const loadItems = () => {
    setItems(getByStatus(status));
  };

  useEffect(() => {
    // Just load items from the already-hydrated store
    // No need to call loadFromSupabase - data was loaded during app bootstrap
    loadItems();

    // Listen for store updates
    const handleUpdate = () => loadItems();
    window.addEventListener('mediaStoreUpdate', handleUpdate);

    return () => {
      window.removeEventListener('mediaStoreUpdate', handleUpdate);
    };
  }, [status]);

  return (
    <div>
      {items.length === 0 ? (
        /* Empty State - Only shown after loading is complete */
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-8xl mb-6" aria-hidden="true">{icon}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Nothing Here Yet</h2>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            {emptyMessage}
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Browse Content
          </a>
        </div>
      ) : (
        <>
          {/* Items Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{items.length}</span> {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            role="list"
            aria-label={title}
          >
            {items.map((item) => (
              <div key={`${item.mediaType}-${item.tmdbId}`} role="listitem">
                <EnhancedMediaCard
                  tmdbId={item.tmdbId}
                  title={item.title}
                  posterPath={item.posterPath}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  mediaType={item.mediaType}
                  currentStatus={item.status}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
