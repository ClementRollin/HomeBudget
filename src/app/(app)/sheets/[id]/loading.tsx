const LoadingSheetDetail = () => (
  <div className="animate-pulse space-y-10">
    {/* Lien retour */}
    <div className="h-4 w-32 rounded bg-white/10" />

    {/* Section header de la fiche */}
    <div className="rounded-3xl border border-white/5 bg-black/40 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="mt-2 h-8 w-48 rounded bg-white/10" />
          <div className="mt-2 h-4 w-64 rounded bg-white/5" />
        </div>
        <div className="text-right">
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="mt-2 h-8 w-32 rounded bg-white/10" />
          <div className="mt-1 h-3 w-28 rounded bg-white/5" />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-7 w-28 rounded bg-white/10" />
            <div className="h-3 w-20 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>

    {/* Section répartition */}
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="space-y-4 rounded-3xl border border-white/5 bg-black/30 p-6 xl:col-span-2">
        <div className="h-6 w-48 rounded bg-white/10" />
        <div className="h-4 w-72 rounded bg-white/5" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.04] p-5">
              <div className="h-3 w-12 rounded bg-white/10" />
              <div className="h-6 w-24 rounded bg-white/10" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="h-3 w-28 rounded bg-white/5" />
                    <div className="h-3 w-16 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4 rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="h-6 w-40 rounded bg-white/10" />
        <div className="h-4 w-32 rounded bg-white/5" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.04] px-4 py-3">
            <div className="h-3 w-12 rounded bg-white/10" />
            <div className="mt-1 h-5 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>

    {/* Section charges */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
      <div className="mb-6 h-6 w-40 rounded bg-white/10" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="mt-2 h-7 w-20 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>

    {/* Section formulaire */}
    <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
      <div className="h-6 w-48 rounded bg-white/10" />
      <div className="mt-2 h-4 w-80 rounded bg-white/5" />
      <div className="mt-6 h-48 w-full rounded-3xl bg-white/5" />
    </div>
  </div>
);

export default LoadingSheetDetail;
