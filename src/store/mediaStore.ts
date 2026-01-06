import type { MediaItem, WatchStatus, MediaType, UserMediaStore, TMDBMovie, TMDBTVSeries } from '../types/Media';
import { getYear } from '../services/tmdb';
import { isLoggedIn } from './sessionStore';
import * as userMediaService from '../services/userMediaService';

const STORAGE_KEY = 'tmdb_media_tracker_store';

// Initialize empty store structure
const emptyStore: UserMediaStore = {
  want_to_watch: [],
  watching: [],
  completed: []
};

// Get store from localStorage (cache)
function getLocalStore(): UserMediaStore {
  if (typeof window === 'undefined') {
    return emptyStore;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return emptyStore;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return emptyStore;
  }
}

// Save store to localStorage (cache)
function saveLocalStore(store: UserMediaStore): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    // Dispatch custom event for reactivity
    window.dispatchEvent(new CustomEvent('mediaStoreUpdate'));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Convert Supabase user_media to MediaItem
function supabaseToMediaItem(row: any): MediaItem {
  return {
    id: Date.now() + Math.random(), // For local compatibility
    tmdbId: row.tmdb_id,
    title: row.title,
    mediaType: row.media_type,
    posterPath: row.poster_path,
    releaseYear: row.release_year,
    rating: row.rating,
    status: row.status,
    addedAt: row.created_at,
    currentSeason: row.current_season,
    currentEpisode: row.current_episode,
    overview: row.overview,
    runtime: row.runtime,
    numberOfSeasons: row.number_of_seasons,
    numberOfEpisodes: row.number_of_episodes,
  };
}

// Convert MediaItem to Supabase insert format
function mediaItemToSupabase(item: MediaItem): any {
  return {
    tmdb_id: item.tmdbId,
    media_type: item.mediaType,
    status: item.status,
    current_season: item.currentSeason,
    current_episode: item.currentEpisode,
    title: item.title,
    poster_path: item.posterPath,
    release_year: item.releaseYear,
    rating: item.rating,
    overview: item.overview,
    runtime: item.runtime,
    number_of_seasons: item.numberOfSeasons,
    number_of_episodes: item.numberOfEpisodes,
  };
}

// Convert TMDB movie to MediaItem
export function movieToMediaItem(movie: TMDBMovie, status: WatchStatus): MediaItem {
  return {
    id: Date.now() + Math.random(), // Unique ID for our store
    tmdbId: movie.id,
    title: movie.title,
    mediaType: 'movie',
    posterPath: movie.poster_path,
    releaseYear: getYear(movie.release_date),
    rating: movie.vote_average,
    status,
    addedAt: new Date().toISOString(),
    overview: movie.overview,
  };
}

// Convert TMDB TV series to MediaItem
export function tvToMediaItem(tv: TMDBTVSeries, status: WatchStatus): MediaItem {
  return {
    id: Date.now() + Math.random(), // Unique ID for our store
    tmdbId: tv.id,
    title: tv.name,
    mediaType: 'tv',
    posterPath: tv.poster_path,
    releaseYear: getYear(tv.first_air_date),
    rating: tv.vote_average,
    status,
    addedAt: new Date().toISOString(),
    overview: tv.overview,
  };
}

// Load all media from Supabase and update cache
export async function loadFromSupabase(): Promise<void> {
  if (!isLoggedIn()) {
    return;
  }

  try {
    const media = await userMediaService.getAllUserMedia();
    const store: UserMediaStore = {
      want_to_watch: [],
      watching: [],
      completed: []
    };

    media.forEach(row => {
      const item = supabaseToMediaItem(row);
      store[item.status].push(item);
    });

    saveLocalStore(store);
  } catch (error) {
    console.error('Error loading from Supabase:', error);
  }
}

// Add media to a specific status list
export async function addToList(item: MediaItem): Promise<void> {
  // Check if user is authenticated
  if (isLoggedIn()) {
    try {
      // Add to Supabase
      await userMediaService.addUserMedia(mediaItemToSupabase(item));
    } catch (error) {
      console.error('Error adding to Supabase:', error);
      throw error;
    }
  }

  // Update local cache
  const store = getLocalStore();

  // Check if already exists in any list
  const allItems = [...store.want_to_watch, ...store.watching, ...store.completed];
  const exists = allItems.some(i => i.tmdbId === item.tmdbId && i.mediaType === item.mediaType);

  if (exists) {
    console.warn('Item already in list');
    return;
  }

  store[item.status].push(item);
  saveLocalStore(store);
}

// Remove media from all lists
export async function removeFromList(tmdbId: number, mediaType: MediaType): Promise<void> {
  // Remove from Supabase if authenticated
  if (isLoggedIn()) {
    try {
      await userMediaService.removeUserMedia(tmdbId, mediaType);
    } catch (error) {
      console.error('Error removing from Supabase:', error);
      throw error;
    }
  }

  // Update local cache
  const store = getLocalStore();
  store.want_to_watch = store.want_to_watch.filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType));
  store.watching = store.watching.filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType));
  store.completed = store.completed.filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType));
  saveLocalStore(store);
}

