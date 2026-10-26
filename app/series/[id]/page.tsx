import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Calendar, Tv, ArrowLeft } from "lucide-react";
import { fetchSeriesDetails, getImageUrl } from "@/lib/tmdb";
import { WatchPlayer } from "@/components/WatchPlayer";
import { SaveButton } from "@/components/SaveButton";
import { SeriesCard } from "@/components/SeriesCard";

interface SeriesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function SeriesDetailPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const { id } = await params;
  const { season, episode } = await searchParams;

  const seriesId = parseInt(id, 10);
  if (isNaN(seriesId)) {
    notFound();
  }

  const series = await fetchSeriesDetails(seriesId);
  if (!series) {
    notFound();
  }

  const initialSeason = season ? parseInt(season, 10) : 1;
  const initialEpisode = episode ? parseInt(episode, 10) : 1;

  const isKorean =
    series.original_language === "ko" || series.origin_country?.includes("KR");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6">
      {/* Back to Home Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Main Video Player Section */}
      <section className="rounded-3xl bg-slate-900/60 p-3 sm:p-5 ring-1 ring-white/10 backdrop-blur-xl">
        <WatchPlayer
          tmdb_id={series.id}
          title={series.name}
          poster={getImageUrl(series.poster_path, "w500")}
          backdrop={getImageUrl(series.backdrop_path, "w1280")}
          totalSeasons={series.number_of_seasons}
          initialSeason={initialSeason}
          initialEpisode={initialEpisode}
          seasons={series.seasons.map((s) => ({
            season_number: s.season_number,
            name: s.name,
            episode_count: s.episode_count || 12,
          }))}
        />
      </section>

      {/* Series Details Grid */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* Left Poster Card */}
        <div className="relative aspect-[2/3] w-full max-w-[260px] overflow-hidden rounded-2xl bg-slate-800 ring-1 ring-white/10 shadow-2xl mx-auto md:mx-0">
          <Image
            src={getImageUrl(series.poster_path, "w500")}
            alt={series.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Right Info Details */}
        <div className="space-y-4 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isKorean ? (
                  <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    K-Drama
                  </span>
                ) : (
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    Western Series
                  </span>
                )}
                {series.status && (
                  <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                    {series.status}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black text-white sm:text-3xl">
                {series.name}
              </h1>

              {series.original_name && series.original_name !== series.name && (
                <p className="text-sm font-semibold text-rose-400">
                  {series.original_name}
                </p>
              )}
            </div>

            <SaveButton
              tmdb_id={series.id}
              title={series.name}
              poster={getImageUrl(series.poster_path, "w500")}
              backdrop={getImageUrl(series.backdrop_path, "w1280")}
              totalSeasons={series.number_of_seasons}
              origin_country={series.origin_country}
              className="size-11"
            />
          </div>

          {/* Quick Stats: Rating, Seasons, Air Date */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
            {series.vote_average > 0 && (
              <div className="flex items-center gap-1 font-bold text-amber-300">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{series.vote_average.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Tv className="size-3.5 text-rose-400" />
              <span>
                {series.number_of_seasons} {series.number_of_seasons === 1 ? "Season" : "Seasons"}
              </span>
            </div>
            {series.first_air_date && (
              <div className="flex items-center gap-1">
                <Calendar className="size-3.5 text-blue-400" />
                <span>Premiered {new Date(series.first_air_date).getFullYear()}</span>
              </div>
            )}
          </div>

          {/* Genre Badges */}
          {series.genres && series.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {series.genres.map((g) => (
                <span
                  key={g.id}
                  className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/80 ring-1 ring-white/10"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          <p className="text-sm leading-relaxed text-white/80">
            {series.overview || "No overview available for this series."}
          </p>

          {/* Cast list */}
          {series.cast && series.cast.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                Starring Cast
              </h3>
              <div className="flex flex-wrap gap-2">
                {series.cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="rounded-xl bg-white/[0.04] px-3 py-1.5 ring-1 ring-white/10 text-xs"
                  >
                    <span className="font-semibold text-white">{actor.name}</span>
                    {actor.character && (
                      <span className="text-white/40 ml-1.5">as {actor.character}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Similar / Recommended Series */}
      {series.similar && series.similar.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-white/[0.08]">
          <h2 className="text-lg font-black text-white">Recommended If You Like This</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {series.similar.slice(0, 6).map((item) => (
              <SeriesCard key={item.id} series={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
