import type { Metadata } from "next";
import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";
import { fetchLocalNews } from "@/lib/news-service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Local News | SLNews",
  description: "Province-level news and updates from communities across Sierra Leone.",
};

export default async function LocalNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ province?: string; district?: string }>;
}) {
  const params = await searchParams;
  const province = params.province;
  const district = params.district;
  const articles = await fetchLocalNews(province || undefined, district || undefined);

  const provinces = ["Western Area", "Southern", "Eastern", "Northern", "North-West"];
  const districtMap: Record<string, string[]> = {
    "Western Area": ["Freetown", "Western Rural"],
    "Southern": ["Bo", "Bonthe", "Moyamba", "Pujehun"],
    "Eastern": ["Kenema", "Kono", "Kailahun"],
    "Northern": ["Makeni", "Kambia", "Port Loko"],
    "North-West": ["Kambia", "Port Loko", "Tonkolili"],
  };
  const districts = province ? districtMap[province] || [] : [];
  const activeProvince = province || "All";

  return (
    <div className="w-full pt-4 max-w-3xl mx-auto">
      {/* Provinces Scroll */}
      <section className="mb-8 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">Provinces</h2>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4 md:grid md:grid-cols-5 md:gap-4 md:mx-0 md:px-0 md:pb-0 md:overflow-visible w-full">
          <Link href="/local" className={`shrink-0 rounded-3xl p-4 flex flex-col items-start gap-1.5 min-w-[140px] hover:shadow-sm transition-all cursor-pointer ${!province ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}>
            <span className={`font-semibold text-sm ${!province ? '' : 'text-on-surface'}`}>All Provinces</span>
            <span className={`text-xs font-medium ${!province ? 'text-green-100' : 'text-gray-500'}`}>All districts</span>
          </Link>
          {provinces.map((p) => {
            const count = districtMap[p]?.length || 0;
            const isActive = province === p;
            return (
              <Link
                key={p}
                href={`/local?province=${encodeURIComponent(p)}`}
                className={`shrink-0 rounded-3xl p-4 flex flex-col items-start gap-1.5 min-w-[140px] hover:shadow-sm transition-all cursor-pointer ${isActive ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-100 hover:bg-gray-50'}`}
              >
                <span className={`font-semibold text-sm ${isActive ? '' : 'text-on-surface'}`}>{p}</span>
                <span className={`text-xs font-medium ${isActive ? 'text-green-100' : 'text-gray-500'}`}>{count} Districts</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* District Selection */}
      {districts.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Districts in {activeProvince}</h3>
          <div className="flex flex-wrap gap-2">
            <Link href={`/local${province ? `?province=${encodeURIComponent(province)}` : ''}`} className="px-4 py-2 rounded-full bg-primary text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm">All {activeProvince}</Link>
            {districts.map((d) => (
              <Link key={d} href={`/local?province=${encodeURIComponent(province!)}&district=${encodeURIComponent(d)}`} className="px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer">{d}</Link>
            ))}
          </div>
        </section>
      )}

      {/* Regional Feed */}
      <section>
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tighter leading-none">
          {province ? `${province} Province News` : "Local News"}
        </h2>
        </div>
        <NewsFeed articles={articles} emptyMessage={`No regional articles found${province ? ` for ${province}` : ''}.`} />
      </section>
    </div>
  );
}
