import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { SeriesBase } from "@/types/series";
import { getImageUrl } from "@/lib/tmdb";
import { SaveButton } from "./SaveButton";

interface SeriesCardProps {
  series: SeriesBase;
  priority?: boolean;
}

export function SeriesCard({ series, priority = false }: SeriesCardProps) {
  const isKorean =
    series.original_language === "ko" ||
    series.origin_country?.includes("KR") ||
    false;

  const isAmerican =
    series.original_language === "en" ||
    series.origin_country?.includes("US") ||
    false;

  const year = series.first_air_date
    ? new Date(series.first_air_date).getFullYear()
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:ring-rose-500/50 hover:shadow-xl hover:shadow-rose-950/30">
      {/* Poster Image Container */}
      <Link
        href={`/series/${series.id}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900"
      >
        <Image
          src={getImageUrl(series.poster_path, "w500")}
          alt={series.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80" />

        {/* Country Badge */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1">
          {isKorean && (
            <span className="rounded-md bg-rose-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md">
              K-Drama
            </span>
          )}
          {isAmerican && !isKorean && (
            <span className="rounded-md bg-blue-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md">
              US Series
            </span>
          )}
          {!isKorean && !isAmerican && (
            <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md">
              {series.origin_country?.[0] || series.original_language?.toUpperCase() || "TV"}
            </span>
          )}
        </div>

        {/* Rating Pill */}
        {series.vote_average > 0 && (
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-bold text-amber-300 shadow backdrop-blur-md ring-1 ring-white/10">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>{series.vote_average.toFixed(1)}</span>
          </div>
        )}
      </Link>

      {/* Save / Bookmark Button overlay */}
      <div className="absolute right-2.5 top-2.5 z-10">
        <SaveButton
          tmdb_id={series.id}
          title={series.name}
          poster={getImageUrl(series.poster_path, "w500")}
          backdrop={getImageUrl(series.backdrop_path, "w1280")}
          totalSeasons={series.number_of_seasons || 1}
          origin_country={series.origin_country}
          className="size-8"
        />
      </div>

      {/* Series Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <Link href={`/series/${series.id}`}>
          <h3 className="line-clamp-1 text-sm font-bold text-white transition group-hover:text-rose-400">
            {series.name}
          </h3>
          {series.original_name && series.original_name !== series.name && (
            <p className="line-clamp-1 text-[11px] text-white/50">
              {series.original_name}
            </p>
          )}
        </Link>

        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
          <span>{year || "TV Series"}</span>
          {series.number_of_seasons && (
            <span>{series.number_of_seasons} {series.number_of_seasons === 1 ? "Season" : "Seasons"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
