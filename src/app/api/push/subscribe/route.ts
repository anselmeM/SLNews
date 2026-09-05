import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkDbRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkDbRateLimit(`push-sub:${ip}`, { maxRequests: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await auth();
    const userId = session?.userId ?? null;

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys) {
      return NextResponse.json({ error: "Missing endpoint or keys" }, { status: 400 });
    }

    await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        keys,
        ...(userId ? { userId } : {}),
      },
      create: {
        endpoint,
        keys,
        userId,
      },
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await db.pushSubscription.deleteMany({ where: { endpoint } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}
