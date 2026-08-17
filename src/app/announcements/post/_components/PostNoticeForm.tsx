"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAnnouncement } from "@/app/actions/announcements";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcement-constants";

const FORM_CATEGORIES = ANNOUNCEMENT_CATEGORIES.filter((c) => c !== "All");

export default function PostNoticeForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const result = await postAnnouncement(data);

    if (result.success) {
      form.reset();
      router.push("/announcements");
      router.refresh();
    } else {
      setError(result.error || "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-on-surface mb-1">
          Title <span className="text-error">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Hiring Senior Accountant / 3-Bedroom House for Rent"
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-on-surface mb-1">
          Category <span className="text-error">*</span>
        </label>
        <select
          id="category"
          name="category"
          required
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Select a category...</option>
          {FORM_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="organization" className="block text-sm font-semibold text-on-surface mb-1">
            Organization <span className="text-error">*</span>
          </label>
          <input
            id="organization"
            name="organization"
            required
            placeholder="e.g. Ministry of Health"
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-on-surface mb-1">
            Location <span className="text-error">*</span>
          </label>
          <input
            id="location"
            name="location"
            required
            placeholder="e.g. Freetown, Western Area"
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="urgency" className="block text-sm font-semibold text-on-surface mb-1">
            Urgency
          </label>
          <select
            id="urgency"
            name="urgency"
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Normal</option>
            <option value="warning">Warning</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-semibold text-on-surface mb-1">
            WhatsApp / Phone (Optional)
          </label>
          <input
            id="contact"
            name="contact"
            placeholder="e.g. 076 123 456 or +232 78 987 654"
            className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-semibold text-on-surface mb-1">
          Notice Details <span className="text-error">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={5000}
          rows={6}
          placeholder="Full description of the notice, including dates, times, and contact information..."
          className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline/30 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y min-h-[120px]"
        />
        <p className="text-xs text-on-surface-variant mt-1">Max 5,000 characters</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Posting..." : "Post Notice"}
      </button>

      <p className="text-xs text-on-surface-variant text-center">
        By posting, you agree that your notice will be publicly visible.
      </p>
    </form>
  );
}
