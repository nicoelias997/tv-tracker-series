import { supabase } from '../lib/supabaseClient';
import type { MediaType, WatchStatus } from '../types/Media';
import type { Database } from '../types/Database';

type UserMedia = Database['public']['Tables']['user_media']['Row'];
type UserMediaInsert = Database['public']['Tables']['user_media']['Insert'];
type UserMediaUpdate = Database['public']['Tables']['user_media']['Update'];

/**
 * Get all media items for the current user
 */
export async function getAllUserMedia(): Promise<UserMedia[]> {
  const { data, error } = await supabase
    .from('user_media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user media:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get user media items by status
 */
export async function getUserMediaByStatus(status: WatchStatus): Promise<UserMedia[]> {
  const { data, error } = await supabase
    .from('user_media')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user media by status:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific media item
 */
export async function getUserMedia(tmdbId: number, mediaType: MediaType): Promise<UserMedia | null> {
  const { data, error } = await supabase
    .from('user_media')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching user media:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new media item to user's list
 */
export async function addUserMedia(mediaData: Omit<UserMediaInsert, 'user_id'>): Promise<UserMedia> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_media')
    .insert({
      ...mediaData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding user media:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing media item
 */
export async function updateUserMedia(
  tmdbId: number,
  mediaType: MediaType,
  updates: Partial<UserMediaUpdate>
): Promise<UserMedia> {
  const { data, error } = await supabase
    .from('user_media')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType)
    .select()
    .single();

  if (error) {
    console.error('Error updating user media:', error);
    throw error;
  }

  return data;
}

/**
 * Update media status
 */
export async function updateMediaStatus(
  tmdbId: number,
  mediaType: MediaType,
  status: WatchStatus
): Promise<UserMedia> {
  return updateUserMedia(tmdbId, mediaType, { status });
}

/**
 * Update TV series progress
 */
export async function updateTVProgress(
  tmdbId: number,
  currentSeason: number,
  currentEpisode: number
): Promise<UserMedia> {
  return updateUserMedia(tmdbId, 'tv', {
    current_season: currentSeason,
    current_episode: currentEpisode,
  });
}

/**
 * Remove a media item from user's list
 */
export async function removeUserMedia(tmdbId: number, mediaType: MediaType): Promise<void> {
  const { error } = await supabase
    .from('user_media')
    .delete()
    .eq('tmdb_id', tmdbId)
    .eq('media_type', mediaType);

  if (error) {
    console.error('Error removing user media:', error);
    throw error;
  }
}

/**
 * Check if a media item exists in user's list
 */
export async function hasUserMedia(tmdbId: number, mediaType: MediaType): Promise<boolean> {
  const media = await getUserMedia(tmdbId, mediaType);
  return media !== null;
}

/**
 * Get the status of a specific media item
 */
export async function getMediaStatus(tmdbId: number, mediaType: MediaType): Promise<WatchStatus | null> {
  const media = await getUserMedia(tmdbId, mediaType);
  return media?.status || null;
}

/**
 * Get TV series progress
 */
export async function getTVProgress(tmdbId: number): Promise<{ season: number; episode: number } | null> {
  const media = await getUserMedia(tmdbId, 'tv');

  if (!media || !media.current_season || !media.current_episode) {
    return null;
  }

  return {
    season: media.current_season,
    episode: media.current_episode,
  };
}
