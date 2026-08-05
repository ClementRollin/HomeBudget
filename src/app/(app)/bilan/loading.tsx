const BilanLoading = () => (
  <div className="animate-pulse space-y-10">
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="mt-2 h-8 w-56 rounded bg-white/10" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="mt-3 h-7 w-28 rounded bg-white/10" />
            <div className="mt-1 h-3 w-16 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
      <div className="h-6 w-32 rounded bg-white/10" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  </div>
);

export default BilanLoading;
