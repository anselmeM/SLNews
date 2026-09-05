import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | SLNews",
  description: "Learn about SLNews — Sierra Leone's community-driven news platform.",
};

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="text-center mb-12 py-8">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
          The Voice of the Nation
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Bridging the gap between hyper-local community journalism and global news. We are committed to truth, clarity, and the people of Sierra Leone.
        </p>
      </section>

      {/* Bento Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Editorial Standards (Spans full width on mobile, 8 cols on desktop) */}
        <section className="lg:col-span-8 bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 shadow-[0px_4px_12px_rgba(27,28,28,0.08)]">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">gavel</span>
            Editorial Standards
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard Item 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
              <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Accuracy First</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Every fact is checked against multiple verifiable sources before publication.</p>
              </div>
            </div>
            
            {/* Standard Item 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
              <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>balance</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Independence</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">We operate free from political or commercial influence, serving only the public interest.</p>
              </div>
            </div>
            
            {/* Standard Item 3 */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
              <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Hyper-local Focus</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Amplifying voices from every district, ensuring national news reflects local realities.</p>
              </div>
            </div>
            
            {/* Standard Item 4 */}
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-container transition-colors">
              <div className="bg-primary-container text-on-primary-container p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined block" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-1">Data Accessibility</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">Optimized delivery for all regions, respecting limited bandwidth without sacrificing quality.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Process (Spans full width on mobile, 4 cols on desktop) */}
        <section className="lg:col-span-4 bg-primary text-on-primary rounded-xl p-6 shadow-[0px_4px_12px_rgba(27,28,28,0.08)] relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined block" style={{ fontSize: '200px', fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-headline-sm text-headline-sm mb-4">The Verification Process</h2>
            <ul className="space-y-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-inverse-primary/30 z-0"></div>
              
              <li className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center font-bold text-sm shrink-0 border-2 border-primary">1</div>
                <span className="font-label-md text-label-md">Drafting by Local Reporters</span>
              </li>
              <li className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center font-bold text-sm shrink-0 border-2 border-primary">2</div>
                <span className="font-label-md text-label-md">Rigorous Fact-Check</span>
              </li>
              <li className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-surface text-primary flex items-center justify-center font-bold text-sm shrink-0 border-2 border-primary">3</div>
                <span className="font-label-md text-label-md">Regional Desk Review</span>
              </li>
              <li className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-full bg-inverse-primary text-on-primary-fixed flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="material-symbols-outlined block text-[18px]">publish</span>
                </div>
                <span className="font-label-md text-label-md font-bold text-inverse-primary">Published Live</span>
              </li>
            </ul>
          </div>
        </section>

        {/* AI & Transparency */}
        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0px_4px_12px_rgba(27,28,28,0.08)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary">memory</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">AI &amp; Transparency</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            We leverage artificial intelligence to enhance, not replace, our journalism. AI assists in summarizing lengthy documents and categorizing news feeds for faster delivery.
          </p>
          <div className="bg-secondary-container/50 p-3 rounded-lg border-l-4 border-secondary">
            <p className="font-label-sm text-label-sm text-on-secondary-container">
              <strong>Human Oversight:</strong> Every AI-assisted summary is reviewed and approved by a senior human editor before publication to ensure nuance and accuracy are maintained.
            </p>
          </div>
        </section>

        {/* Fact-Checking Policy & Corrections */}
        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-[0px_4px_12px_rgba(27,28,28,0.08)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-error">report</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Corrections Policy</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            We acknowledge mistakes quickly and transparently. If you spot an error or potential misinformation, we encourage you to report it.
          </p>
          <a href="mailto:corrections@slnews.local" className="inline-flex bg-surface border border-outline text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-colors items-center gap-2 shadow-[0px_8px_16px_rgba(27,28,28,0.12)] active:scale-95">
            <span className="material-symbols-outlined block text-sm">flag</span>
            Report an Error
          </a>
        </section>

      </div>

      {/* Platform Features */}
      <section className="mt-12 pt-8 border-t border-outline-variant/30">
        <h2 className="text-2xl font-bold text-center text-on-surface mb-2">Platform Features</h2>
        <p className="text-sm text-on-surface-variant text-center mb-8 max-w-xl mx-auto">
          Designed specifically for Sierra Leone&apos;s mobile ecosystem: high speed, ultra-low bandwidth consumption, and offline capability.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "newspaper", title: "National News", desc: "Stories aggregated and verified from leading Sierra Leone publications in one clean feed." },
            { icon: "trending_up", title: "Live Market Prices", desc: "Rice, fuel, cement, and palm oil prices updated across Freetown, Bo, Makeni, and Kenema." },
            { icon: "campaign", title: "Community Notices", desc: "Government announcements, civic alerts, and community notices accessible to everyone." },
            { icon: "search", title: "Instant Search", desc: "Find any article or community notice instantly with category and date filters." },
            { icon: "download", title: "No App Store Needed", desc: "Install directly from your mobile browser as a lightweight Progressive Web App." },
            { icon: "cloud_off", title: "Works Offline", desc: "Saved bookmarks and market data cached locally for reading without internet." },
          ].map((f) => (
            <div key={f.title} className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/30 shadow-xs flex gap-3.5 items-start">
              <span className="material-symbols-outlined text-2xl text-primary bg-primary/10 p-2 rounded-lg shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Install Guide */}
      <section className="mt-12 mb-8 bg-primary rounded-2xl p-8 text-center text-on-primary shadow-sm">
        <span className="material-symbols-outlined text-4xl mb-2 block">install_mobile</span>
        <h2 className="text-2xl font-black mb-2">Install SLNews on Any Phone</h2>
        <p className="text-primary-container text-sm max-w-md mx-auto mb-6">
          Free, instant, and takes almost zero storage. No Google Play or Apple App Store account needed.
        </p>
        <div className="grid md:grid-cols-3 gap-4 text-left max-w-xl mx-auto">
          {[
            { num: "1", title: "Tap Install / Share", desc: 'Look for "Install App" in your browser menu or bottom banner.' },
            { num: "2", title: "Confirm", desc: 'Tap "Add to Home screen" to save SLNews directly to your phone.' },
            { num: "3", title: "Launch Anytime", desc: "Open SLNews like any native app. Reads articles even when data runs out." },
          ].map((s) => (
            <div key={s.num} className="flex md:flex-col items-center md:text-center gap-3 bg-white/10 p-4 rounded-xl">
              <span className="bg-white text-primary font-black rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm">{s.num}</span>
              <div>
                <p className="font-bold text-sm mb-0.5 text-white">{s.title}</p>
                <p className="text-white/80 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
