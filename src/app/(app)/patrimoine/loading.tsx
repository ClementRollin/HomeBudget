const LoadingPatrimoine = () => (
  <div className="animate-pulse space-y-8">
    <div className="rounded-3xl border border-white/5 bg-black/30 p-8">
      <div className="h-8 w-64 rounded bg-white/10" />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6 space-y-3">
            <div className="h-3 w-20 rounded bg-white/10" />
            <div className="h-8 w-32 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LoadingPatrimoine;
