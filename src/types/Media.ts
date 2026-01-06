// TMDB API Response Types
export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  runtime?: number; // In minutes
}

export interface TMDBTVSeries {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

// Detailed movie response (from /movie/{id})
export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  budget: number;
  revenue: number;
  status: string;
}

// Detailed TV response (from /tv/{id})
export interface TMDBTVDetails extends TMDBTVSeries {
  number_of_seasons: number;
  number_of_episodes: number;
  genres: Array<{ id: number; name: string }>;
  status: string;
  type: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// App Types
export type MediaType = 'movie' | 'tv';
export type WatchStatus = 'want_to_watch' | 'watching' | 'completed';

export interface MediaItem {
  id: number;
  tmdbId: number;
  title: string;
  mediaType: MediaType;
  posterPath: string | null;
  releaseYear: string;
  rating: number;
  status: WatchStatus;
  addedAt: string;
  // Progress tracking for TV series
  currentSeason?: number;
  currentEpisode?: number;
  // Cached details for modal display
  overview?: string;
  runtime?: number; // For movies
  numberOfSeasons?: number; // For TV
  numberOfEpisodes?: number; // For TV
}

export interface UserMediaStore {
  want_to_watch: MediaItem[];
  watching: MediaItem[];
  completed: MediaItem[];
}
