"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const regions = [
  { name: "Freetown", icon: "location_city", desc: "Capital & Western Area" },
  { name: "Bo", icon: "location_on", desc: "Southern Province hub" },
  { name: "Makeni", icon: "location_on", desc: "Northern Province" },
  { name: "Kenema", icon: "location_on", desc: "Eastern Province" },
  { name: "Koidu", icon: "location_on", desc: "Diamond district" },
  { name: "International", icon: "public", desc: "World news" },
];

const topics = [
  { name: "Politics", icon: "account_balance", color: "text-blue-600 dark:text-blue-400" },
  { name: "Sports", icon: "sports_soccer", color: "text-orange-600 dark:text-orange-400" },
  { name: "Technology", icon: "devices", color: "text-purple-600 dark:text-purple-400" },
  { name: "Environment", icon: "park", color: "text-green-600 dark:text-green-400" },
  { name: "Health", icon: "health_and_safety", color: "text-red-600 dark:text-red-400" },
  { name: "Economy", icon: "trending_up", color: "text-amber-600 dark:text-amber-400" },
  { name: "Culture", icon: "theater_comedy", color: "text-pink-600 dark:text-pink-400" },
];

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { setRegion, toggleTopic, preferredRegion, preferredTopics, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSkip = () => {
    completeOnboarding();
    router.push("/home");
  };

  const handleFinish = () => {
    completeOnboarding();
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/8 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 dark:bg-secondary/8 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-tertiary/10 dark:bg-tertiary/8 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-[480px] bg-surface dark:bg-surface-container-low border border-outline-variant/30 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden p-6 sm:p-8 min-h-[500px] flex flex-col justify-between">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-sm font-medium text-on-surface-variant/60 hover:text-on-surface transition-colors cursor-pointer z-20"
        >
          Skip
        </button>

        <div>
          {/* Progress steps with labels */}
          <div className="flex items-center gap-2 mb-10">
            {[
              { num: 1, label: "Welcome" },
              { num: 2, label: "Location" },
              { num: 3, label: "Topics" },
            ].map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-2 flex-1 last:flex-none">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${
                        isDone
                          ? "bg-primary text-white"
                          : isActive
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold hidden sm:block whitespace-nowrap transition-colors duration-300 ${
                        isActive ? "text-primary" : isDone ? "text-on-surface" : "text-on-surface-variant/50"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {s.num < 3 && (
                    <div
                      className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                        isDone ? "bg-primary" : "bg-surface-container-high"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* ── Step 1: Welcome ── */}
                {step === 1 && (
                  <div className="text-center space-y-6 py-2">
                    {/* Hero illustration: SLNews shield */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      className="mx-auto w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-primary via-primary to-primary-container rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20 mb-2"
                    >
                      <span className="material-symbols-outlined text-white text-6xl sm:text-7xl select-none pointer-events-none">
                        globe_book
                      </span>
                    </motion.div>

                    <div>
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight"
                      >
                        Welcome to{" "}
                        <span className="text-primary">SLNews</span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="text-sm sm:text-base text-on-surface-variant mt-3 max-w-sm mx-auto leading-relaxed"
                      >
                        Your window into Sierra Leone — curated news, market prices, and stories that matter.
                      </motion.p>
                    </div>

                    {/* Value props */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className="grid grid-cols-3 gap-3 pt-2"
                    >
                      {[
                        { icon: "newspaper", label: "Curated News" },
                        { icon: "notifications_active", label: "Alerts" },
                        { icon: "tune", label: "Personalized" },
                      ].map(({ icon, label }) => (
                        <div
                          key={label}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-low border border-outline-variant/20"
                        >
                          <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                          <span className="text-xs font-semibold text-on-surface">{label}</span>
                        </div>
                      ))}
                    </motion.div>

                    {/* Sign-in prompt */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.75 }}
                      className="text-sm text-on-surface-variant/70"
                    >
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary font-semibold hover:underline">
                        Sign in
                      </Link>
                    </motion.p>
                  </div>
                )}

                {/* ── Step 2: Location ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="text-center space-y-2">
                      <span className="material-symbols-outlined text-4xl text-primary">explore</span>
                      <h2 className="text-2xl font-bold text-on-surface">Your Region</h2>
                      <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                        Pick your area to get local news, markets, and updates from your community.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {regions.map((r) => {
                        const isSelected = preferredRegion === r.name;
                        return (
                          <motion.button
                            key={r.name}
                            onClick={() => setRegion(r.name)}
                            whileTap={{ scale: 0.96 }}
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-outline-variant/40 bg-white dark:bg-surface-container-low hover:border-primary/30 hover:bg-surface-container-lowest"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                  isSelected ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">{r.icon}</span>
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}>
                                  {r.name}
                                </p>
                                <p className="text-[11px] text-on-surface-variant/60 truncate">{r.desc}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined absolute top-2 right-2 text-primary text-lg">
                                check_circle
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Topics ── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="text-center space-y-2">
                      <span className="material-symbols-outlined text-4xl text-primary">interests</span>
                      <h2 className="text-2xl font-bold text-on-surface">Your Interests</h2>
                      <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                        Choose topics you care about. We&rsquo;ll prioritise relevant stories in your feed.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center">
                      {topics.map((t) => {
                        const isSelected = preferredTopics.includes(t.name);
                        return (
                          <motion.button
                            key={t.name}
                            onClick={() => toggleTopic(t.name)}
                            whileTap={{ scale: 0.94 }}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                : `border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:border-primary/30`
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg ${
                                isSelected ? "text-white" : t.color
                              }`}
                              style={isSelected ? { fontVariationSettings: "'FILL' 1" } : {}}
                            >
                              {t.icon}
                            </span>
                            {t.name}
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-center text-on-surface-variant/60 pt-2">
                      {preferredTopics.length > 0
                        ? `${preferredTopics.length} topic${preferredTopics.length > 1 ? "s" : ""} selected`
                        : "Tap topics to select them"}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="mt-8 flex justify-between items-center pt-5 border-t border-outline-variant/20">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white rounded-full font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:bg-primary/95 transition-all cursor-pointer"
            >
              Continue
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <motion.button
              onClick={handleFinish}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-8 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              Let&rsquo;s Go
            </motion.button>
          )}
        </div>
      </div>

      {/* Bottom indicator dots for mobile */}
      <div className="relative z-10 flex gap-2 mt-6 sm:hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              step >= i ? "bg-primary scale-100" : "bg-outline-variant/30 scale-75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
