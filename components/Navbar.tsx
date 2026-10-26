"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Film, Home, Menu, Search, Tv, X } from "lucide-react";
import { GumihoLogo } from "@/components/Icons";
import LiveSearch from "@/components/LiveSearch";

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile overlays when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/kdramas", label: "K-Dramas", icon: Tv },
    { href: "/american", label: "American Series", icon: Film },
    { href: "/library", label: "My Library", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0c14]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition hover:text-rose-400 sm:text-xl shrink-0"
        >
          <GumihoLogo className="size-6 text-rose-500" />
          <span>Gumiho</span>
        </Link>

        {/* Navigation Links with Icons */}
        <nav className="hidden items-center gap-1 sm:gap-1.5 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href.split("?")[0]) &&
                  (link.href.includes("?")
                    ? typeof window !== "undefined" && window.location.href.includes(link.href.split("?")[1])
                    : true);

            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  isActive
                    ? "bg-white/15 text-white font-semibold ring-1 ring-white/20 shadow-sm"
                    : "text-white/70 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop AJAX Live Search */}
        <div className="hidden md:block">
          <LiveSearch variant="desktop" />
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-1.5 md:hidden">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setMobileMenuOpen(false);
            }}
            aria-expanded={isSearchOpen}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
            className={`flex size-9 items-center justify-center rounded-xl text-sm font-semibold transition active:scale-95 ${
              isSearchOpen
                ? "bg-rose-600 text-white ring-1 ring-rose-400"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {isSearchOpen ? <X className="size-4" /> : <Search className="size-4" />}
          </button>

          {/* Mobile Navigation Drawer Toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            aria-label="Toggle navigation menu"
            className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-white/15"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Live Search */}
      {isSearchOpen && (
        <div className="border-t border-white/5 bg-[#0b0c14]/95 px-3.5 py-2.5 md:hidden">
          <LiveSearch
            variant="mobile"
            autoFocus
            onSelect={() => setIsSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.08] bg-[#0b0c14]/95 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  <Icon className="size-4 text-rose-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
