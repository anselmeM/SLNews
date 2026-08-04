import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardClient from "./_components/DashboardClient";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { DashboardArticle } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard | SLNews",
  description: "Write, edit, and manage articles on SLNews.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "WRITER" && session.user.role !== "EDITOR" && session.user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-on-surface">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to view the dashboard.</p>
      </div>
    );
  }

  const articles = await db.article.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { categories: true }
  });

  const isModerator = session.user.role === "EDITOR" || session.user.role === "ADMIN";

  return (
    <div className="w-full">
      {isModerator && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-lg">fact_check</span> Price Reports
          </Link>
        </div>
      )}
      <DashboardClient user={session.user} articles={articles as DashboardArticle[]} />
    </div>
  );
}
