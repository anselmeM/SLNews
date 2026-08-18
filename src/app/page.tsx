import type { Metadata } from "next";
import Link from "next/link";
import LandingHeroActions from "@/components/LandingHeroActions";
import ReturningVisitorCheck from "@/components/ReturningVisitorCheck";
import { siteUrl } from "@/lib/site-url";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "SLNews",
  url: siteUrl("/"),
  description: "Local news, market prices, and community notices for Sierra Leone.",
  logo: siteUrl("/icon-512x512.png"),
};

export const metadata: Metadata = {
  title: "SLNews | Sierra Leone Community News",
  description:
    "Local news, market prices, and community notices for Sierra Leone. Free to read, no app store needed.",
  openGraph: {
    title: "SLNews | Sierra Leone Community News",
    description:
      "Local news, market prices, and community notices for Sierra Leone. Free to read, no app store needed.",
    type: "website",
    siteName: "SLNews",
  },
};

export default function LandingPage() {
  return (
    <ReturningVisitorCheck>
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Works on any phone. Low data mode.
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">
          Sierra Leone <span className="text-green-700">Community News</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
          Local news, market prices, and community notices. Built for Sierra Leone, by Sierra Leoneans. No app store needed.
        </p>

        <LandingHeroActions />
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center text-on-surface mb-8">What you get</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: "newspaper", title: "National News", desc: "Stories from Sierra Leone Telegraph, Politico SL, and Concord Times in one feed." },
            { icon: "trending_up", title: "Market Prices", desc: "Rice, petrol, cement, palm oil prices across Freetown, Bo, Makeni, Kenema." },
            { icon: "campaign", title: "Community Notices", desc: "Government announcements, local events, and public notices. Anyone can post." },
            { icon: "search", title: "Instant Search", desc: "Find any article or notice instantly. Filter by category or region." },
            { icon: "download", title: "No App Store Needed", desc: "Install directly from your browser. Works on any smartphone." },
            { icon: "cloud_off", title: "Works Offline", desc: "Saved articles and prices available even without internet connection." },
          ].map((f) => (
            <div key={f.title} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/50 shadow-xs hover:shadow-md transition-all flex gap-4 items-start">
              <span className="material-symbols-outlined text-2xl text-primary bg-primary-container/40 p-2.5 rounded-xl flex-shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-bold text-on-surface mb-0.5">{f.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Prices Preview */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center text-on-surface mb-2">Current Market Prices</h2>
        <p className="text-sm text-on-surface-variant text-center mb-6">Updated weekly. Prices in New Leone (NLe).</p>
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-xs overflow-hidden max-w-md mx-auto">
          {[
            { name: "Rice (50kg bag)", price: "NLe 180,000", trend: "up", pct: "2.5%" },
            { name: "Petrol (per litre)", price: "NLe 30", trend: "down", pct: "8%" },
            { name: "Diesel (per litre)", price: "NLe 32", trend: "down", pct: "5%" },
            { name: "Cement (imported bag)", price: "NLe 180,000", trend: "up", pct: "3%" },
            { name: "Palm Oil (per litre)", price: "NLe 19,000", trend: "down", pct: "10.6%" },
          ].map((item, i) => (
            <div key={item.name} className={`flex justify-between items-center px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-surface-container-low" : "bg-surface-container-lowest"}`}>
              <span className="font-semibold text-on-surface">{item.name}</span>
              <span className="text-on-surface-variant">
                <span className={item.trend === "up" ? "text-red-500 font-semibold mr-1" : "text-emerald-600 font-semibold mr-1"}>
                  {item.trend === "up" ? "↑" : "↓"} {item.pct}
                </span>
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Install Info */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-green-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <span className="material-symbols-outlined text-5xl mb-4">install_mobile</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3">Install in 3 Steps</h2>
          <p className="text-green-100 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
            Free. No app store. Works on any phone.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-lg mx-auto">
            {[
              { num: "1", title: "Tap Install", desc: 'Tap "Install Free App" above or the Share icon.' },
              { num: "2", title: "Confirm", desc: "Your browser will ask if you want to add to home screen." },
              { num: "3", title: "Open Anytime", desc: "SL News appears on your home screen. Even works offline." },
            ].map((s) => (
              <div key={s.num} className="flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                <span className="bg-white/20 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shrink-0 text-sm">{s.num}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5">{s.title}</p>
                  <p className="text-green-100 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start reading now</h2>
        <p className="text-sm text-gray-500 mb-6">No sign up required. No data wasted.</p>
        <Link
          href="/home"
          className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-3.5 rounded-full text-base hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95"
        >
          Open SL News →
        </Link>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 pb-8 text-center text-xs text-gray-600">
        <p>SL News — Community journalism for Sierra Leone.</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
    </div>
    </ReturningVisitorCheck>
  );
}
