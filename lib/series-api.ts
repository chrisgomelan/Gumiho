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
// 80+ Verified Top Korean Dramas (K-Dramas)
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
  "Hometown Cha-Cha-Cha",
  "While You Were Sleeping",
  "What's Wrong with Secretary Kim",
  "W: Two Worlds",
  "Healer",
  "Moon Lovers: Scarlet Heart Ryeo",
  "It's Okay to Not Be Okay",
  "The Legend of the Blue Sea",
  "Pinocchio",
  "My Love from the Star",
  "Coffee Prince",
  "Reply 1988",
  "Mr. Sunshine",
  "Prison Playbook",
  "Beyond Evil",
  "Mouse",
  "Flower of Evil",
  "Taxi Driver",
  "Weak Hero Class 1",
  "D.P.",
  "Bloodhounds",
  "Extracurricular",
  "Juvenile Justice",
  "Strangers from Hell",
  "Happiness",
  "Death's Game",
  "Parasyte: The Grey",
  "Lovely Runner",
  "Hierarchy",
  "Gyeongseong Creature",
  "Daily Dose of Sunshine",
  "Castaway Diva",
  "Behind Your Touch",
  "King the Land",
  "See You in My 19th Life",
  "Celebrity",
  "The Good Bad Mother",
  "Doctor Cha",
  "Duty After School",
  "The Worst of Evil",
  "Twinkling Watermelon",
  "A Killer Paradox",
  "Pyramid Game",
  "The 8 Show",
  "Sweet Revenge",
  "True Beauty",
  "My Mister",
  "Our Blues",
  "Little Women",
  "Reborn Rich",
  "The Uncanny Counter",
  "Start-Up",
  "Doctor Romantic",
  "Voice",
  "Save Me",
  "My Name"
];

// ---------------------------------------------------------------------------
// 80+ Verified Top American & Western Series
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
  "The Sopranos",
  "The Wire",
  "Band of Brothers",
  "Fleabag",
  "Ted Lasso",
  "Sherlock",
  "Black Mirror",
  "Westworld",
  "The Mandalorian",
  "Daredevil",
  "The Witcher",
  "Invincible",
  "The Penguin",
  "X-Men '97",
  "Reacher",
  "Slow Horses",
  "Silo",
  "Foundation",
  "Only Murders in the Building",
  "Euphoria",
  "Rick and Morty",
  "Dexter",
  "Mad Men",
  "The Crown",
  "Homeland",
  "Lost",
  "Prison Break",
  "Suits",
  "The Office",
  "Friends",
  "Brooklyn Nine-Nine",
  "Modern Family",
  "Parks and Recreation",
  "Schitt's Creek",
  "Abbott Elementary",
  "The Walking Dead",
  "Supernatural",
  "Hannibal",
  "Boardwalk Empire",
  "Narcos",
  "Ozark",
  "Vikings",
  "Spartacus",
  "Rome",
  "Deadwood",
  "Justified",
  "The Americans",
  "Banshee",
  "Warrior",
  "Gotham",
  "The Flash",
  "Arrow",
  "Cobra Kai",
  "Lucifer",
  "The Umbrella Academy",
  "1899"
];

export async function fetchTrendingKDramas(limit = 18): Promise<SeriesBase[]> {
  const slice = POPULAR_KDRAMAS.slice(0, limit);
  const results = await Promise.all(
    slice.map((title) => fetchTvMazeShowByName(title, "ko"))
  );
  return results.filter((item): item is SeriesBase => item !== null && item.original_language === "ko");
}

export async function fetchTrendingWestern(limit = 18): Promise<SeriesBase[]> {
  const slice = POPULAR_WESTERN.slice(0, limit);
  const results = await Promise.all(
    slice.map((title) => fetchTvMazeShowByName(title, "en"))
  );
  return results.filter((item): item is SeriesBase => item !== null && item.original_language === "en");
}

export async function fetchTopRatedGlobal(limit = 18): Promise<SeriesBase[]> {
  const [kdramas, western] = await Promise.all([
    fetchTrendingKDramas(12),
    fetchTrendingWestern(12),
  ]);
  return [...western, ...kdramas].sort(
    (a, b) => b.vote_average - a.vote_average
  ).slice(0, limit);
}

// Paginated fetchers for Load More functionality
export async function fetchKDramasPaginated(
  page = 1,
  limit = 18
): Promise<{ items: SeriesBase[]; hasMore: boolean; total: number }> {
  const start = (page - 1) * limit;
  const slice = POPULAR_KDRAMAS.slice(start, start + limit);
  const results = await Promise.all(
    slice.map((title) => fetchTvMazeShowByName(title, "ko"))
  );
  const items = results.filter((item): item is SeriesBase => item !== null && item.original_language === "ko");
  const hasMore = start + limit < POPULAR_KDRAMAS.length;
  return { items, hasMore, total: POPULAR_KDRAMAS.length };
}

export async function fetchWesternPaginated(
  page = 1,
  limit = 18
): Promise<{ items: SeriesBase[]; hasMore: boolean; total: number }> {
  const start = (page - 1) * limit;
  const slice = POPULAR_WESTERN.slice(start, start + limit);
  const results = await Promise.all(
    slice.map((title) => fetchTvMazeShowByName(title, "en"))
  );
  const items = results.filter((item): item is SeriesBase => item !== null && item.original_language === "en");
  const hasMore = start + limit < POPULAR_WESTERN.length;
  return { items, hasMore, total: POPULAR_WESTERN.length };
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
