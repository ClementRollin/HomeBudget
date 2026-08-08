import Link from "next/link";

import { prisma } from "@/lib/prisma";

const LIMIT = 20;

const STATUS_LABEL: Record<string, string> = {
  FREE: "Gratuit",
  PRO: "Pro",
  PRO_CANCELED: "Pro (annulé)",
  PRO_PAST_DUE: "Pro (impayé)",
};

const STATUS_CLASS: Record<string, string> = {
  FREE: "bg-slate-700 text-slate-300",
  PRO: "bg-amber-600 text-amber-100",
  PRO_CANCELED: "bg-orange-700 text-orange-100",
  PRO_PAST_DUE: "bg-red-700 text-red-100",
};

export default async function AdminFamiliesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page: pageParam = "1" } = await searchParams;
  const page = Math.max(1, Number(pageParam));
  const skip = (page - 1) * LIMIT;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { users: { some: { email: { contains: q, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [families, total] = await Promise.all([
    prisma.family.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: { select: { users: true } },
        users: { where: { familyRole: "OWNER" }, select: { email: true }, take: 1 },
      },
    }),
    prisma.family.count({ where }),
  ]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Familles ({total})</h1>
      </div>

      <form className="mb-6" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher par nom de famille ou e-mail..."
          className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
        />
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Famille</th>
              <th className="px-4 py-3 text-left font-medium">Owner</th>
              <th className="px-4 py-3 text-left font-medium">Membres</th>
              <th className="px-4 py-3 text-left font-medium">Plan</th>
              <th className="px-4 py-3 text-left font-medium">Créée le</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {families.map((f) => (
              <tr key={f.id} className="bg-slate-900 hover:bg-slate-800/60">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3 text-slate-400">{f.users[0]?.email ?? "—"}</td>
                <td className="px-4 py-3 text-center text-slate-400">{f._count.users}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[f.subscriptionStatus] ?? STATUS_CLASS.FREE}`}
                  >
                    {STATUS_LABEL[f.subscriptionStatus] ?? f.subscriptionStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {f.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/families/${f.id}`} className="text-amber-400 hover:text-amber-300">
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {families.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucune famille trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Page {page} / {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/families?${new URLSearchParams({ q, page: String(page - 1) })}`}
                className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-500"
              >
                Précédent
              </Link>
            )}
            {page < pages && (
              <Link
                href={`/admin/families?${new URLSearchParams({ q, page: String(page + 1) })}`}
                className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-500"
              >
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
