import { NextResponse } from "next/server";
import { searchSeries } from "@/lib/series-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchSeries(q);
    return NextResponse.json({ results: results.slice(0, 6) });
  } catch (error) {
    console.error("[api] Live search error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
