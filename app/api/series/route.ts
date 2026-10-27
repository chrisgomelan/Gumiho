import { NextResponse } from "next/server";
import { fetchKDramasPaginated, fetchWesternPaginated } from "@/lib/series-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "kdrama";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "18", 10);

  try {
    if (type === "western") {
      const data = await fetchWesternPaginated(page, limit);
      return NextResponse.json(data);
    }

    const data = await fetchKDramasPaginated(page, limit);
    return NextResponse.json(data);
  } catch (err) {
    console.warn("[api/series] error fetching series:", err);
    return NextResponse.json({ items: [], hasMore: false, total: 0 });
  }
}
