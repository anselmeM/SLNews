"use server";

import { auth } from "@/auth";
import { CATEGORY_ICON_MAP } from "@/lib/announcement-constants";
import { db } from "@/lib/db";


export async function postAnnouncement(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "You must be signed in to post a notice." };

  const title = formData.get("title") as string;
  let body = formData.get("body") as string;
  const category = formData.get("category") as string;
  const organization = formData.get("organization") as string;
  const location = formData.get("location") as string;
  const urgency = (formData.get("urgency") as string) || null;
  const contact = (formData.get("contact") as string)?.trim() || null;

  if (!title || !body || !category || !organization || !location) {
    return { success: false, error: "All fields except urgency and contact are required." };
  }

  if (title.length > 200) return { success: false, error: "Title is too long (max 200 characters)." };
  if (body.length > 5000) return { success: false, error: "Body is too long (max 5000 characters)." };

  if (contact && !body.includes(contact)) {
    body = `${body}\n\nContact / WhatsApp: ${contact}`;
  }

  try {
    await db.announcement.create({
      data: {
        title,
        body,
        category,
        icon: CATEGORY_ICON_MAP[category] || "notifications",
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
  } catch {
    return { success: false, error: "Failed to post notice. Please try again." };
  }
}