// Update status of media item
export async function updateStatus(tmdbId: number, mediaType: MediaType, newStatus: WatchStatus): Promise<void> {
  // Update in Supabase if authenticated
  if (isLoggedIn()) {
    try {
      await userMediaService.updateMediaStatus(tmdbId, mediaType, newStatus);
    } catch (error) {
      console.error('Error updating status in Supabase:', error);
      throw error;
    }
  }

  // Update local cache
  const store = getLocalStore();

  // Find item in all lists
  let item: MediaItem | undefined;
  for (const status of ['want_to_watch', 'watching', 'completed'] as WatchStatus[]) {
    item = store[status].find(i => i.tmdbId === tmdbId && i.mediaType === mediaType);
    if (item) {
      // Remove from current list
      store[status] = store[status].filter(i => !(i.tmdbId === tmdbId && i.mediaType === mediaType));
      break;
    }
  }

  if (!item) {
    console.warn('Item not found in any list');
    return;
  }

  // Update status and add to new list
  item.status = newStatus;
  store[newStatus].push(item);
  saveLocalStore(store);
}

// Get all items by status
export function getByStatus(status: WatchStatus): MediaItem[] {
  const store = getLocalStore();
  return store[status];
}

// Check if item exists in any list
export function isInList(tmdbId: number, mediaType: MediaType): boolean {
  const store = getLocalStore();
  const allItems = [...store.want_to_watch, ...store.watching, ...store.completed];
  return allItems.some(i => i.tmdbId === tmdbId && i.mediaType === mediaType);
}

// Get current status of an item
export function getItemStatus(tmdbId: number, mediaType: MediaType): WatchStatus | null {
  const store = getLocalStore();

  for (const status of ['want_to_watch', 'watching', 'completed'] as WatchStatus[]) {
    const item = store[status].find(i => i.tmdbId === tmdbId && i.mediaType === mediaType);
    if (item) {
      return status;
    }
  }

  return null;
}

// Get all items
export function getAllItems(): MediaItem[] {
  const store = getLocalStore();
  return [...store.want_to_watch, ...store.watching, ...store.completed];
}

// Update progress for TV series
export async function updateProgress(
  tmdbId: number,
  mediaType: MediaType,
  currentSeason: number,
  currentEpisode: number
): Promise<void> {
  if (mediaType !== 'tv') {
    console.warn('Progress tracking is only for TV series');
    return;
  }

  // Update in Supabase if authenticated
  if (isLoggedIn()) {
    try {
      await userMediaService.updateTVProgress(tmdbId, currentSeason, currentEpisode);
    } catch (error) {
      console.error('Error updating progress in Supabase:', error);
      throw error;
    }
  }

  // Update local cache
  const store = getLocalStore();
  let found = false;

  // Find and update item across all status lists
  for (const status of ['want_to_watch', 'watching', 'completed'] as WatchStatus[]) {
    const item = store[status].find(i => i.tmdbId === tmdbId && i.mediaType === mediaType);
    if (item) {
      item.currentSeason = currentSeason;
      item.currentEpisode = currentEpisode;
      found = true;
      break;
    }
  }

  if (found) {
    saveLocalStore(store);
  } else {
    console.warn('Item not found for progress update');
  }
}

// Get progress for a TV series
export function getProgress(tmdbId: number, mediaType: MediaType): { season: number; episode: number } | null {
  if (mediaType !== 'tv') return null;

  const store = getLocalStore();

  for (const status of ['want_to_watch', 'watching', 'completed'] as WatchStatus[]) {
    const item = store[status].find(i => i.tmdbId === tmdbId && i.mediaType === mediaType);
    if (item && item.currentSeason !== undefined && item.currentEpisode !== undefined) {
      return {
        season: item.currentSeason,
        episode: item.currentEpisode
      };
    }
  }

  return null;
}

// Clear all data (local cache only)
export function clearLocalCache(): void {
  saveLocalStore(emptyStore);
}

// Clear all data including Supabase (called on logout)
export function clearAll(): void {
  clearLocalCache();
}

/**
 * Get count of items in guest data
 */
export function getGuestDataCount(): number {
  const store = getLocalStore();
  return store.want_to_watch.length + store.watching.length + store.completed.length;
}

/**
 * Migrate guest data to Supabase (called after login/signup)
 * Returns the number of items migrated
 */
export async function migrateGuestDataToSupabase(): Promise<number> {
  if (!isLoggedIn()) {
    throw new Error('User must be logged in to migrate data');
  }

  const guestStore = getLocalStore();
  const allGuestItems = [...guestStore.want_to_watch, ...guestStore.watching, ...guestStore.completed];

  if (allGuestItems.length === 0) {
    return 0;
  }

  let migratedCount = 0;

  // Migrate each item to Supabase
  for (const item of allGuestItems) {
    try {
      await userMediaService.addUserMedia(mediaItemToSupabase(item));
      migratedCount++;
    } catch (error) {
      console.error('Error migrating item:', item.title, error);
      // Continue with other items even if one fails
    }
  }

  // After successful migration, reload from Supabase to get the complete state
  await loadFromSupabase();

  return migratedCount;
}
