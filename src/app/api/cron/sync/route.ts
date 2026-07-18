import { NextResponse } from "next/server";
import { syncNewsAPI } from "@/app/actions/sync-news-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const authHeader = request.headers.get("authorization");

  const isValid =
    querySecret === process.env.CRON_SECRET ||
    authHeader === `Bearer ${process.env.CRON_SECRET}`;

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncNewsAPI();
  
  if (result.success) {
    return NextResponse.json({ success: true, count: result.count });
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }
}
