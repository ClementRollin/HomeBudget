const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className ?? ""}`} />
);

export default function DeclarationLoading() {
  return (
    <div className="space-y-10">
      {/* En-tête skeleton */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="mt-3 h-8 w-64" />
        <SkeletonBlock className="mt-2 h-4 w-96" />
      </section>

      {/* Upload zone skeleton */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <SkeletonBlock className="mb-4 h-6 w-48" />
        <SkeletonBlock className="h-40 w-full" />
      </section>

      {/* Documents skeleton */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <SkeletonBlock className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </section>

      {/* Table déclaration skeleton */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <SkeletonBlock className="mb-4 h-6 w-56" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBlock key={i} className="h-12 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
