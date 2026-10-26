import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Gumiho — Stream American Series & Korean Dramas",
  description:
    "Free streaming dashboard for American series, K-Dramas, and global shows with multi-server playback and local-first progress tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#0b0c14] text-[#f1f1f8] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-white/[0.08] py-8 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} Gumiho. Built for American series & K-Dramas.</p>
          <p className="mt-1 text-[11px] text-white/30">
            Powered by TMDB metadata and client-side storage. Does not host any media files.
          </p>
        </footer>
      </body>
    </html>
  );
}
