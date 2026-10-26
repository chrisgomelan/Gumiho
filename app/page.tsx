import {
  fetchTrendingKDramas,
  fetchTrendingWestern,
  fetchTopRatedGlobal,
} from "@/lib/series-api";
import { HeroBanner } from "@/components/HeroBanner";
import { HomeSection } from "@/components/HomeSection";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { Flame, Star, Trophy } from "lucide-react";

export default async function HomePage() {
  const [kdramas, western, topRated] = await Promise.all([
    fetchTrendingKDramas(),
    fetchTrendingWestern(),
    fetchTopRatedGlobal(),
  ]);

  const featured = kdramas[0] || western[0];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6">
      {/* Premier Featured Hero */}
      {featured && <HeroBanner series={featured} />}

      {/* Local-first Continue Watching Row */}
      <ContinueWatchingRow />

      {/* Trending Korean Dramas */}
      <HomeSection
        title="Trending K-Dramas"
        subtitle="The hottest romantic, thriller, and fantasy series from South Korea"
        viewAllHref="/search?region=ko"
        icon={<Flame className="size-5 text-rose-500" />}
        items={kdramas}
      />

      {/* Popular American & Western Series */}
      <HomeSection
        title="Popular American & Western Series"
        subtitle="Critically acclaimed hits, binge-worthy dramas, and sci-fi sagas"
        viewAllHref="/search?region=en"
        icon={<Star className="size-5 text-blue-400 fill-blue-400/20" />}
        items={western}
      />

      {/* Top Rated Global */}
      <HomeSection
        title="Top Rated Global Masterpieces"
        subtitle="Highest-rated series across all regions"
        icon={<Trophy className="size-5 text-amber-400" />}
        items={topRated}
      />
    </div>
  );
}
