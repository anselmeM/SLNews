"use server";

import type { Prisma } from "@prisma/client";
import webpush from "web-push";
import { db } from "@/lib/db";

export interface PushNotificationOptions {
  userId?: string;
  userIds?: string[];
  tag?: string;
  icon?: string;
  badge?: string;
  actions?: Array<{ action: string; title: string }>;
  data?: Record<string, unknown>;
}

export async function sendPushNotifications(
  title: string,
  body: string,
  url: string,
  opts: PushNotificationOptions = {}
) {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const contactEmail = process.env.VAPID_CONTACT_EMAIL || "admin@slnews.vercel.app";

  if (!vapidPublic || !vapidPrivate) {
    return { sent: 0, error: "VAPID keys not configured" };
  }

  webpush.setVapidDetails(`mailto:${contactEmail}`, vapidPublic, vapidPrivate);

  let where: Prisma.PushSubscriptionWhereInput | undefined;
  if (opts.userIds && opts.userIds.length > 0) {
    where = { userId: { in: opts.userIds } };
  } else if (opts.userId) {
    where = { userId: opts.userId };
  }

  const subscriptions = await db.pushSubscription.findMany({
    take: 1000,
    where,
  });

  if (subscriptions.length === 0) return { sent: 0 };

  const payload = JSON.stringify({
    title,
    body,
    url,
    icon: opts.icon || "/icon-192x192.png",
    badge: opts.badge || "/icon-192x192.png",
    tag: opts.tag || "slnews-general",
    actions: opts.actions || [{ action: "open", title: "Open" }],
    data: {
      url,
      ...opts.data,
    },
  });

  let sent = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          payload
        );
        sent++;
      } catch (err: unknown) {
        const errBody = (err as { statusCode?: number; body?: string }) ?? {};
        if (errBody.statusCode === 410 || errBody.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await db.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }

  return { sent };
}
