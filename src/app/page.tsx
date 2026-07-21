import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Sierra Leone&apos;s Community News
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-4">
          SL News
        </h1>

        <p className="text-lg md:text-xl text-gray-600 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
          Local stories, national news, and community voices — all in one place. Built for Sierra Leone, by Sierra Leoneans.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-3.5 rounded-full text-base hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            Start Reading
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-full text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
          >
            Explore News
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: "map", title: "Local Coverage", desc: "Province-by-province news from across the country." },
            { icon: "public", title: "International", desc: "World news curated for Sierra Leone readers." },
            { icon: "download", title: "Install App", desc: "Add to your home screen for a native-like experience." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-3xl text-green-700 mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Install Info */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-green-700 rounded-3xl p-8 md:p-12 text-center text-white">
          <span className="material-symbols-outlined text-5xl mb-4">install_mobile</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3">Get the App</h2>
          <p className="text-green-100 text-sm md:text-base max-w-md mx-auto mb-6 leading-relaxed">
            Install SLNews on your phone or desktop for offline reading and push notifications.
          </p>
          <ol className="text-left text-sm text-green-100 space-y-2 max-w-sm mx-auto">
            <li className="flex items-start gap-3">
              <span className="bg-white/20 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-xs">1</span>
              <span>Open this page in Chrome or Safari</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-white/20 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-xs">2</span>
              <span>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-white/20 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-xs">3</span>
              <span>Launch SLNews like any other app</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-4 pb-8 text-center text-xs text-gray-400">
        <p>SL News &mdash; Community journalism for Sierra Leone.</p>
      </footer>
    </div>
  );
}
