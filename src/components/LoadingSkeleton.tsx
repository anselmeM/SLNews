export default function Loading() {
  return (
    <div className="flex flex-col gap-6 mt-8 animate-pulse">
      <div className="h-10 w-64 bg-surface-container rounded-full" />
      <div className="h-5 w-96 bg-surface-container rounded-full" />
      <div className="mt-4 h-[340px] md:h-[400px] bg-surface-container rounded-3xl" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-3xl p-3 flex gap-4">
          <div className="w-28 h-28 rounded-2xl bg-surface-container shrink-0" />
          <div className="flex-1 py-1 space-y-2">
            <div className="h-3 w-16 bg-surface-container rounded-full" />
            <div className="h-5 w-full bg-surface-container rounded" />
            <div className="h-4 w-32 bg-surface-container rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
