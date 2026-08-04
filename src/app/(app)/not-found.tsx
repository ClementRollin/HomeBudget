import Link from "next/link";

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
    <p className="text-6xl font-bold text-slate-500">404</p>
    <h1 className="text-2xl font-semibold text-white">Page introuvable</h1>
    <p className="text-slate-400">Cette page n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
    <Link
      href="/dashboard"
      className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-widest text-slate-900"
    >
      Retour au dashboard
    </Link>
  </div>
);

export default NotFound;
