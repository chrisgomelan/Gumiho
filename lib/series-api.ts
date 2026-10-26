import type { SeriesBase, SeriesFull, Season, Episode } from "@/types/series";

const TVMAZE_BASE = "https://api.tvmaze.com";

function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export function getImageUrl(path: string | null | undefined, _size?: string): string {
  if (!path) {
    return "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&auto=format&fit=crop&q=80";
  }
  return path;
}

function mapTvMazeShowToBase(show: any, forcedRegion?: "ko" | "en"): SeriesBase {
  const isKorean =
    forcedRegion === "ko" ||
    show.language?.toLowerCase() === "korean" ||
    show.network?.country?.code === "KR";

  return {
    id: show.id,
    imdb_id: show.externals?.imdb || null,
    name: show.name,
    original_name: show.name,
    overview: stripHtml(show.summary),
    poster_path: show.image?.original || show.image?.medium || null,
    backdrop_path: show.image?.original || null,
    first_air_date: show.premiered || null,
    vote_average: show.rating?.average || 7.5,
    origin_country: isKorean ? ["KR"] : ["US"],
    original_language: isKorean ? "ko" : "en",
    genres: show.genres || [],
  };
}

async function fetchTvMazeShowByName(name: string, forcedRegion?: "ko" | "en"): Promise<SeriesBase | null> {
  try {
    const res = await fetch(
      `${TVMAZE_BASE}/singlesearch/shows?q=${encodeURIComponent(name)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return mapTvMazeShowToBase(data, forcedRegion);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Verified Korean Dramas Only (K-Dramas)
// ---------------------------------------------------------------------------

const POPULAR_KDRAMAS = [
  "Squid Game",
  "Crash Landing on You",
  "Queen of Tears",
  "All of Us Are Dead",
  "The Glory",
  "Moving",
  "Vincenzo",
  "Descendants of the Sun",
  "Sweet Home",
  "Hospital Playlist",
  "Itaewon Class",
  "Goblin",
  "Hotel Del Luna",
  "Extraordinary Attorney Woo",
  "My Demon",
  "Marry My Husband",
  "Signal",
  "Kingdom",
  "Twenty-Five Twenty-One",
  "Business Proposal",
  "Alchemy of Souls",
  "A Shop for Killers",
  "Strong Girl Bong-soon",
  "Weightlifting Fairy Kim Bok-Joo",
];

// ---------------------------------------------------------------------------
// Verified American & Western Series Only
// ---------------------------------------------------------------------------

const POPULAR_WESTERN = [
  "Stranger Things",
  "The Last of Us",
  "Breaking Bad",
  "The Bear",
  "Severance",
  "Shogun",
  "Fallout",
  "House of the Dragon",
  "The Boys",
  "Wednesday",
  "Game of Thrones",
  "Loki",
  "Better Call Saul",
  "Succession",
  "True Detective",
  "Fargo",
  "The White Lotus",
  "Chernobyl",
  "Peaky Blinders",
  "Yellowstone",
  "Arcane",
  "Dark",
  "Mindhunter",
  "Andor",
];

export async function fetchTrendingKDramas(): Promise<SeriesBase[]> {
  const results = await Promise.all(
    POPULAR_KDRAMAS.map((title) => fetchTvMazeShowByName(title, "ko"))
  );
  return results.filter((item): item is SeriesBase => item !== null && item.original_language === "ko");
}

export async function fetchTrendingWestern(): Promise<SeriesBase[]> {
  const results = await Promise.all(
    POPULAR_WESTERN.map((title) => fetchTvMazeShowByName(title, "en"))
  );
  return results.filter((item): item is SeriesBase => item !== null && item.original_language === "en");
}

export async function fetchTopRatedGlobal(): Promise<SeriesBase[]> {
  const [kdramas, western] = await Promise.all([
    fetchTrendingKDramas(),
    fetchTrendingWestern(),
  ]);
  return [...western, ...kdramas].sort(
    (a, b) => b.vote_average - a.vote_average
  );
}

export async function searchSeries(
  query: string,
  regionFilter?: "all" | "ko" | "en"
): Promise<SeriesBase[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(query.trim())}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];

    const data: Array<{ score: number; show: any }> = await res.json();
    let results = data.map((item) => mapTvMazeShowToBase(item.show));

    if (regionFilter && regionFilter !== "all") {
      results = results.filter((s) => s.original_language === regionFilter);
    }

    return results;
  } catch {
    return [];
  }
}

export async function fetchSeriesDetails(id: number): Promise<SeriesFull | null> {
  try {
    const res = await fetch(
      `${TVMAZE_BASE}/shows/${id}?embed[]=cast&embed[]=episodes&embed[]=seasons`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const base = mapTvMazeShowToBase(data);

    const rawSeasons: any[] = data._embedded?.seasons || [];
    const rawEpisodes: any[] = data._embedded?.episodes || [];
    const rawCast: any[] = data._embedded?.cast || [];

    const seasons: Season[] = rawSeasons.map((s) => {
      const seasonEps = rawEpisodes
        .filter((ep) => ep.season === s.number)
        .map((ep) => ({
          id: ep.id,
          episode_number: ep.number,
          season_number: ep.season,
          name: ep.name || `Episode ${ep.number}`,
          overview: stripHtml(ep.summary),
          still_path: ep.image?.original || ep.image?.medium || null,
          air_date: ep.airdate || null,
          vote_average: ep.rating?.average || 7.5,
        }));

      return {
        id: s.id,
        season_number: s.number,
        name: s.name || `Season ${s.number}`,
        overview: stripHtml(s.summary),
        poster_path: s.image?.original || s.image?.medium || base.poster_path,
        episode_count: s.episodeOrder || seasonEps.length || 1,
        air_date: s.premiereDate || null,
        episodes: seasonEps,
      };
    });

    if (seasons.length === 0 && rawEpisodes.length > 0) {
      const seasonNumbers = Array.from(
        new Set(rawEpisodes.map((ep) => ep.season))
      );
      seasonNumbers.forEach((sNum) => {
        const seasonEps = rawEpisodes
          .filter((ep) => ep.season === sNum)
          .map((ep) => ({
            id: ep.id,
            episode_number: ep.number,
            season_number: ep.season,
            name: ep.name || `Episode ${ep.number}`,
            overview: stripHtml(ep.summary),
            still_path: ep.image?.original || ep.image?.medium || null,
            air_date: ep.airdate || null,
            vote_average: ep.rating?.average || 7.5,
          }));

        seasons.push({
          id: sNum,
          season_number: sNum,
          name: `Season ${sNum}`,
          poster_path: base.poster_path,
          episode_count: seasonEps.length,
          air_date: seasonEps[0]?.air_date || null,
          episodes: seasonEps,
        });
      });
    }

    const cast = rawCast.slice(0, 10).map((c) => ({
      id: c.person?.id || Math.random(),
      name: c.person?.name || "Actor",
      character: c.character?.name || "",
      profile_path: c.person?.image?.medium || null,
    }));

    return {
      ...base,
      status: data.status,
      network: data.network?.name || data.webChannel?.name,
      seasons: seasons.length > 0 ? seasons : [
        {
          id: 1,
          season_number: 1,
          name: "Season 1",
          poster_path: base.poster_path,
          episode_count: 12,
          air_date: base.first_air_date,
          episodes: [],
        },
      ],
      number_of_seasons: seasons.length || 1,
      number_of_episodes: rawEpisodes.length || 12,
      cast,
      similar: [],
    };
  } catch {
    return null;
  }
}
