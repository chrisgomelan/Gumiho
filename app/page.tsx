import {
  fetchTrendingKDramas,
  fetchTrendingWestern,
  fetchTopRatedGlobal,
} from "@/lib/series-api";
import { HeroBanner } from "@/components/HeroBanner";
import { ContinueWatchingRow } from "@/components/ContinueWatchingRow";
import { HomeFilterSection } from "@/components/HomeFilterSection";

export default async function HomePage() {
  const [kdramas, western, topRated] = await Promise.all([
    fetchTrendingKDramas(),
    fetchTrendingWestern(),
    fetchTopRatedGlobal(),
  ]);

  const featured = kdramas[0] || western[0];

  return (
    <div className="mx-auto max-w-7xl space-y-7 sm:space-y-10 px-3.5 py-3.5 sm:px-6 sm:py-8">
      {/* Premier Featured Hero */}
      {featured && <HeroBanner series={featured} />}

      {/* Local-first Continue Watching Row */}
      <ContinueWatchingRow />

      {/* Interactive Discovery & Filter Hub */}
      <HomeFilterSection
        initialKDramas={kdramas}
        initialWestern={western}
        initialTopRated={topRated}
      />
    </div>
  );
}
