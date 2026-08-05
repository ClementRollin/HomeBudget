"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/sheets";

type NavLink = {
  href: string;
  label: string;
  subItems?: Array<{ href: string; label: string }>;
};

const links: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sheets/new", label: "Nouvelle fiche de compte" },
  { href: "/sheets", label: "Historique" },
  { href: "/patrimoine", label: "Patrimoine" },
  {
    href: "/fiscalite",
    label: "Fiscalité",
    subItems: [
      { href: "/fiscalite/declaration", label: "Déclaration 2042" },
    ],
  },
  { href: "/family", label: "Famille" },
  { href: "/bilan", label: "Bilan CFO" },
  { href: "/settings", label: "Paramètres" },
];

const Sidebar = ({
  mobileOpen = false,
  onClose,
  hasCurrentSheet,
  currentPeriod,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
  hasCurrentSheet: boolean;
  currentPeriod: { month: number; year: number };
}) => {
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
    if (href === "/patrimoine") {
      return pathname === "/patrimoine";
    }
    if (href === "/fiscalite") {
      return pathname === "/fiscalite";
    }
    if (href === "/fiscalite/declaration") {
      return pathname === "/fiscalite/declaration";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Fiscalité est parent actif si on est dans /fiscalite ou sous-pages
  const isFiscaliteParentActive =
    pathname === "/fiscalite" || (pathname?.startsWith("/fiscalite/") ?? false);

  const sidebarContent = (
    <>
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-slate-400">Projet</p>
        <p className="text-2xl font-semibold text-white">HomeBudget</p>
        <p className="text-slate-400">Gestion mensuelle partagée</p>
      </div>
      <nav className="space-y-1 text-base font-medium">
        {links.map((link) => {
          const hasSubItems = link.subItems && link.subItems.length > 0;
          const parentActive =
            link.href === "/fiscalite"
              ? isFiscaliteParentActive
              : isActive(link.href);

          return (
            <div key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className={cn(
                  "block rounded-xl px-4 py-2 hover:bg-white/10",
                  parentActive ? "bg-white/10 text-white" : "text-slate-400",
                )}
              >
                {link.label}
              </Link>
              {/* Sous-items — affichés si le parent est actif */}
              {hasSubItems && parentActive && (
                <div className="ml-4 mt-1 space-y-1 border-l border-white/5 pl-3">
                  {link.subItems!.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onClose}
                      className={cn(
                        "block rounded-lg px-3 py-1.5 text-sm hover:bg-white/10",
                        isActive(sub.href) ? "text-white" : "text-slate-500",
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-dashed border-slate-700 p-4 text-xs">
        {hasCurrentSheet ? (
          <p className="text-slate-400">
            Fiche de ce mois prête. Consultez le dashboard pour les indicateurs clés.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="font-semibold text-amber-400">
              Fiche {MONTH_NAMES[currentPeriod.month - 1]} non créée
            </p>
            <Link
              href="/sheets/new"
              onClick={onClose}
              className="block text-accent underline-offset-2 hover:underline"
            >
              Créer la fiche →
            </Link>
          </div>
        )}
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
