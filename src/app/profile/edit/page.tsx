"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { updateProfile, loadPreferences } from "@/app/actions/user-actions";
import { useToast } from "@/components/Toast";
import { useAppStore } from "@/store/useAppStore";

const REGIONS = ["Freetown", "Bo", "Makeni", "Kenema", "Koidu", "International"];
const TOPICS = ["Politics", "Sports", "Technology", "Environment", "Health", "Economy", "Culture"];

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const storeRegion = useAppStore((s) => s.preferredRegion);
  const storeTopics = useAppStore((s) => s.preferredTopics);
  const setPreferences = useAppStore((s) => s.setPreferences);

  const [name, setName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [storedBio, setStoredBio] = useState("");
  const [imageUrl, setImageUrl] = useState(session?.user?.image || "");
  const [selectedRegion, setSelectedRegion] = useState(storeRegion || "");
  const [selectedTopics, setSelectedTopics] = useState<string[]>(storeTopics);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(session?.user?.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPreferences().then((prefs) => {
      const b = prefs.bio || "";
      setBio(b);
      setStoredBio(b);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be under 5MB", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setImagePreview(data.url);
      } else {
        toast("Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    }
    setUploading(false);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const result = await updateProfile({
      name: name.trim(),
      image: imageUrl || null,
      bio: bio || null,
      preferredRegion: selectedRegion || null,
      preferredTopics: selectedTopics,
    });
    if (result.success) {
      setPreferences(selectedRegion || null, selectedTopics);
      await update({ name: name.trim(), image: imageUrl || null });
      toast("Profile updated!", "success");
      router.push("/profile");
    } else {
      toast(result.error || "Failed to update profile", "error");
    }
    setSaving(false);
  };

  const hasChanges =
    name.trim() !== (session?.user?.name || "") ||
    imageUrl !== (session?.user?.image || "") ||
    bio !== storedBio ||
    selectedRegion !== (storeRegion || "") ||
    JSON.stringify(selectedTopics) !== JSON.stringify(storeTopics);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Edit Profile</h1>
        <p className="text-on-surface-variant mt-1">Update your personal details and content preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            Profile Photo
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-container shrink-0 shadow-sm border border-outline-variant">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Avatar preview"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  onError={() => setImagePreview(session?.user?.image || "")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-2xl font-bold">
                  {(name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="space-y-2.5 flex-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-2 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-medium text-sm transition-colors border border-outline-variant cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>
              <input
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImagePreview(e.target.value); }}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-on-surface font-medium text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
                placeholder="Or paste image URL..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            Basic Info
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Display Name
              </label>
              <input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface font-medium text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50"
                placeholder="Your name"
                type="text"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="edit-bio" className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Bio
              </label>
              <textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant text-on-surface font-medium text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-on-surface-variant/50 resize-none"
                placeholder="Tell us a little about yourself..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-on-surface-variant mt-1 text-right">{bio.length}/500</p>
            </div>

            <div>
              <label htmlFor="edit-email" className="block text-sm font-semibold text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                id="edit-email"
                value={session?.user?.email || ""}
                className="w-full px-4 py-3 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface-variant/70 font-medium text-sm outline-none cursor-not-allowed"
                type="email"
                disabled
              />
              <p className="text-xs text-on-surface-variant mt-1.5 ml-0.5">Email cannot be changed.</p>
            </div>
          </div>
        </div>

        {/* Preferred Region */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
            Preferred Region
          </h2>
          <p className="text-sm text-on-surface-variant mb-4">Get news tailored to your location.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {REGIONS.map((region) => {
              const active = selectedRegion === region;
              return (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(active ? "" : region)}
                  className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Topics */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>interests</span>
            Topics You Follow
          </h2>
          <p className="text-sm text-on-surface-variant mb-4">Select topics that interest you.</p>
          <div className="flex flex-wrap gap-2.5">
            {TOPICS.map((topic) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {active ? `${topic}` : `+ ${topic}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <Link
            href="/profile"
            className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || (!hasChanges && !bio)}
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
