const FiscaliteLoading = () => (
  <div className="animate-pulse space-y-10">
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8">
      <div className="h-4 w-32 rounded bg-white/10" />
      <div className="mt-2 h-8 w-64 rounded bg-white/10" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.04] p-5">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="mt-3 h-7 w-28 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6">
      <div className="h-6 w-40 rounded bg-white/10" />
      <div className="mt-4 h-2 w-full rounded-full bg-white/10" />
    </div>
  </div>
);

export default FiscaliteLoading;
