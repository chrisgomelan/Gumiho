import type { Metadata } from "next";
import { searchSeries } from "@/lib/series-api";
import { SeriesCard } from "@/components/SeriesCard";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} | Gumiho` : "Search Series | Gumiho",
    description: q
      ? `Search results for "${q}" on Gumiho.`
      : "Search for American and Korean series on Gumiho.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-lg text-white/50">Enter a search query in the search bar above to get started.</p>
      </div>
    );
  }

  const results = await searchSeries(query);

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 sm:py-10 space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Results for <span className="text-rose-400">&quot;{query}&quot;</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/40">
          {results.length} series found
        </p>
      </header>

      {results.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-white/50">No series found. Try a different search title or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
