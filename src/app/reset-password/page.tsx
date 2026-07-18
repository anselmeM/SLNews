"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/app/actions/password-reset-actions";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error || "Reset failed");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant">Invalid reset link.</p>
          <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[448px]"
      >
        <div className="bg-white/75 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg p-8 overflow-hidden">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">Password Reset</h2>
              <p className="text-sm text-on-surface-variant">Your password has been updated successfully.</p>
              <Link href="/login" className="text-primary font-semibold hover:underline text-sm block">
                Sign in with new password
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">New Password</h1>
                <p className="font-medium text-gray-500 text-sm tracking-tight">Choose a new password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3.5 bg-error-container border border-error/15 rounded-2xl text-on-error-container font-semibold text-xs uppercase tracking-wide">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1" htmlFor="password">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-on-surface placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm shadow-inner"
                    placeholder="At least 6 characters"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
