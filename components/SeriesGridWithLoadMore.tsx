"use client";

import { useState } from "react";
import { SeriesCard } from "@/components/SeriesCard";
import type { SeriesBase } from "@/types/series";
import { ChevronDown, Loader2 } from "lucide-react";

interface SeriesGridWithLoadMoreProps {
  initialSeries: SeriesBase[];
  type: "kdrama" | "western";
}

export function SeriesGridWithLoadMore({
  initialSeries,
  type,
}: SeriesGridWithLoadMoreProps) {
  const [seriesList, setSeriesList] = useState<SeriesBase[]>(initialSeries);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const res = await fetch(`/api/series?type=${type}&page=${nextPage}&limit=18`);
      if (res.ok) {
        const data = await res.json();
        const newItems: SeriesBase[] = data.items || [];
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setSeriesList((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const unique = newItems.filter((s) => !seen.has(s.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
          if (!data.hasMore) {
            setHasMore(false);
          }
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Load more series error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const isKDrama = type === "kdrama";

  return (
    <div className="space-y-6">
      {/* Series Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {seriesList.map((series, idx) => (
          <SeriesCard key={`${series.id}-${idx}`} series={series} priority={idx < 4} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center pt-4 pb-2 gap-2">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className={`flex items-center gap-2 rounded-xl px-8 py-3 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer ${
              isKDrama
                ? "bg-rose-600/20 text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-600 hover:text-white"
                : "bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40 hover:bg-blue-600 hover:text-white"
            }`}
          >
            {isLoadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            <span>
              {isLoadingMore
                ? "Loading more series…"
                : isKDrama
                ? "Load More K-Dramas"
                : "Load More Western Series"}
            </span>
          </button>
          <span className="text-[11px] font-medium text-white/40">
            {seriesList.length} series loaded
          </span>
        </div>
      )}
    </div>
  );
}
