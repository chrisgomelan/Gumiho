import Link from "next/link";
import Image from "next/image";
import { Play, Star, Info } from "lucide-react";
import type { SeriesBase } from "@/types/series";
import { getImageUrl } from "@/lib/tmdb";
import { SaveButton } from "./SaveButton";

interface HeroBannerProps {
  series: SeriesBase;
}

export function HeroBanner({ series }: HeroBannerProps) {
  const isKorean =
    series.original_language === "ko" || series.origin_country?.includes("KR");

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-950 shadow-2xl ring-1 ring-white/10">
      {/* Background Backdrop Image */}
      <div className="relative aspect-[16/9] max-h-[520px] w-full min-h-[380px]">
        <Image
          src={getImageUrl(series.backdrop_path, "w1280")}
          alt={series.name}
          fill
          priority
          className="object-cover object-top opacity-75"
        />

        {/* Ambient Dark Gradient Overlays for high readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c14] via-[#0b0c14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c14] via-[#0b0c14]/80 to-transparent sm:w-2/3" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:w-3/5">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          {isKorean ? (
            <span className="rounded-md bg-rose-600 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
              Featured K-Drama
            </span>
          ) : (
            <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-md">
              Featured Series
            </span>
          )}

          {series.vote_average > 0 && (
            <div className="flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-white/10 backdrop-blur-md">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span>{series.vote_average.toFixed(1)} Rating</span>
            </div>
          )}

          {series.first_air_date && (
            <span className="text-xs text-white/60">
              {new Date(series.first_air_date).getFullYear()}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-md">
          {series.name}
        </h1>

        {series.original_name && series.original_name !== series.name && (
          <p className="text-sm font-semibold text-rose-300/80 mt-0.5">
            {series.original_name}
          </p>
        )}

        <p className="mt-3 line-clamp-3 text-xs text-white/70 sm:text-sm max-w-xl leading-relaxed">
          {series.overview}
        </p>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/series/${series.id}`}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-950/50 transition hover:bg-rose-500 hover:scale-105 active:scale-95"
          >
            <Play className="size-4 fill-white" />
            <span>Watch Now</span>
          </Link>

          <Link
            href={`/series/${series.id}`}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/15 transition hover:bg-white/20 active:scale-95"
          >
            <Info className="size-4" />
            <span>Details</span>
          </Link>

          <SaveButton
            tmdb_id={series.id}
            title={series.name}
            poster={getImageUrl(series.poster_path, "w500")}
            backdrop={getImageUrl(series.backdrop_path, "w1280")}
            totalSeasons={series.number_of_seasons || 1}
            origin_country={series.origin_country}
            className="size-10"
          />
        </div>
      </div>
    </div>
  );
}
