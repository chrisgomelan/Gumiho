import type { Metadata } from "next";
import { fetchWesternPaginated } from "@/lib/series-api";
import { SeriesGridWithLoadMore } from "@/components/SeriesGridWithLoadMore";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "American & Western Series | Gumiho",
  description: "Browse critically acclaimed American series, binge-worthy dramas, sci-fi sagas, and thrillers.",
};

export default async function AmericanSeriesPage() {
  const { items: initialWestern } = await fetchWesternPaginated(1, 18);

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-1.5">
          <Film className="size-5 text-blue-500" />
          <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-bold text-blue-400">
            Western Series
          </span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-white">
          American & Western Series
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/50 max-w-2xl">
          Critically acclaimed prestige dramas, sci-fi epics, and award-winning American television series.
        </p>
      </header>

      <SeriesGridWithLoadMore initialSeries={initialWestern} type="western" />
    </div>
  );
}
