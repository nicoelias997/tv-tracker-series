import { h } from 'preact';

interface SkeletonGridProps {
  count?: number;
}

export default function SkeletonGrid({ count = 20 }: SkeletonGridProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      aria-label="Loading content"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card bg-white rounded-2xl overflow-hidden shadow-md">
          {/* Poster skeleton */}
          <div className="aspect-[2/3] skeleton bg-gray-200"></div>

          {/* Content skeleton */}
          <div className="p-5">
            {/* Title skeleton */}
            <div className="h-6 skeleton bg-gray-200 rounded mb-3 w-4/5"></div>

            {/* Year skeleton */}
            <div className="h-5 skeleton bg-gray-200 rounded mb-4 w-1/3"></div>

            {/* Button skeleton */}
            <div className="h-10 skeleton bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
