"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sheets/new", label: "Nouvelle fiche de compte" },
  { href: "/sheets", label: "Historique" },
  { href: "/account", label: "Mon compte" },
];

const Sidebar = ({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) {
      return false;
    }
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/sheets/new") {
      return pathname === "/sheets/new";
    }
    if (href === "/sheets") {
      return pathname === "/sheets" || (pathname.startsWith("/sheets/") && !pathname.startsWith("/sheets/new"));
    }
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <>
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
            onClick={onClose}
            className={cn(
              "block rounded-xl px-4 py-2 hover:bg-white/10",
              isActive(link.href) ? "bg-white/10 text-white" : "text-slate-400",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-dashed border-slate-700 p-4 text-xs text-slate-400">
        Conseil : créez une fiche chaque 1er du mois pour garder le cap sur vos finances.
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-muted/40 p-6 text-sm md:flex md:flex-col">
        {sidebarContent}
      </aside>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-label="Fermer le menu mobile"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border bg-muted/90 p-6 text-sm shadow-2xl transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-base font-semibold text-white">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1 text-white transition hover:bg-white/10"
            aria-label="Fermer le menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
