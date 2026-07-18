"use client";

export default function DataSaverSection({ dataSaver, setDataSaver }: { dataSaver: boolean; setDataSaver: (v: boolean) => void }) {
  return (
    <section className="relative bg-primary rounded-2xl p-6 shadow-sm overflow-hidden">
      <div className="absolute right-0 top-0 w-48 h-48 opacity-[0.06] pointer-events-none">
        <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
      </div>
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>data_saver_on</span>
            Data Saver Mode
          </h3>
          <p className="text-sm text-white/80 max-w-md">Optimize for slow networks — images will be hidden and typography adjusted for maximum readability.</p>
        </div>
        <button onClick={() => setDataSaver(!dataSaver)} role="switch" aria-checked={dataSaver} aria-label={`Data Saver: ${dataSaver ? "on" : "off"}`} className={`relative w-14 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${dataSaver ? "bg-white/30" : "bg-white/20"}`}>
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${dataSaver ? "translate-x-7" : "translate-x-0.5"}`} />
        </button>
      </div>
    </section>
  );
}
