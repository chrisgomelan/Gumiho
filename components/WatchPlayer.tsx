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

export const VIDEO_SERVERS: VideoServer[] = [
  {
    id: "autoembed",
    name: "AutoEmbed (Multi-Source)",
    badge: "Fast",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://player.autoembed.cc/embed/tv/${mediaId}/${s}/${ep}`;
    },
  },
  {
    id: "multiembed",
    name: "MultiEmbed / SuperEmbed",
    badge: "Recommended",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://multiembed.mov/?video_id=${mediaId}&s=${s}&e=${ep}`;
    },
  },
  {
    id: "vidlink",
    name: "VidLink (HD / Multi-Sub)",
    badge: "High Quality",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://vidlink.pro/tv/${mediaId}/${s}/${ep}?fallback=true&primaryColor=e11d48&secondaryColor=f43f5e`;
    },
  },
  {
    id: "embedsu",
    name: "Embed.su (CDN Stream)",
    badge: "HD",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://embed.su/embed/tv/${mediaId}/${s}/${ep}`;
    },
  },
  {
    id: "videasy",
    name: "Videasy (Clean Player)",
    badge: "Minimal Ads",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://player.videasy.to/tv/${mediaId}/${s}/${ep}`;
    },
  },
  {
    id: "vidsrc-cc",
    name: "VidSrc CC (Global)",
    badge: "Global",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://vidsrc.cc/v2/embed/tv/${mediaId}/${s}/${ep}`;
    },
  },
  {
    id: "vidsrc-me",
    name: "VidSrc Stream",
    badge: "Alternative",
    getUrl: (id, imdbId, s, ep) => {
      const mediaId = imdbId || id;
      return `https://vidsrc.me/embed/tv?imdb=${mediaId}&season=${s}&episode=${ep}`;
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
    name: "SmashyStream",
    badge: "Alternative",
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
    <div className="flex flex-col gap-4">
      {/* Top Controls: Server Selector & Quick Info */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Server Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setServerDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl bg-white/[0.08] px-3.5 py-2 text-xs font-semibold text-white shadow-sm ring-1 ring-white/10 transition hover:bg-white/[0.12] active:scale-95"
            >
              <Server className="size-3.5 text-rose-400" />
              <span>{activeServer.name}</span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                {activeServer.badge}
              </span>
              <ChevronDown className="size-3.5 opacity-60" />
            </button>

            {serverDropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/15"
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
                        className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          isCurrent
                            ? "bg-rose-600/30 text-rose-300 font-semibold ring-1 ring-rose-500/40"
                            : "text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <span className="truncate">{srv.name}</span>
                        <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
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
          className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.1] hover:text-white"
        >
          <span>Open in Tab</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Responsive Video Player Iframe */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
        <iframe
          key={`${activeServer.id}-s${selectedSeason}-e${selectedEpisode}`}
          src={playerUrl}
          title={`${title} S${selectedSeason} E${selectedEpisode}`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Episode Navigation Bar */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10 sm:p-2.5">
        <button
          onClick={() => handleSelectEpisode(selectedEpisode - 1)}
          disabled={selectedEpisode <= 1}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:flex-initial sm:px-4"
        >
          <ChevronLeft className="size-4" />
          <span>Prev Ep</span>
        </button>

        <div className="text-center text-xs font-medium text-white/80">
          <span className="font-bold text-white">
            Season {selectedSeason} • Ep {selectedEpisode}
          </span>
          <span className="text-white/40"> / {totalEpisodesInSeason}</span>
        </div>

        <button
          onClick={() => handleSelectEpisode(selectedEpisode + 1)}
          disabled={selectedEpisode >= totalEpisodesInSeason}
          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white transition hover:bg-rose-500 active:scale-95 disabled:pointer-events-none disabled:opacity-30 sm:flex-initial sm:px-4"
        >
          <span>Next Ep</span>
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Troubleshooting Tips */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200/90 ring-1 ring-amber-500/20">
        <Info className="size-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Streaming Tip:</strong> If the video does not load or buffers, switch to another server (e.g. <strong>MultiEmbed</strong> or <strong>VidLink</strong>) using the server button above.
        </span>
      </div>

      {/* Timestamp / Bookmarking Bar */}
      <div className="flex flex-col gap-3 rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
            <Bookmark className="size-3.5 text-rose-400" />
            <span>Save Timestamp:</span>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minutesInput}
              onChange={(e) => setMinutesInput(e.target.value)}
              className="h-8 w-14 rounded-lg bg-white/10 px-2 text-center text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            <span className="text-white/40 font-bold">:</span>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="Sec"
              value={secondsInput}
              onChange={(e) => setSecondsInput(e.target.value)}
              className="h-8 w-14 rounded-lg bg-white/10 px-2 text-center text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          <button
            onClick={handleSaveTimestamp}
            className="h-8 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white shadow transition hover:bg-rose-500 active:scale-95"
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
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/60 pr-2">
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
                className={`h-8 rounded-lg px-3 text-xs font-medium whitespace-nowrap transition-all ${
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
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-semibold text-white/70">
          <span>Episodes (Season {selectedSeason})</span>

          {totalEpisodesInSeason > 12 && (
            <form onSubmit={handleJumpToEpisode} className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={totalEpisodesInSeason}
                placeholder="Ep #"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="h-7 w-16 rounded-lg bg-white/10 px-2 text-center text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-rose-400"
              />
              <button
                type="submit"
                className="h-7 rounded-lg bg-white/10 px-2.5 text-[11px] font-medium text-white hover:bg-white/20 active:scale-95 transition"
              >
                Go
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 max-h-56 overflow-y-auto pr-1">
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
