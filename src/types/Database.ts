export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_media: {
        Row: {
          id: string
          user_id: string
          tmdb_id: number
          media_type: 'movie' | 'tv'
          status: 'want_to_watch' | 'watching' | 'completed'
          current_season: number | null
          current_episode: number | null
          title: string
          poster_path: string | null
          release_year: string
          rating: number
          overview: string | null
          runtime: number | null
          number_of_seasons: number | null
          number_of_episodes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tmdb_id: number
          media_type: 'movie' | 'tv'
          status: 'want_to_watch' | 'watching' | 'completed'
          current_season?: number | null
          current_episode?: number | null
          title: string
          poster_path?: string | null
          release_year: string
          rating: number
          overview?: string | null
          runtime?: number | null
          number_of_seasons?: number | null
          number_of_episodes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tmdb_id?: number
          media_type?: 'movie' | 'tv'
          status?: 'want_to_watch' | 'watching' | 'completed'
          current_season?: number | null
          current_episode?: number | null
          title?: string
          poster_path?: string | null
          release_year?: string
          rating?: number
          overview?: string | null
          runtime?: number | null
          number_of_seasons?: number | null
          number_of_episodes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
