const LoadingAnalytics = () => (
  <div className="animate-pulse space-y-6">
    {/* KPI row */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/5 bg-black/30 p-6 space-y-3">
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="h-8 w-32 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/5" />
        </div>
      ))}
    </div>

    {/* Chart */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-4">
      <div className="h-5 w-40 rounded bg-white/10" />
      <div className="h-64 rounded-2xl bg-white/5" />
    </div>

    {/* Breakdown */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-4">
      <div className="h-5 w-48 rounded bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="h-4 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingAnalytics;
