"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bookmark, Download, Play, Trash2, Upload } from "lucide-react";
import { useSeriesSavepoints } from "@/lib/savepoints";
import type { WatchStatus } from "@/types/series";

export default function LibraryPage() {
  const { ready, list, remove, exportJSON, importJSON } = useSeriesSavepoints();
  const [activeTab, setActiveTab] = useState<"all" | WatchStatus>("all");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-white/50">
        Loading library...
      </div>
    );
  }

  const items = list();
  const filtered = items.filter(
    (item) => activeTab === "all" || item.status === activeTab
  );

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gumiho_watchlist_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importJSON(content);
      if (res.ok) {
        setImportStatus("Imported successfully!");
      } else {
        setImportStatus(res.error || "Failed to import file.");
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      {/* Header with Title and Import/Export Tools */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">My Library & Progress</h1>
          <p className="text-xs text-white/50">
            Stored locally in your browser. Zero accounts or database required.
          </p>
        </div>

        {/* Export / Import Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={items.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-40"
          >
            <Download className="size-3.5" />
            <span>Export Backup</span>
          </button>

          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10">
            <Upload className="size-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus && (
        <div className="rounded-xl bg-rose-500/20 px-3.5 py-2 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/30">
          {importStatus}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {(
          [
            { id: "all", label: `All (${items.length})` },
            {
              id: "watching",
              label: `Watching (${items.filter((i) => i.status === "watching").length})`,
            },
            {
              id: "plan_to_watch",
              label: `Watchlist (${items.filter((i) => i.status === "plan_to_watch").length})`,
            },
            {
              id: "completed",
              label: `Completed (${items.filter((i) => i.status === "completed").length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                : "bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Library Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((item) => (
            <div
              key={item.tmdb_id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-rose-500/40"
            >
              <Link
                href={`/series/${item.tmdb_id}?season=${item.season}&episode=${item.episode}`}
                className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900"
              >
                <Image
                  src={item.poster}
                  alt={item.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <div className="flex items-center gap-1.5 rounded-lg bg-rose-600/90 px-2 py-1 text-[11px] font-bold text-white shadow">
                    <Play className="size-3 fill-white" />
                    <span>
                      S{item.season} • E{item.episode}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Remove button */}
              <button
                onClick={() => remove(item.tmdb_id)}
                title="Remove from Library"
                className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white/60 backdrop-blur-md transition hover:bg-rose-600 hover:text-white"
              >
                <Trash2 className="size-3.5" />
              </button>

              <div className="p-3">
                <Link href={`/series/${item.tmdb_id}`}>
                  <h3 className="line-clamp-1 text-xs font-bold text-white group-hover:text-rose-400">
                    {item.title}
                  </h3>
                </Link>
                {item.timestamp ? (
                  <p className="mt-1 text-[10px] text-white/40">
                    Bookmark: {Math.floor(item.timestamp / 60)}:
                    {String(item.timestamp % 60).padStart(2, "0")}
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] text-white/40">
                    {item.status.replace(/_/g, " ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.05] text-white/40 ring-1 ring-white/10 mb-3">
            <Bookmark className="size-6" />
          </div>
          <h2 className="text-base font-bold text-white">Your library is empty</h2>
          <p className="mt-1 text-xs text-white/50 max-w-sm">
            Click the bookmark icon on any series or start watching an episode to track your progress here automatically.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-500"
          >
            Explore Series
          </Link>
        </div>
      )}
    </div>
  );
}
