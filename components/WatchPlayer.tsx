"use client";

import { useEffect, useMemo, useState } from "react";
import { useSeriesSavepoints } from "@/lib/savepoints";
import {
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Server,
  Tv,
} from "lucide-react";

export interface VideoServer {
  id: string;
  name: string;
  badge: string;
  getUrl: (id: number, imdbId: string | null | undefined, season: number, episode: number) => string;
}

// Only verified, actively responding and accessible free embed streaming servers
export const VIDEO_SERVERS: VideoServer[] = [
  {
    id: "multiembed",
    name: "MultiEmbed Stream",
    badge: "Recommended",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://multiembed.mov/?video_id=${mediaId}&s=${s}&e=${ep}`;
    },
  },
  {
    id: "vidsrc-pm",
    name: "VidSrc Stream (HD)",
    badge: "Fast CDN",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://vidsrc.pm/embed/tv/${mediaId}/${s}/${ep}`;
    },
  },
  {
    id: "vidsrc-sh",
    name: "VidSrc Alternative",
    badge: "Sub & Dub",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://vidsrc.sh/embed/tv?imdb=${mediaId}&season=${s}&episode=${ep}`;
    },
  },
  {
    id: "autoembed-me",
    name: "AutoEmbed Stream",
    badge: "Active",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://autoembed.me/tv/imdb/${mediaId}-${s}-${ep}`;
    },
  },
  {
    id: "twoembed",
    name: "2Embed Player",
    badge: "Backup",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://www.2embed.cc/embedtv/${mediaId}&s=${s}&e=${ep}`;
    },
  },
  {
    id: "smashystream",
    name: "Smashy Player",
    badge: "Multi-Source",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://player.smashystream.com/tv/${mediaId}/${s}/${ep}`;
    },
  },
];

interface WatchPlayerProps {
  series_id: number;
  imdb_id?: string | null;
  tmdb_id?: number;
  title: string;
  poster: string;
  backdrop?: string;
  totalSeasons: number;
  initialSeason?: number;
  initialEpisode?: number;
  seasons: Array<{
    season_number: number;
    name: string;
    episode_count: number;
  }>;
}

