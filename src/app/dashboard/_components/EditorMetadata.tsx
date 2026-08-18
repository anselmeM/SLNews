"use client";

const CATEGORIES = [
  "National",
  "Politics",
  "Economy",
  "Education",
  "International",
  "Sports",
  "Tech",
  "Health",
  "Environment",
  "Culture",
];

const PROVINCES = [
  "Western Area",
  "Northern",
  "Eastern",
  "Southern",
  "North-West",
];

type EditorMetadataProps = {
  province: string;
  setProvince: (v: string) => void;
  categoryName: string;
  setCategoryName: (v: string) => void;
  breaking: boolean;
  setBreaking: (v: boolean) => void;
  isAdmin: boolean;
  categoryError?: string;
  onClearCategoryError: () => void;
};

export default function EditorMetadata({
  province,
  setProvince,
  categoryName,
  setCategoryName,
  breaking,
  setBreaking,
  isAdmin,
  categoryError,
  onClearCategoryError,
}: EditorMetadataProps) {
  return (
    <>
      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40">
        <div>
          <label
            htmlFor="editor-province"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 px-1"
          >
            Province
          </label>
          <select
            id="editor-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/60 rounded-xl p-2.5 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-inner"
          >
            <option value="">Select Province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="editor-category"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 px-1"
          >
            Category
          </label>
          <select
            id="editor-category"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              onClearCategoryError();
            }}
            className={`w-full bg-surface-container border rounded-xl p-2.5 font-semibold text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all shadow-inner ${
              categoryError ? "border-red-300" : "border-outline-variant/60 focus:border-primary"
            }`}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {categoryError && (
            <p className="text-xs text-red-500 mt-1 font-semibold">{categoryError}</p>
          )}
        </div>
      </div>

      {/* Breaking news toggle */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-2xl p-4">
          <div>
            <p className="text-sm font-bold text-red-800 dark:text-red-300">Breaking News</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Reserved for urgent National stories with an image.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBreaking(!breaking)}
            className={`relative w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer ${
              breaking ? "bg-red-600" : "bg-surface-container-highest"
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
    </>
  );
}
