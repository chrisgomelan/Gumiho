export type WatchStatus = "watching" | "completed" | "plan_to_watch";

export interface Genre {
  id?: number;
  name: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  overview?: string;
  poster_path: string | null;
  episode_count: number;
  air_date: string | null;
  episodes?: Episode[];
}

export interface SeriesBase {
  id: number;
  imdb_id?: string | null;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  origin_country: string[];
  original_language: string;
  genres: string[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface SeriesFull extends SeriesBase {
  tagline?: string;
  status?: string;
  network?: string;
  seasons: Season[];
  number_of_seasons: number;
  number_of_episodes: number;
  cast?: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
  similar?: SeriesBase[];
}

export interface SeriesSavepoint {
  id: number;
  series_id?: number;
  tmdb_id?: number;
  imdb_id?: string | null;
  title: string;
  poster: string;
  backdrop?: string;
  status: WatchStatus;
  season: number;
  episode: number;
  totalSeasons?: number;
  origin_country?: string[];
  timestamp?: number;
  duration?: number;
  updatedAt: number;
}

export type SeriesSavepointStore = Record<string, SeriesSavepoint>;
