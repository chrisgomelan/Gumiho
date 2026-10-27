import type { Metadata } from "next";
import { fetchKDramasPaginated } from "@/lib/series-api";
import { SeriesGridWithLoadMore } from "@/components/SeriesGridWithLoadMore";
import { Tv } from "lucide-react";

export const metadata: Metadata = {
  title: "Korean Dramas (K-Dramas) | Gumiho",
  description: "Browse the best Korean drama series, from romantic comedies to supernatural thrillers.",
};

export default async function KDramasPage() {
  const { items: initialKDramas } = await fetchKDramasPaginated(1, 18);

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1.5">
          <Tv className="size-5 text-rose-500" />
          <span className="rounded bg-rose-600/20 px-2 py-0.5 text-xs font-bold text-rose-400">
            South Korea
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-white">
          Korean Dramas (K-Dramas)
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/50 max-w-2xl">
          The ultimate collection of popular, binge-worthy Korean series spanning romance, mystery, fantasy, and revenge sagas.
        </p>
      </header>

      <SeriesGridWithLoadMore initialSeries={initialKDramas} type="kdrama" />
    </div>
  );
}
