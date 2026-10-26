"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bookmark, Flame, Menu, Search, Sparkles, Tv, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/search?region=ko", label: "K-Dramas" },
    { href: "/search?region=en", label: "American Series" },
    { href: "/library", label: "My Library", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0b0c14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-lg shadow-rose-950/40 ring-1 ring-white/20 transition-transform group-hover:scale-105">
            <Flame className="size-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-wider text-white">
                GUMIHO
              </span>
              <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] font-bold tracking-tight text-rose-300">
                구미호
              </span>
            </div>
            <span className="text-[10px] font-semibold text-rose-400/80 -mt-0.5">
              Series & K-Dramas
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]) &&
                  (link.href.includes("?")
                    ? typeof window !== "undefined" && window.location.href.includes(link.href.split("?")[1])
                    : true);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-rose-600/20 text-rose-300 ring-1 ring-rose-500/30"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {link.icon && <link.icon className="size-3.5" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Search Bar & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:block w-48 lg:w-64"
          >
            <input
              type="text"
              placeholder="Search series or K-drama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl bg-white/[0.07] pl-8 pr-3 text-xs text-white placeholder-white/40 ring-1 ring-white/10 transition focus:bg-white/[0.1] focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-white/40" />
          </form>

          {/* Mobile search button */}
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 sm:hidden"
          >
            <Search className="size-4" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle navigation menu"
            className="flex size-9 items-center justify-center rounded-xl bg-white/[0.06] text-white/70 md:hidden"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.08] bg-[#0b0c14]/95 px-4 py-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative mb-3 w-full">
            <input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl bg-white/10 pl-9 pr-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-white/40" />
          </form>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                {link.icon && <link.icon className="size-4 text-rose-400" />}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
