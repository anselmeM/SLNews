"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function upsertArticle(data: {
  id?: string;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  province?: string;
  district?: string;
  categoryName?: string;
  submitForReview?: boolean;
  breaking?: boolean;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userRole = session.user.role;
  if (userRole !== "WRITER" && userRole !== "EDITOR" && userRole !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const { id, title, content, summary, imageUrl, province, district, categoryName, submitForReview, breaking } = data;

  const status = submitForReview ? "IN_REVIEW" : "DRAFT";

  const canSetBreaking = userRole === "EDITOR" || userRole === "ADMIN";

  // Handle categories
  const categoriesUpdate = categoryName ? {
    set: [], // clear existing to replace with the new one
    connectOrCreate: {
      where: { name: categoryName },
      create: { name: categoryName },
    }
  } : undefined;

  const categoriesCreate = categoryName ? {
    connectOrCreate: {
      where: { name: categoryName },
      create: { name: categoryName },
    }
  } : undefined;

  let article;
  
  if (id) {
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Article not found");
    if (existing.authorId !== session.user.id && userRole !== "EDITOR" && userRole !== "ADMIN") {
      throw new Error("Forbidden");
    }

    article = await db.article.update({
      where: { id },
      data: {
        title,
        content,
        summary,
        imageUrl: imageUrl || null,
        province: province || null,
        district: district || null,
        status,
        ...(canSetBreaking ? { breaking: !!breaking, breakingSetAt: breaking ? new Date() : null } : {}),
        ...(categoriesUpdate ? { categories: categoriesUpdate } : {}),
      }
    });
  } else {
    article = await db.article.create({
      data: {
        title,
        content,
        summary,
        imageUrl: imageUrl || null,
        province: province || null,
        district: district || null,
        status,
        authorId: session.user.id,
        ...(canSetBreaking ? { breaking: !!breaking, breakingSetAt: breaking ? new Date() : null } : {}),
        ...(categoriesCreate ? { categories: categoriesCreate } : {}),
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/home");
  return { success: true, articleId: article.id };
}

export async function deleteArticle(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const article = await db.article.findUnique({ where: { id } });
  if (!article) throw new Error("Article not found");
  if (article.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  await db.article.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/home");
  return { success: true };
}
