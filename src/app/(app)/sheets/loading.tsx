const LoadingSheets = () => (
  <div className="animate-pulse space-y-8">
    {/* En-tête */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="h-3 w-20 rounded bg-white/10" />
        <div className="mt-2 h-8 w-64 rounded bg-white/10" />
        <div className="mt-2 h-4 w-96 rounded bg-white/5" />
      </div>
      <div className="h-10 w-44 rounded-2xl bg-white/10" />
    </div>

    {/* Filtre par années */}
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-7 w-16 rounded-full bg-white/10" />
      ))}
    </div>

    {/* Tableau */}
    <div className="overflow-x-auto rounded-3xl border border-white/5 bg-black/30">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr>
            {["Mois", "Salaires", "Charges", "Budgets", "Solde", ""].map((col) => (
              <th key={col} className="px-6 py-4">
                <div className="h-3 w-16 rounded bg-white/10" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-t border-white/5">
              <td className="px-6 py-4">
                <div className="h-5 w-28 rounded bg-white/10" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-white/5" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-white/5" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-white/5" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-20 rounded bg-white/10" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 rounded bg-white/5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoadingSheets;
