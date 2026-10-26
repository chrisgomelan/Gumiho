/**
 * lib/savepoints.ts
 * useSeriesSavepoints() - 100% database-free, client-side localStorage hook
 * for tracking watch progress, continue watching, and bookmarks.
 *
 * Features:
 *  - SSR hydration-safe (never reads localStorage during render)
 *  - Cross-tab sync via window "storage" event
 *  - Cross-component sync via custom "gumiho:savepoints:change" event
 *  - Full JSON Import/Export backup
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { SeriesSavepoint, SeriesSavepointStore, WatchStatus } from "@/types/series";

const STORAGE_KEY = "gumiho_savepoints:v1";

function readStore(): SeriesSavepointStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SeriesSavepointStore;
  } catch {
    return {};
  }
}

function writeStore(store: SeriesSavepointStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("gumiho:savepoints:change"));
  } catch {
    // Silently ignore quota / private mode errors
  }
}

export function useSeriesSavepoints() {
  const [store, setStore] = useState<SeriesSavepointStore>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setReady(true);
  }, []);

  // Multi-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStore(readStore());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // In-tab event sync
  useEffect(() => {
    const onChange = () => setStore(readStore());
    window.addEventListener("gumiho:savepoints:change", onChange);
    return () => window.removeEventListener("gumiho:savepoints:change", onChange);
  }, []);

  const upsert = useCallback(
    (
      id: number,
      title: string,
      poster: string,
      status: WatchStatus,
      season: number,
      episode: number,
      opts?: {
        imdb_id?: string | null;
        backdrop?: string;
        timestamp?: number;
        duration?: number;
        origin_country?: string[];
        totalSeasons?: number;
      }
    ) => {
      const current = readStore();
      const existing = current[id];
      const next: SeriesSavepointStore = {
        ...current,
        [id]: {
          id,
          series_id: id,
          tmdb_id: id,
          imdb_id: opts?.imdb_id ?? existing?.imdb_id,
          title,
          poster,
          status,
          season,
          episode,
          backdrop: opts?.backdrop ?? existing?.backdrop,
          origin_country: opts?.origin_country ?? existing?.origin_country,
          totalSeasons: opts?.totalSeasons ?? existing?.totalSeasons,
          timestamp: opts?.timestamp !== undefined ? opts.timestamp : existing?.timestamp,
          duration: opts?.duration !== undefined ? opts.duration : existing?.duration,
          updatedAt: Date.now(),
        },
      };
      writeStore(next);
      setStore(next);
    },
    []
  );

  const remove = useCallback((id: number) => {
    const next = { ...readStore() };
    delete next[id];
    writeStore(next);
    setStore(next);
  }, []);

  const get = useCallback(
    (id: number): SeriesSavepoint | undefined => store[id],
    [store]
  );

  const list = useCallback((): SeriesSavepoint[] => {
    return Object.values(store).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [store]);

  const exportJSON = useCallback((): string => {
    return JSON.stringify(store, null, 2);
  }, [store]);

  const importJSON = useCallback((json: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { ok: false, error: "Invalid format: expected a JSON object." };
      }
      const next = parsed as SeriesSavepointStore;
      writeStore(next);
      setStore(next);
      return { ok: true };
    } catch {
      return { ok: false, error: "Could not parse JSON." };
    }
  }, []);

  return { ready, store, get, list, upsert, remove, exportJSON, importJSON };
}
