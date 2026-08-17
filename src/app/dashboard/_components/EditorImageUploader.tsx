"use client";

import { useRef, useState } from "react";

type EditorImageUploaderProps = {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  error?: string;
  onClearError: () => void;
};

export default function EditorImageUploader({
  imageUrl,
  setImageUrl,
  error,
  onClearError,
}: EditorImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        onClearError();
      }
    } catch {
      // Error handled by parent validation
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-gray-100">
      <label htmlFor="editor-image" className="block text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
        Featured Image
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="editor-image"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            onClearError();
          }}
          className={`flex-1 bg-white border rounded-2xl p-3 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner ${
            error ? "border-red-300" : "border-gray-200 focus:border-primary"
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
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      {imageUrl && (
        <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden">
          <img src={imageUrl} alt="Featured preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
