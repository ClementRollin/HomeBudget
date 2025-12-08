
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sheets/new", label: "Nouvelle fiche de compte" },
  { href: "/sheets", label: "Historique" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/40 p-6 text-sm md:flex md:flex-col">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-slate-400">Projet</p>
        <p className="text-2xl font-semibold text-white">HomeBudget</p>
        <p className="text-slate-400">Gestion mensuelle partagée</p>
      </div>
      <nav className="space-y-2 text-base font-medium">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block rounded-xl px-4 py-2 hover:bg-white/10",
              pathname?.startsWith(link.href)
                ? "bg-white/10 text-white"
                : "text-slate-400",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-400">
        Conseil : créez une fiche chaque 1er du mois pour garder le cap sur vos finances.
      </div>
    </aside>
  );
};

export default Sidebar;
