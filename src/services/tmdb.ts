import type { TMDBMovie, TMDBTVSeries, TMDBMovieDetails, TMDBTVDetails, TMDBResponse } from '../types/Media';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Get API key from environment variable
// Note: In Astro, client-side code needs PUBLIC_ prefix
const getApiKey = (): string => {
  const apiKey = import.meta.env.PUBLIC_TMDB_API_KEY || import.meta.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB API key not configured. Please add PUBLIC_TMDB_API_KEY to your .env file.');
  }
  return apiKey;
};

// Generic fetch function with error handling
async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  const url = `${TMDB_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('TMDB fetch error:', error);
    throw error;
  }
}

// Fetch popular movies
export async function getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/movie/popular?page=${page}`);
}

// Fetch popular TV series
export async function getPopularTVSeries(page: number = 1): Promise<TMDBResponse<TMDBTVSeries>> {
  return tmdbFetch<TMDBResponse<TMDBTVSeries>>(`/tv/popular?page=${page}`);
}

// Get detailed movie information
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`);
}

// Get detailed TV series information
export async function getTVSeriesDetails(seriesId: number): Promise<TMDBTVDetails> {
  return tmdbFetch<TMDBTVDetails>(`/tv/${seriesId}`);
}

// Search for movies
export async function searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const encodedQuery = encodeURIComponent(query);
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/search/movie?query=${encodedQuery}&page=${page}`);
}

// Search for TV series
export async function searchTVSeries(query: string, page: number = 1): Promise<TMDBResponse<TMDBTVSeries>> {
  const encodedQuery = encodeURIComponent(query);
  return tmdbFetch<TMDBResponse<TMDBTVSeries>>(`/search/tv?query=${encodedQuery}&page=${page}`);
}

// Search for both movies and TV series
export async function searchMulti(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie | TMDBTVSeries>> {
  const encodedQuery = encodeURIComponent(query);
  return tmdbFetch<TMDBResponse<TMDBMovie | TMDBTVSeries>>(`/search/multi?query=${encodedQuery}&page=${page}`);
}

// Helper to get poster image URL
export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342'): string {
  if (!path) {
    return '/placeholder-poster.png'; // Fallback image
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Helper to get backdrop image URL
export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) {
    return '/placeholder-backdrop.png'; // Fallback image
  }
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Helper to extract year from date string
export function getYear(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  return dateString.split('-')[0];
}

// Helper to format rating
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
