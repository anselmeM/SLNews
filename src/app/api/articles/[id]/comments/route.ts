import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const comments = await db.comment.findMany({
    where: { articleId: id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const content = (body.content || "").trim();

  if (!content) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment is too long (max 2000 characters)" }, { status: 400 });
  }

  const article = await db.article.findUnique({ where: { id }, select: { id: true } });
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: {
      content,
      articleId: id,
      userId: session.user.id,
      parentId: body.parentId || null,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
