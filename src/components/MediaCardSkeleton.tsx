import { h } from 'preact';

/**
 * Skeleton loader for media cards
 * Displayed while data is being loaded
 */
export default function MediaCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-gray-200"></div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Year */}
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>

        {/* Action Button */}
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

/**
 * Grid of skeleton loaders
 */
export function MediaCardSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MediaCardSkeleton key={index} />
      ))}
    </div>
  );
}
