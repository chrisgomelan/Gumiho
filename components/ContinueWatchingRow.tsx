"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Tv } from "lucide-react";
import { useSeriesSavepoints } from "@/lib/savepoints";

export function ContinueWatchingRow() {
  const { ready, list } = useSeriesSavepoints();

  if (!ready) return null;

  const watching = list().filter((sp) => sp.status === "watching");
  if (watching.length === 0) return null;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center gap-2">
        <Tv className="size-4 text-rose-400" />
        <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
          Continue Watching
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {watching.slice(0, 4).map((item) => (
          <Link
            key={item.tmdb_id}
            href={`/series/${item.tmdb_id}?season=${item.season}&episode=${item.episode}`}
            className="group relative flex overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10 transition hover:ring-rose-500/50 hover:bg-white/[0.08]"
          >
            <div className="relative aspect-[16/10] w-32 shrink-0 bg-slate-900 overflow-hidden">
              <Image
                src={item.backdrop || item.poster}
                alt={item.title}
                fill
                className="object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <div className="flex size-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg">
                  <Play className="size-4 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Season {item.season} • Episode {item.episode}
              </span>
              <h3 className="line-clamp-1 text-xs font-bold text-white group-hover:text-rose-300 transition">
                {item.title}
              </h3>

              {item.timestamp ? (
                <div className="mt-2 text-[10px] text-white/50">
                  Paused at {Math.floor(item.timestamp / 60)}:
                  {String(item.timestamp % 60).padStart(2, "0")}
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-white/40">In Progress</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
