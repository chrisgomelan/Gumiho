import { searchSeries, fetchTrendingKDramas, fetchTrendingWestern } from "@/lib/tmdb";
import { SeriesCard } from "@/components/SeriesCard";
import Link from "next/link";
import { Search, Flame } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; region?: "all" | "ko" | "en" }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, region = "all" } = await searchParams;
  const query = q?.trim() || "";

  let results = [];
  if (query) {
    results = await searchSeries(query, region);
  } else if (region === "ko") {
    results = await fetchTrendingKDramas();
  } else if (region === "en") {
    results = await fetchTrendingWestern();
  } else {
    const [kd, west] = await Promise.all([
      fetchTrendingKDramas(),
      fetchTrendingWestern(),
    ]);
    results = [...kd, ...west];
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Search Header Form */}
      <div className="flex flex-col gap-4">
        <form action="/search" method="GET" className="relative w-full max-w-2xl">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search series by title, actor, or genre..."
            className="h-12 w-full rounded-2xl bg-white/[0.08] pl-11 pr-24 text-sm text-white placeholder-white/40 ring-1 ring-white/10 transition focus:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <Search className="pointer-events-none absolute left-4 top-3.5 size-5 text-white/40" />

          {/* Preserve region if present */}
          {region !== "all" && <input type="hidden" name="region" value={region} />}

          <button
            type="submit"
            className="absolute right-2 top-2 h-8 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-500 active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <Link
            href={`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), region: "all" }).toString()}`}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              region === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
            }`}
          >
            All Regions
          </Link>

          <Link
            href={`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), region: "ko" }).toString()}`}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              region === "ko"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
            }`}
          >
            🇰🇷 K-Dramas (Korean)
          </Link>

          <Link
            href={`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), region: "en" }).toString()}`}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              region === "en"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
            }`}
          >
            🇺🇸 American & Western Series
          </Link>
        </div>
      </div>

      {/* Results Title */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <h1 className="text-base font-bold text-white sm:text-lg">
          {query ? (
            <span>
              Results for &ldquo;<span className="text-rose-400">{query}</span>&rdquo;
            </span>
          ) : region === "ko" ? (
            <span>Trending Korean Dramas</span>
          ) : region === "en" ? (
            <span>Popular American & Western Hits</span>
          ) : (
            <span>Explore All Series</span>
          )}
        </h1>
        <span className="text-xs text-white/40">{results.length} found</span>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.05] text-white/40 ring-1 ring-white/10 mb-3">
            <Search className="size-6" />
          </div>
          <h2 className="text-base font-bold text-white">No series found</h2>
          <p className="mt-1 text-xs text-white/50 max-w-sm">
            Try checking for spelling errors or searching for a different title or keyword.
          </p>
        </div>
      )}
    </div>
  );
}
