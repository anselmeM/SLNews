"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import EditorImageUploader from "./EditorImageUploader";
import EditorMetadata from "./EditorMetadata";
import EditorPreview from "./EditorPreview";

type EditorFormProps = {
  articleId: string;
  title: string;
  setTitle: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
  summary: string;
  setSummary: (v: string) => void;
  imageUrl: string;
  setImageUrl: (v: string) => void;
  province: string;
  setProvince: (v: string) => void;
  categoryName: string;
  setCategoryName: (v: string) => void;
  breaking: boolean;
  setBreaking: (v: boolean) => void;
  isAdmin: boolean;
  error: string;
  loading: boolean;
  onSave: (submitForReview: boolean) => void;
};

const AUTOSAVE_KEY = "slnews-draft-autosave";
const AUTOSAVE_INTERVAL = 5000;

export default function EditorForm(props: EditorFormProps) {
  const {
    articleId,
    title,
    setTitle,
    content,
    setContent,
    summary,
    setSummary,
    imageUrl,
    setImageUrl,
    province,
    setProvince,
    categoryName,
    setCategoryName,
    breaking,
    setBreaking,
    isAdmin,
    error,
    loading,
    onSave,
  } = props;

  const [preview, setPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [recovered, setRecovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (articleId) return;
    timerRef.current = setTimeout(() => {
      const draft = { title, content, summary, categoryName, province, imageUrl };
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft));
      } catch {
        /* ignore */
      }
    }, AUTOSAVE_INTERVAL);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content, summary, categoryName, province, imageUrl, articleId]);

  // Recover draft on mount
  useEffect(() => {
    if (articleId || recovered) return;
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.title || draft.content) {
        queueMicrotask(() => {
          setTitle(draft.title || "");
          setContent(draft.content || "");
          setSummary(draft.summary || "");
          setCategoryName(draft.categoryName || "");
          setProvince(draft.province || "");
          setImageUrl(draft.imageUrl || "");
          setRecovered(true);
        });
      }
    } catch {
      /* ignore */
    }
  }, [articleId, recovered, setTitle, setContent, setSummary, setCategoryName, setProvince, setImageUrl]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {
      /* ignore */
    }
    setRecovered(false);
  }, []);

  const validate = (submitForReview: boolean): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!content.trim()) errs.content = "Content is required";
    if (submitForReview && !categoryName) errs.categoryName = "Category is required for review";
    if (submitForReview && !imageUrl.trim()) errs.imageUrl = "Featured image is required for review";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (submitForReview: boolean) => {
    if (!validate(submitForReview)) return;
    if (!submitForReview) clearDraft();
    onSave(submitForReview);
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">edit_document</span>
          <span className="font-bold text-xs uppercase tracking-wider text-on-surface-variant">
            {articleId ? "Editing Article" : "New Article"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {recovered && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors cursor-pointer"
            >
              Clear draft
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              preview
                ? "bg-primary text-white"
                : "bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary/50"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{preview ? "edit" : "visibility"}</span>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3.5 bg-error-container border border-error/15 rounded-2xl text-on-error-container font-semibold text-xs uppercase tracking-wide">
          {error}
        </div>
      )}

      {recovered && (
        <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">restore</span>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-200 flex-1">
            Recovered unsaved draft from earlier.
          </span>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-8">
        {preview ? (
          <EditorPreview
            title={title}
            summary={summary}
            content={content}
            imageUrl={imageUrl}
            categoryName={categoryName}
          />
        ) : (
          <>
            {/* Title */}
            <div>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFieldErrors((p) => ({ ...p, title: "" }));
                }}
                className={`w-full text-2xl sm:text-3xl md:text-4xl font-black text-on-surface bg-transparent border-0 border-b-2 px-0 py-2 placeholder:text-on-surface-variant/40 outline-none tracking-tight transition-colors ${
                  fieldErrors.title ? "border-red-300" : "border-outline-variant/40 focus:border-primary"
                }`}
                placeholder="Article title"
                type="text"
              />
              {fieldErrors.title && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.title}</p>
              )}
            </div>

            {/* Summary */}
            <div>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-base md:text-lg font-medium text-on-surface-variant bg-transparent border-0 border-b border-outline-variant/40 focus:border-primary focus:ring-0 px-0 py-2 placeholder:text-on-surface-variant/40 outline-none tracking-tight"
                placeholder="Short subtitle or summary..."
                type="text"
              />
            </div>

            {/* Metadata Grid (Province, Category, Breaking) */}
            <EditorMetadata
              province={province}
              setProvince={setProvince}
              categoryName={categoryName}
              setCategoryName={setCategoryName}
              breaking={breaking}
              setBreaking={setBreaking}
              isAdmin={isAdmin}
              categoryError={fieldErrors.categoryName}
              onClearCategoryError={() => setFieldErrors((p) => ({ ...p, categoryName: "" }))}
            />

            {/* Content Body */}
            <div>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setFieldErrors((p) => ({ ...p, content: "" }));
                }}
                className={`w-full bg-transparent border-0 focus:ring-0 p-0 font-body-lg text-base md:text-lg text-on-surface outline-none resize-y min-h-[300px] md:min-h-[420px] lg:min-h-[560px] leading-relaxed placeholder:text-on-surface-variant/40 ${
                  fieldErrors.content ? "border-l-2 border-l-red-300 pl-2" : ""
                }`}
                placeholder="Tell your story..."
              />
              {fieldErrors.content && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.content}</p>
              )}
            </div>

            {/* Featured Image Uploader */}
            <EditorImageUploader
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              error={fieldErrors.imageUrl}
              onClearError={() => setFieldErrors((p) => ({ ...p, imageUrl: "" }))}
            />
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-outline-variant/40">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-6 py-3 rounded-full font-bold text-sm text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading || !title.trim() || !content.trim()}
            className="px-6 py-3 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary/95 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
