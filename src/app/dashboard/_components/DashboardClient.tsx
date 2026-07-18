"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminSyncPanel from "./AdminSyncPanel";
import ArticleList from "./ArticleList";
import EditorForm from "./EditorForm";
import { upsertArticle } from "@/app/actions/article-actions";
import { useToast } from "@/components/Toast";
import type { DashboardArticle } from "@/lib/types";

export default function DashboardClient({
  user,
  articles,
}: {
  user: { name?: string | null; role?: string | null };
  articles: DashboardArticle[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"write" | "drafts" | "published">("write");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [articleId, setArticleId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [province, setProvince] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [breaking, setBreaking] = useState(false);

  const drafts = articles.filter((a) => a.status === "DRAFT" || a.status === "IN_REVIEW");
  const published = articles.filter((a) => a.status === "PUBLISHED" || a.status === "APPROVED");

  const isAdmin = user.role === "ADMIN" || user.role === "EDITOR";

  const loadArticle = (article: DashboardArticle) => {
    setArticleId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setSummary(article.summary || "");
    setImageUrl(article.imageUrl || "");
    setProvince(article.province || "");
    setCategoryName(article.categories?.[0]?.name || "");
    setBreaking(article.breaking);
    setActiveTab("write");
  };

  const clearForm = () => {
    setArticleId("");
    setTitle("");
    setContent("");
    setSummary("");
    setImageUrl("");
    setProvince("");
    setCategoryName("");
    setBreaking(false);
  };

  const handleSave = async (submitForReview: boolean) => {
    setLoading(true);
    setError("");
    try {
      if (!title || !content) throw new Error("Title and Content are required.");
      await upsertArticle({
        id: articleId || undefined,
        title,
        content,
        summary,
        imageUrl,
        province,
        categoryName,
        submitForReview,
        breaking,
      });
      router.refresh();
      if (submitForReview) {
        clearForm();
        setActiveTab("drafts");
        toast("Article submitted for review!", "success");
      } else {
        toast("Draft saved!", "success");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <>
      {/* Desktop top bar */}
      <div className="hidden lg:flex items-center justify-between bg-surface-container-lowest rounded-2xl border border-outline-variant px-5 py-4 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm uppercase shrink-0">
            {user.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="font-semibold text-on-surface">{user.name}</h1>
            <span className="text-xs text-primary font-medium">{user.role}</span>
          </div>
          <div className="hidden md:flex items-center gap-5 ml-6 pl-6 border-l border-outline-variant text-sm">
            <div>
              <span className="text-lg font-black text-primary">{drafts.length}</span>
              <p className="text-xs text-on-surface-variant">drafts</p>
            </div>
            <div>
              <span className="text-lg font-black text-on-surface">{published.length}</span>
              <p className="text-xs text-on-surface-variant">published</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <AdminSyncPanel />}
          <button
            onClick={() => { clearForm(); setActiveTab("write"); }}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Article
          </button>
        </div>
      </div>

      {/* Desktop layout: two-pane */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* Left: article list */}
        <div className="col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="flex border-b border-outline-variant bg-surface-container-low">
            <button
              onClick={() => setActiveTab("drafts")}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${activeTab === "drafts" ? "text-primary border-b-2 border-primary bg-surface-container-lowest" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Drafts ({drafts.length})
            </button>
            <button
              onClick={() => setActiveTab("published")}
              className={`flex-1 py-3 text-xs font-semibold transition-colors cursor-pointer ${activeTab === "published" ? "text-primary border-b-2 border-primary bg-surface-container-lowest" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Published ({published.length})
            </button>
          </div>
          <div className="p-2 overflow-y-auto h-[calc(100%-41px)]">
            {(activeTab === "drafts" || activeTab === "published") && (
              <ArticleList
                articles={activeTab === "drafts" ? drafts : published}
                onEdit={loadArticle}
                emptyMessage={activeTab === "drafts" ? "No drafts yet" : "No published articles"}
              />
            )}
          </div>
        </div>

        {/* Right: editor */}
        <div className="col-span-9 flex flex-col overflow-hidden">
          {activeTab === "write" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-5 flex flex-col flex-1 overflow-hidden"
            >
              <EditorForm
                articleId={articleId}
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                summary={summary}
                setSummary={setSummary}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                province={province}
                setProvince={setProvince}
                categoryName={categoryName}
                setCategoryName={setCategoryName}
                breaking={breaking}
                setBreaking={setBreaking}
                isAdmin={isAdmin}
                error={error}
                loading={loading}
                onSave={handleSave}
              />
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 mt-auto border-t border-outline-variant">
                <span>{articleId ? "Editing existing article" : "New article"}</span>
                <span>{wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}</span>
              </div>
            </motion.div>
          )}

          {activeTab !== "write" && (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-8">
              <span className="material-symbols-outlined text-5xl mb-3">edit_note</span>
              <p className="font-medium">Select an article to edit, or start a new one</p>
              <button
                onClick={() => { clearForm(); setActiveTab("write"); }}
                className="mt-4 flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer min-h-[44px]"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Article
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile layout: tabs + content */}
      <div className="lg:hidden space-y-4">
        <div className="flex gap-2 pb-1 overflow-x-auto">
          {[
            { key: "write", label: "Write" },
            { key: "drafts", label: `Drafts (${drafts.length})` },
            { key: "published", label: `Published (${published.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer min-h-[44px] ${
                activeTab === key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface-variant text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "write" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <EditorForm
              articleId={articleId}
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              summary={summary}
              setSummary={setSummary}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              province={province}
              setProvince={setProvince}
              categoryName={categoryName}
              setCategoryName={setCategoryName}
              breaking={breaking}
              setBreaking={setBreaking}
              isAdmin={isAdmin}
              error={error}
              loading={loading}
              onSave={handleSave}
            />
            <div className="flex items-center justify-between text-xs text-on-surface-variant px-2 mt-4">
              <span>{articleId ? "Existing article" : "New article"}</span>
              <span>{wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}</span>
            </div>
          </motion.div>
        )}

        {activeTab === "drafts" && (
          <ArticleList articles={drafts} onEdit={loadArticle} emptyMessage="No drafts yet" />
        )}
        {activeTab === "published" && (
          <ArticleList articles={published} onEdit={loadArticle} emptyMessage="No published articles" />
        )}

        {isAdmin && activeTab === "write" && <AdminSyncPanel />}
      </div>
    </>
  );
}
