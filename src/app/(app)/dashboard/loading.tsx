const LoadingDashboard = () => (
  <div className="animate-pulse space-y-10">
    {/* Section vue d'ensemble */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="mt-2 h-8 w-48 rounded bg-white/10" />
          <div className="mt-2 h-4 w-72 rounded bg-white/5" />
        </div>
        <div className="h-9 w-44 rounded-full bg-white/10" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-8 w-32 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>

    {/* Section mois en cours */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="mt-2 h-7 w-56 rounded bg-white/10" />
          <div className="mt-2 h-4 w-80 rounded bg-white/5" />
        </div>
        <div className="h-9 w-32 rounded-2xl bg-white/10" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-8 w-28 rounded bg-white/10" />
            <div className="h-3 w-16 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>

    {/* Section historique */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="h-4 w-24 rounded bg-white/5" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="space-y-2">
              <div className="h-5 w-28 rounded bg-white/10" />
              <div className="h-3 w-44 rounded bg-white/5" />
            </div>
            <div className="h-6 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingDashboard;
