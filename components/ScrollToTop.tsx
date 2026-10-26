"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex size-10 sm:size-11 items-center justify-center rounded-full bg-rose-600/90 text-white shadow-xl shadow-rose-950/60 ring-1 ring-white/20 backdrop-blur-md transition-all hover:bg-rose-500 hover:scale-105 active:scale-95"
    >
      <ArrowUp className="size-4 sm:size-5" />
    </button>
  );
}
