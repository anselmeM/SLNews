"use server";

import webpush from "web-push";
import { db } from "@/lib/db";

export async function sendPushNotifications(title: string, body: string, url: string) {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const contactEmail = process.env.VAPID_CONTACT_EMAIL || "admin@slnews.vercel.app";

  if (!vapidPublic || !vapidPrivate) {
    return { sent: 0, error: "VAPID keys not configured" };
  }

  webpush.setVapidDetails(`mailto:${contactEmail}`, vapidPublic, vapidPrivate);

  const subscriptions = await db.pushSubscription.findMany({ take: 500 });
  if (subscriptions.length === 0) return { sent: 0 };

  const payload = JSON.stringify({ title, body, url, icon: "/icon-192x192.png" });
  let sent = 0;

  for (const sub of subscriptions) {
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
        await db.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
      }
    }
  }

  return { sent };
}
