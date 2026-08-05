const FamilyLoading = () => {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Skeleton en-tête */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8">
        <div className="h-3 w-20 rounded-full bg-white/10" />
        <div className="mt-3 h-8 w-64 rounded-xl bg-white/10" />
        <div className="mt-2 h-4 w-80 rounded-lg bg-white/5" />
      </div>

      {/* Skeleton liste membres */}
      <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="mb-4 h-6 w-32 rounded-xl bg-white/10" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-white/[0.04] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 rounded-lg bg-white/10" />
                <div className="h-7 w-28 rounded-lg bg-white/5" />
              </div>
              <div className="mt-2 h-3 w-24 rounded-md bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton invitations */}
      <div className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <div className="mb-4 h-6 w-40 rounded-xl bg-white/10" />
        <div className="h-4 w-72 rounded-lg bg-white/5" />
        <div className="mt-6 h-10 w-44 rounded-full bg-white/10" />
      </div>
    </div>
  );
};

export default FamilyLoading;
