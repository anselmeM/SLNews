import type { Article, Category } from "@prisma/client";

export type DashboardArticle = Article & { categories: Category[] };
