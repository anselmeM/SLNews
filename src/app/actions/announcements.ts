"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function postAnnouncement(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in to post a notice." };

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const category = formData.get("category") as string;
  const organization = formData.get("organization") as string;
  const location = formData.get("location") as string;
  const urgency = formData.get("urgency") as string || null;

  if (!title || !body || !category || !organization || !location) {
    return { success: false, error: "All fields except urgency are required." };
  }

  if (title.length > 200) return { success: false, error: "Title is too long (max 200 characters)." };
  if (body.length > 5000) return { success: false, error: "Body is too long (max 5000 characters)." };

  const iconMap: Record<string, string> = {
    "Government": "campaign",
    "NGO Announcement": "volunteer_activism",
    "Local Event": "event",
    "Death Notice": "church",
  };

  try {
    await db.announcement.create({
      data: {
        title,
        body,
        category,
        icon: iconMap[category] || "notifications",
        organization,
        location,
        dateLabel: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        urgency,
        published: true,
      },
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to post notice. Please try again." };
  }
}
