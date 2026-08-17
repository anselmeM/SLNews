"use client";

type EditorPreviewProps = {
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  categoryName: string;
};

export default function EditorPreview({
  title,
  summary,
  content,
  imageUrl,
  categoryName,
}: EditorPreviewProps) {
  return (
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
  );
}
