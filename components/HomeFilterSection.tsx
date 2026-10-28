"use client";

import { useMemo, useState } from "react";
import { SeriesCard } from "@/components/SeriesCard";
import type { SeriesBase } from "@/types/series";
import {
  Calendar,
  ChevronDown,
  Film,
  Flame,
  Globe,
  Loader2,
  Search,
  SlidersHorizontal,
  Star,
  Tv,
  X,
} from "lucide-react";

const REGIONS = [
  { value: "all", label: "All Series (Global)" },
  { value: "kdrama", label: "Korean Dramas (K-Dramas)" },
  { value: "western", label: "American & Western Series" },
];

const GENRES = [
  "All",
  "Drama",
  "Romance",
  "Comedy",
  "Action",
  "Mystery",
  "Thriller",
  "Crime",
  "Fantasy",
  "Sci-Fi",
  "History",
  "Horror",
  "Family",
];

const YEARS = [
  { value: "All", label: "All Years" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
  { value: "2023", label: "2023" },
  { value: "2022", label: "2022" },
  { value: "2021", label: "2021" },
  { value: "2020", label: "2020" },
  { value: "2010s", label: "2010s (2010–2019)" },
  { value: "2000s", label: "2000s (2000–2009)" },
  { value: "classic", label: "Classics (Pre-2000)" },
];

const RATINGS = [
  { value: 0, label: "Any Rating" },
  { value: 8, label: "★ 8.0+ Masterpiece" },
  { value: 7, label: "★ 7.0+ Great" },
  { value: 6, label: "★ 6.0+ Good" },
];

const SORTS = [
  { value: "trending", label: "Popular / Trending" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest Release" },
  { value: "oldest", label: "Oldest Release" },
  { value: "title", label: "Title (A – Z)" },
];

function isKoreanSeries(s: SeriesBase): boolean {
  return (
    s.original_language === "ko" ||
    (Array.isArray(s.origin_country) && s.origin_country.includes("KR"))
  );
}

function matchesSeriesYear(series: SeriesBase, yearFilter: string): boolean {
  if (!yearFilter || yearFilter === "All") return true;
  if (!series.first_air_date) return false;
  const y = parseInt(series.first_air_date.slice(0, 4), 10);
  if (isNaN(y)) return false;

  if (/^\d{4}$/.test(yearFilter)) {
    return y === parseInt(yearFilter, 10);
  }
  if (yearFilter === "2020s") return y >= 2020 && y <= 2029;
  if (yearFilter === "2010s") return y >= 2010 && y <= 2019;
  if (yearFilter === "2000s") return y >= 2000 && y <= 2009;
  if (yearFilter === "classic") return y < 2000;
  return true;
}

interface HomeFilterSectionProps {
  initialKDramas: SeriesBase[];
  initialWestern: SeriesBase[];
  initialTopRated: SeriesBase[];
}

export function HomeFilterSection({
  initialKDramas,
  initialWestern,
  initialTopRated,
}: HomeFilterSectionProps) {
  // Combine all initial series without duplicates
  const [seriesList, setSeriesList] = useState<SeriesBase[]>(() => {
    const seen = new Set<number>();
    const list: SeriesBase[] = [];
    for (const s of [...initialKDramas, ...initialWestern, ...initialTopRated]) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        list.push(s);
      }
    }
    return list;
  });

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedSort, setSelectedSort] = useState<string>("trending");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const handleResetFilters = () => {
    setSelectedRegion("all");
    setSelectedGenre("All");
    setSelectedYear("All");
    setMinRating(0);
    setSelectedSort("trending");
    setSearchFilter("");
  };

  const hasActiveFilters =
    selectedRegion !== "all" ||
    selectedGenre !== "All" ||
    selectedYear !== "All" ||
    minRating > 0 ||
    selectedSort !== "trending" ||
    searchFilter.trim() !== "";

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      if (selectedRegion === "kdrama") {
        const res = await fetch(`/api/series?type=kdrama&page=${nextPage}&limit=18`);
        if (res.ok) {
          const data = await res.json();
          const newItems: SeriesBase[] = data.items || [];
          if (newItems.length === 0) setHasMore(false);
          else {
            setSeriesList((prev) => {
              const seen = new Set(prev.map((s) => s.id));
              const unique = newItems.filter((s) => !seen.has(s.id));
              return [...prev, ...unique];
            });
            setPage(nextPage);
            if (!data.hasMore) setHasMore(false);
          }
        }
      } else if (selectedRegion === "western") {
        const res = await fetch(`/api/series?type=western&page=${nextPage}&limit=18`);
        if (res.ok) {
          const data = await res.json();
          const newItems: SeriesBase[] = data.items || [];
          if (newItems.length === 0) setHasMore(false);
          else {
            setSeriesList((prev) => {
              const seen = new Set(prev.map((s) => s.id));
              const unique = newItems.filter((s) => !seen.has(s.id));
              return [...prev, ...unique];
            });
            setPage(nextPage);
            if (!data.hasMore) setHasMore(false);
          }
        }
      } else {
        // Load both
        const [resK, resW] = await Promise.all([
          fetch(`/api/series?type=kdrama&page=${nextPage}&limit=12`),
          fetch(`/api/series?type=western&page=${nextPage}&limit=12`),
        ]);
        const dataK = resK.ok ? await resK.json() : { items: [] };
        const dataW = resW.ok ? await resW.json() : { items: [] };
        const combined: SeriesBase[] = [...(dataK.items || []), ...(dataW.items || [])];
        if (combined.length === 0) setHasMore(false);
        else {
          setSeriesList((prev) => {
            const seen = new Set(prev.map((s) => s.id));
            const unique = combined.filter((s) => !seen.has(s.id));
            return [...prev, ...unique];
          });
          setPage(nextPage);
        }
      }
    } catch (err) {
      console.warn("Load more series error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter & Sort Pipeline
  const filteredSeries = useMemo(() => {
    let result = [...seriesList];

    // Region (kdrama vs western)
    if (selectedRegion === "kdrama") {
      result = result.filter(isKoreanSeries);
    } else if (selectedRegion === "western") {
      result = result.filter((s) => !isKoreanSeries(s));
    }

    // Genre
    if (selectedGenre !== "All") {
      const g = selectedGenre.toLowerCase();
      result = result.filter((s) =>
        s.genres.some((item) => item.toLowerCase() === g || item.toLowerCase().includes(g))
      );
    }

    // Year
    if (selectedYear !== "All") {
      result = result.filter((s) => matchesSeriesYear(s, selectedYear));
    }

    // Min Rating
    if (minRating > 0) {
      result = result.filter((s) => s.vote_average >= minRating);
    }

    // Search query
    const q = searchFilter.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.original_name ?? "").toLowerCase().includes(q) ||
          s.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Sort
    if (selectedSort === "rating") {
      result.sort((a, b) => b.vote_average - a.vote_average);
    } else if (selectedSort === "newest") {
      result.sort((a, b) => (b.first_air_date || "").localeCompare(a.first_air_date || ""));
    } else if (selectedSort === "oldest") {
      result.sort((a, b) => (a.first_air_date || "").localeCompare(b.first_air_date || ""));
    } else if (selectedSort === "title") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [seriesList, selectedRegion, selectedGenre, selectedYear, minRating, searchFilter, selectedSort]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Filter Card */}
      <section
        aria-label="Series Filter Controls"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-900/60 p-3.5 sm:p-6 ring-1 ring-white/10 backdrop-blur-xl shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30">
              <SlidersHorizontal className="size-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Discover & Filter Series
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50">
                Filter by K-Drama / Western, category, release year, score, or sort
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-white/70 ring-1 ring-white/10">
              {filteredSeries.length} {filteredSeries.length === 1 ? "series" : "series"}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-600 hover:text-white transition active:scale-95 cursor-pointer"
              >
                <X className="size-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Controls Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {/* Region / Category Dropdown */}
          <div className="relative">
            <label htmlFor="filter-region" className="sr-only">
              Filter by Region
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                <Globe className="size-3.5" />
              </span>
              <select
                id="filter-region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-zinc-900 text-white">
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDown className="size-3" />
              </span>
            </div>
          </div>

          {/* Genre Dropdown */}
          <div className="relative">
            <label htmlFor="filter-genre" className="sr-only">
              Filter by Genre
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                <Film className="size-3.5" />
              </span>
              <select
                id="filter-genre"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900 text-white">
                    {g === "All" ? "All Genres" : g}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDown className="size-3" />
              </span>
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <label htmlFor="filter-year" className="sr-only">
              Filter by Year
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                <Calendar className="size-3.5" />
              </span>
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value} className="bg-zinc-900 text-white">
                    {y.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDown className="size-3" />
              </span>
            </div>
          </div>

          {/* Min Rating Dropdown */}
          <div className="relative">
            <label htmlFor="filter-rating" className="sr-only">
              Filter by Rating
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-400">
                <Star className="size-3.5" />
              </span>
              <select
                id="filter-rating"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {RATINGS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-zinc-900 text-white">
                    {r.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDown className="size-3" />
              </span>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <label htmlFor="filter-sort" className="sr-only">
              Sort Series
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-rose-400">
                <Flame className="size-3.5" />
              </span>
              <select
                id="filter-sort"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl bg-white/5 pl-8 pr-8 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <ChevronDown className="size-3" />
              </span>
            </div>
          </div>

          {/* Search Filter Input */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 relative">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Search className="size-3.5" />
              </span>
              <input
                type="text"
                placeholder="Filter titles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="h-10 w-full rounded-xl bg-white/5 pl-8 pr-8 text-xs font-semibold text-white placeholder-white/35 ring-1 ring-white/10 transition hover:bg-white/10 focus:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  title="Clear filter text"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Filter Pills (Categories + Popular Genres) */}
        <div className="pt-1">
          <div className="-mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-scroll">
            {/* Quick Region Pills */}
            <button
              type="button"
              onClick={() => setSelectedRegion("all")}
              className={`h-8 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                selectedRegion === "all"
                  ? "bg-white/20 text-white shadow-md ring-1 ring-white/30"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
              }`}
            >
              All Shows
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegion("kdrama")}
              className={`h-8 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                selectedRegion === "kdrama"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-1 ring-rose-400"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
              }`}
            >
              K-Dramas
            </button>
            <button
              type="button"
              onClick={() => setSelectedRegion("western")}
              className={`h-8 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                selectedRegion === "western"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/60 ring-1 ring-blue-400"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
              }`}
            >
              Western Series
            </button>

            {/* Quick Genre Pills */}
            {GENRES.filter((g) => g !== "All").map((g) => {
              const isActive = selectedGenre === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`h-8 px-3.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-1 ring-rose-400"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ring-1 ring-white/10"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] border-t border-white/5">
            <span className="font-semibold text-white/40 mr-1">Active Filters:</span>

            {selectedRegion !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 font-bold text-rose-300 ring-1 ring-rose-500/30">
                Region: {selectedRegion === "kdrama" ? "K-Dramas" : "Western Series"}
                <button
                  type="button"
                  onClick={() => setSelectedRegion("all")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Reset region"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {selectedGenre !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 font-bold text-rose-300 ring-1 ring-rose-500/30">
                Genre: {selectedGenre}
                <button
                  type="button"
                  onClick={() => setSelectedGenre("All")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove genre filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {selectedYear !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 font-bold text-rose-300 ring-1 ring-rose-500/30">
                Year: {YEARS.find((y) => y.value === selectedYear)?.label || selectedYear}
                <button
                  type="button"
                  onClick={() => setSelectedYear("All")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove year filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 font-bold text-rose-300 ring-1 ring-rose-500/30">
                Score: {minRating}.0+
                <button
                  type="button"
                  onClick={() => setMinRating(0)}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Remove rating filter"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {selectedSort !== "trending" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 font-semibold text-white/80 ring-1 ring-white/15">
                Sort: {SORTS.find((s) => s.value === selectedSort)?.label}
                <button
                  type="button"
                  onClick={() => setSelectedSort("trending")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Reset sort"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}

            {searchFilter.trim() && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 font-semibold text-white/80 ring-1 ring-white/15">
                Keyword: &ldquo;{searchFilter}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="hover:text-white ml-0.5 cursor-pointer"
                  title="Clear keyword"
                >
                  <X className="size-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </section>

      {/* Series Grid & States */}
      {filteredSeries.length === 0 ? (
        <div className="rounded-2xl sm:rounded-3xl border border-dashed border-white/10 py-16 text-center px-4 space-y-3">
          <p className="text-base font-bold text-white">No series match your current criteria</p>
          <p className="text-xs text-white/50 max-w-md mx-auto">
            Try adjusting your region, genre, broadcast year, minimum score, or clear the search query to see more titles.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-lg shadow-rose-950/60"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredSeries.map((series, idx) => (
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
                className="flex items-center gap-2 rounded-xl bg-rose-600/20 px-8 py-3 text-xs font-bold text-rose-300 ring-1 ring-rose-500/40 hover:bg-rose-600 hover:text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-rose-950/30"
              >
                {isLoadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
                <span>
                  {isLoadingMore
                    ? "Loading more series…"
                    : selectedRegion === "kdrama"
                    ? "Load More K-Dramas"
                    : selectedRegion === "western"
                    ? "Load More Western Series"
                    : "Load More Series"}
                </span>
              </button>
              <span className="text-[11px] font-medium text-white/40">
                {seriesList.length} series in library
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
