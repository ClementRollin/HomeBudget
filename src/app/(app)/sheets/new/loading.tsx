const LoadingNewSheet = () => (
  <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
    {/* Header */}
    <div className="space-y-2">
      <div className="h-7 w-56 rounded bg-white/10" />
      <div className="h-4 w-80 rounded bg-white/5" />
    </div>

    {/* Form sections */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-3xl border border-white/5 bg-black/30 p-6 space-y-4">
        <div className="h-5 w-32 rounded bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, j) => (
            <div key={j} className="rounded-2xl border border-white/5 bg-white/5 p-4 flex gap-4">
              <div className="h-8 flex-1 rounded bg-white/10" />
              <div className="h-8 w-32 rounded bg-white/10" />
              <div className="h-8 w-8 rounded bg-white/5" />
            </div>
          ))}
        </div>
        <div className="h-9 w-36 rounded-2xl bg-white/5 border border-dashed border-white/10" />
      </div>
    ))}

    {/* Submit */}
    <div className="h-11 w-44 rounded-2xl bg-white/10" />
  </div>
);

export default LoadingNewSheet;