export function WatchPlayer({
  series_id,
  imdb_id,
  title,
  poster,
  backdrop,
  totalSeasons,
  initialSeason = 1,
  initialEpisode = 1,
  seasons,
}: WatchPlayerProps) {
  const { ready, get, upsert } = useSeriesSavepoints();

  const [activeServer, setActiveServer] = useState<VideoServer>(VIDEO_SERVERS[0]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);

  // Time bookmark input states
  const [minutesInput, setMinutesInput] = useState("");
  const [secondsInput, setSecondsInput] = useState("");
  const [savedTime, setSavedTime] = useState(0);

  // Quick jump form
  const [jumpInput, setJumpInput] = useState("");

  const currentSeasonMeta = seasons.find((s) => s.season_number === selectedSeason);
  const totalEpisodesInSeason = currentSeasonMeta?.episode_count || 12;

  // Restore savepoint on load
  useEffect(() => {
    if (!ready) return;
    const sp = get(series_id);
    if (sp) {
      if (sp.season) setSelectedSeason(sp.season);
      if (sp.episode) setSelectedEpisode(sp.episode);
      if (sp.timestamp) {
        setSavedTime(sp.timestamp);
        const mins = Math.floor(sp.timestamp / 60);
        const secs = sp.timestamp % 60;
        setMinutesInput(String(mins));
        setSecondsInput(String(secs).padStart(2, "0"));
      }
    }
  }, [ready, series_id, get]);

  // Update savepoint whenever episode or season changes
  const handleSelectEpisode = (ep: number, season = selectedSeason) => {
    setSelectedEpisode(ep);
    setSelectedSeason(season);
    upsert(series_id, title, poster, "watching", season, ep, {
      imdb_id,
      backdrop,
      totalSeasons,
      timestamp: savedTime,
    });
  };

  const handleSaveTimestamp = () => {
    const m = parseInt(minutesInput, 10) || 0;
    const s = parseInt(secondsInput, 10) || 0;
    const totalSecs = Math.max(0, m * 60 + s);
    setSavedTime(totalSecs);
    upsert(series_id, title, poster, "watching", selectedSeason, selectedEpisode, {
      imdb_id,
      backdrop,
      totalSeasons,
      timestamp: totalSecs,
    });
  };

  const handleJumpToEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    const ep = parseInt(jumpInput, 10);
    if (!isNaN(ep) && ep >= 1 && ep <= totalEpisodesInSeason) {
      handleSelectEpisode(ep);
      setJumpInput("");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const playerUrl = useMemo(
    () => activeServer.getUrl(series_id, imdb_id, selectedSeason, selectedEpisode),
    [activeServer, series_id, imdb_id, selectedSeason, selectedEpisode]
  );

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      {/* Top Controls: Server Selector & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Server Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setServerDropdownOpen((prev) => !prev)}
              className="flex h-10 sm:h-9 items-center gap-2 rounded-xl bg-white/[0.08] px-3 text-xs font-semibold text-white shadow-sm ring-1 ring-white/10 transition hover:bg-white/[0.12] active:scale-95"
            >
              <Server className="size-3.5 text-rose-400 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-none">{activeServer.name}</span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                {activeServer.badge}
              </span>
              <ChevronDown className="size-3.5 opacity-60 shrink-0" />
            </button>

            {serverDropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1.5 w-72 max-w-[calc(100vw-32px)] rounded-xl bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/15"
                onMouseLeave={() => setServerDropdownOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-white/50">
                  Select Video Stream Server
                </div>
                <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                  {VIDEO_SERVERS.map((srv) => {
                    const isCurrent = srv.id === activeServer.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => {
                          setActiveServer(srv);
                          setServerDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition active:scale-95 ${
                          isCurrent
                            ? "bg-rose-600/30 text-rose-300 font-semibold ring-1 ring-rose-500/40"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{srv.name}</span>
                        <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60 ml-1.5">
                          {srv.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* External Link */}
        <a
          href={playerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 sm:h-9 items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 text-xs font-medium text-white/70 transition hover:bg-white/[0.1] hover:text-white active:scale-95 shrink-0"
        >
          <span>Open in Tab</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Responsive Video Player Iframe */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
        <iframe
          key={`${activeServer.id}-s${selectedSeason}-e${selectedEpisode}`}
          src={playerUrl}
          title={`${title} S${selectedSeason} E${selectedEpisode}`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Mobile-friendly Quick Prev / Next Episode Bar */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10 sm:p-2.5">
        <button
          onClick={() => handleSelectEpisode(selectedEpisode - 1)}
          disabled={selectedEpisode <= 1}
          aria-label="Previous episode"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:flex-initial sm:px-4"
        >
          <ChevronLeft className="size-4" />
          <span>Prev Ep</span>
        </button>

        <div className="text-center text-xs font-medium text-white/80 px-1">
          <span className="font-bold text-white">
            S{selectedSeason} • Ep {selectedEpisode}
          </span>
          <span className="text-white/40"> / {totalEpisodesInSeason}</span>
        </div>

        <button
          onClick={() => handleSelectEpisode(selectedEpisode + 1)}
          disabled={selectedEpisode >= totalEpisodesInSeason}
          aria-label="Next episode"
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white transition hover:bg-rose-500 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:flex-initial sm:px-4"
        >
          <span>Next Ep</span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Troubleshooting Tips */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200/90 ring-1 ring-amber-500/20">
        <Info className="size-3.5 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Streaming Tip:</strong> If video won&apos;t load or buffers, tap the server button above or tap <strong>Open in Tab</strong>. On mobile, disable adblocker if playback is blocked.
        </span>
      </div>

      {/* Timestamp / Bookmarking Bar (Mobile Adaptive) */}
      <div className="flex flex-col gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Bookmark className="size-3.5 text-rose-400" />
            <span>Bookmark:</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              placeholder="Min"
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
              className="h-9 sm:h-8 w-14 rounded-lg bg-white/10 px-2 text-center text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <span className="text-white/40 font-bold">:</span>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={0}
              max={59}
              placeholder="Sec"
              value={secondsInput}
              onChange={(e) => setSecondsInput(e.target.value)}
              className="h-9 sm:h-8 w-14 rounded-lg bg-white/10 px-2 text-center text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <button
            onClick={handleSaveTimestamp}
            className="h-9 sm:h-8 flex-1 sm:flex-initial rounded-lg bg-rose-600 px-3.5 text-xs font-semibold text-white shadow transition hover:bg-rose-500 active:scale-95"
          >
            Save Checkpoint
          </button>
        </div>

        {savedTime > 0 && (
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>Last bookmark:</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400 ring-1 ring-emerald-500/30">
              {formatTime(savedTime)}
            </span>
          </div>
        )}
      </div>

      {/* Season Tabs Selector */}
      {seasons.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1 text-xs font-bold text-white/60 pr-1.5 shrink-0">
            <Tv className="size-3.5 text-rose-400" />
            <span>Seasons:</span>
          </div>
          {seasons.map((s) => {
            const isSelected = s.season_number === selectedSeason;
            return (
              <button
                key={s.season_number}
                onClick={() => {
                  setSelectedSeason(s.season_number);
                  setSelectedEpisode(1);
                  handleSelectEpisode(1, s.season_number);
                }}
                className={`h-8 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? "bg-rose-600 text-white shadow-md ring-1 ring-rose-400"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {s.name || `Season ${s.season_number}`} ({s.episode_count} eps)
              </button>
            );
          })}
        </div>
      )}

      {/* Episode Selection Grid */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold text-white/70">
          <span>Episodes (Season {selectedSeason})</span>

          {totalEpisodesInSeason > 12 && (
            <form onSubmit={handleJumpToEpisode} className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={totalEpisodesInSeason}
                placeholder="Ep #"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="h-8 w-16 rounded-lg bg-white/10 px-2 text-center text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <button
                type="submit"
                className="h-8 rounded-lg bg-white/10 px-2.5 text-[11px] font-medium text-white hover:bg-white/20 active:scale-95 transition"
              >
                Go
              </button>
            </form>
          )}
        </div>

        {/* Responsive grid: 5 columns on phones, scaling up to 12 on large screens */}
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 max-h-56 overflow-y-auto pr-1">
          {Array.from({ length: totalEpisodesInSeason }, (_, idx) => idx + 1).map((epNum) => {
            const isActive = epNum === selectedEpisode;
            return (
              <button
                key={epNum}
                onClick={() => handleSelectEpisode(epNum)}
                className={`flex h-10 items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isActive
                    ? "bg-rose-600 text-white shadow-lg ring-2 ring-rose-400/90 scale-105"
                    : "bg-white/5 text-white/70 hover:bg-white/15 ring-1 ring-white/10"
                }`}
              >
                {epNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
