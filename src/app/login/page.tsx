"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      setError("Sign in is taking too long. Please try again.");
      setLoading(false);
    }, 15000);

    try {
      const result = await Promise.race([
        signIn("credentials", { redirect: false, email, password }),
        new Promise<{ error?: string }>((resolve) =>
          setTimeout(() => resolve({ error: "timeout" }), 12000)
        ),
      ]);

      clearTimeout(timeout);

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/home");
        router.refresh();
      }
    } catch {
      clearTimeout(timeout);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[448px]"
      >
        <div className="bg-white/75 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg p-8 overflow-hidden">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-on-surface mb-1.5 tracking-tighter leading-none">Welcome Back</h1>
            <p className="font-medium text-gray-500 text-sm tracking-tight">Sign in to your SLNews account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-error-container border border-error/15 rounded-2xl text-on-error-container font-semibold text-xs uppercase tracking-wide">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-on-surface placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm shadow-inner"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-on-surface placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-semibold text-sm shadow-inner"
              placeholder="••••••••"
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label="Sign in to your account"
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/95 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Don&rsquo;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
