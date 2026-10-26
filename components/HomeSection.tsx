import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { SeriesBase } from "@/types/series";
import { SeriesCard } from "./SeriesCard";

interface HomeSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  items: SeriesBase[];
  icon?: React.ReactNode;
}

export function HomeSection({
  title,
  subtitle,
  viewAllHref,
  items,
  icon,
}: HomeSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3.5">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            {icon && <span className="text-rose-400">{icon}</span>}
            <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group flex items-center gap-1 text-xs font-semibold text-rose-400 transition hover:text-rose-300"
          >
            <span>View All</span>
            <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.slice(0, 6).map((series, idx) => (
          <SeriesCard key={series.id} series={series} priority={idx < 2} />
        ))}
      </div>
    </section>
  );
}
