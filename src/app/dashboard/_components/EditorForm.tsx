"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type EditorFormProps = {
  articleId: string;
  title: string; setTitle: (v: string) => void;
  content: string; setContent: (v: string) => void;
  summary: string; setSummary: (v: string) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  province: string; setProvince: (v: string) => void;
  categoryName: string; setCategoryName: (v: string) => void;
  breaking: boolean; setBreaking: (v: boolean) => void;
  isAdmin: boolean;
  error: string;
  loading: boolean;
  onSave: (submitForReview: boolean) => void;
};

const CATEGORIES = [
  "National", "Politics", "Economy", "Education",
  "Local", "International", "Sports", "Technology",
  "Health", "Environment", "Culture",
];

const PROVINCES = [
  "Western Area", "Northern", "Eastern", "Southern", "North-West",
];

const AUTOSAVE_KEY = "slnews-draft-autosave";
const AUTOSAVE_INTERVAL = 5000;

export default function EditorForm(props: EditorFormProps) {
  const { articleId, title, setTitle, content, setContent, summary, setSummary, imageUrl, setImageUrl, province, setProvince, categoryName, setCategoryName, breaking, setBreaking, isAdmin, error, loading, onSave } = props;

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [recovered, setRecovered] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (articleId) return;
    timerRef.current = setTimeout(() => {
      const draft = { title, content, summary, categoryName, province, imageUrl };
      try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
    }, AUTOSAVE_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
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
    } catch { /* ignore */ }
  }, [articleId, recovered, setTitle, setContent, setSummary, setCategoryName, setProvince, setImageUrl]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* ignore */ }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch {
      setFieldErrors((prev) => ({ ...prev, imageUrl: "Upload failed" }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">edit_document</span>
          <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
            {articleId ? "Editing Article" : "New Article"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {recovered && (
            <button
              onClick={clearDraft}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
            >
              Clear draft
            </button>
          )}
          <button
            onClick={() => setPreview(!preview)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              preview ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-primary/30"
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
        <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-lg">restore</span>
          <span className="text-xs font-semibold text-amber-800 flex-1">Recovered unsaved draft from earlier.</span>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-8">
        {preview ? (
          /* Preview mode */
          <div className="space-y-6">
            {imageUrl && (
              <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                <img src={imageUrl} alt={title || "Article preview"} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-2">
              {categoryName && (
                <span className="inline-block bg-primary-container text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {categoryName}
                </span>
              )}
              <h1 className="text-3xl font-black text-on-surface tracking-tight leading-tight">
                {title || "Untitled"}
              </h1>
              {summary && <p className="text-base font-medium text-on-surface-variant">{summary}</p>}
              <div className="whitespace-pre-wrap text-base leading-relaxed text-on-surface mt-4">
                {content || "No content yet."}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <div>
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: "" })); }}
                className={`w-full text-2xl sm:text-3xl md:text-4xl font-black text-on-surface bg-transparent border-0 border-b-2 px-0 py-2 placeholder-gray-300 outline-none tracking-tight transition-colors ${
                  fieldErrors.title ? "border-red-300" : "border-gray-100 focus:border-primary"
                }`}
                placeholder="Article title"
                type="text"
              />
              {fieldErrors.title && <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.title}</p>}
            </div>

            {/* Summary */}
            <div>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full text-base md:text-lg font-medium text-gray-500 bg-transparent border-0 border-b border-gray-100 focus:border-primary focus:ring-0 px-0 py-2 placeholder-gray-300 outline-none tracking-tight"
                placeholder="Short subtitle or summary..."
                type="text"
              />
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div>
                <label htmlFor="editor-province" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Province</label>
                <select
                  id="editor-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="editor-category" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">Category</label>
                <select
                  id="editor-category"
                  value={categoryName}
                  onChange={(e) => { setCategoryName(e.target.value); setFieldErrors((p) => ({ ...p, categoryName: "" })); }}
                  className={`w-full bg-white border rounded-xl p-2.5 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner ${
                    fieldErrors.categoryName ? "border-red-300" : "border-gray-200 focus:border-primary"
                  }`}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {fieldErrors.categoryName && <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.categoryName}</p>}
              </div>
            </div>

            {/* Breaking toggle */}
            {isAdmin && (
              <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-2xl p-4">
                <div>
                  <p className="text-sm font-bold text-red-800">Breaking News</p>
                  <p className="text-xs text-red-600 mt-0.5">Reserved for urgent National stories with an image.</p>
                </div>
                <button
                  onClick={() => setBreaking(!breaking)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
                    breaking ? "bg-red-600" : "bg-gray-300"
                  }`}
                  aria-label="Toggle breaking news"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
                      breaking ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Content */}
            <div>
              <textarea
                value={content}
                onChange={(e) => { setContent(e.target.value); setFieldErrors((p) => ({ ...p, content: "" })); }}
                className={`w-full bg-transparent border-0 focus:ring-0 p-0 font-body-lg text-base md:text-lg text-on-surface outline-none resize-y min-h-[300px] md:min-h-[420px] lg:min-h-[560px] leading-relaxed placeholder-gray-300 ${
                  fieldErrors.content ? "border-l-2 border-l-red-300 pl-2" : ""
                }`}
                placeholder="Tell your story..."
              />
              {fieldErrors.content && <p className="text-xs text-red-500 mt-1 font-semibold">{fieldErrors.content}</p>}
            </div>

            {/* Image */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label htmlFor="editor-image" className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Featured Image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="editor-image"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setFieldErrors((p) => ({ ...p, imageUrl: "" })); }}
                  className={`flex-1 bg-white border rounded-2xl p-3 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner ${
                    fieldErrors.imageUrl ? "border-red-300" : "border-gray-200 focus:border-primary"
                  }`}
                  placeholder="Paste image URL..."
                  type="text"
                />
                <div className="flex gap-2">
                  <input
                    ref={fileRef}
                    onChange={handleFileUpload}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-lg">upload</span>
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
              {fieldErrors.imageUrl && <p className="text-xs text-red-500 font-semibold">{fieldErrors.imageUrl}</p>}
              {imageUrl && (
                <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </>
        )}

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="px-6 py-3 rounded-full font-bold text-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
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
