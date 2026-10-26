"use client";

import { useSeriesSavepoints } from "@/lib/savepoints";
import { Bookmark, Check } from "lucide-react";

interface SaveButtonProps {
  tmdb_id: number;
  title: string;
  poster: string;
  backdrop?: string;
  totalSeasons?: number;
  origin_country?: string[];
  className?: string;
}

export function SaveButton({
  tmdb_id,
  title,
  poster,
  backdrop,
  totalSeasons = 1,
  origin_country,
  className = "",
}: SaveButtonProps) {
  const { ready, get, upsert, remove } = useSeriesSavepoints();

  if (!ready) {
    return (
      <button
        disabled
        className={`flex items-center justify-center rounded-xl bg-white/10 p-2 text-white/50 ${className}`}
      >
        <Bookmark className="size-4" />
      </button>
    );
  }

  const saved = get(tmdb_id);
  const isSaved = Boolean(saved);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      remove(tmdb_id);
    } else {
      upsert(tmdb_id, title, poster, "plan_to_watch", 1, 1, {
        backdrop,
        totalSeasons,
        origin_country,
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={isSaved ? "Remove from Library" : "Save to Watchlist"}
      className={`flex items-center justify-center rounded-xl transition active:scale-90 ${
        isSaved
          ? "bg-rose-600 text-white shadow-lg ring-1 ring-rose-400"
          : "bg-black/60 text-white/80 hover:bg-black/90 hover:text-white backdrop-blur-md ring-1 ring-white/15"
      } ${className}`}
    >
      {isSaved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
    </button>
  );
}
