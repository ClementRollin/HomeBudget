"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SignOutButton from "@/components/auth/SignOutButton";
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

const renderSidebarContent = () => (
  <div className="flex h-full flex-col">
    <div className="mb-6 text-sm">
      <Image
        src="/logo.png"
        alt="HomeBudget"
        width={72}
        height={72}
        className="h-18 w-18 rounded-2xl bg-black/30"
        priority
      />
      <p className="mt-3 text-xs text-slate-400">Gestion mensuelle partagee</p>
    </div>
    <nav className="flex-1 space-y-1 text-sm font-medium">
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
    <div className="space-y-2 pt-4 text-xs">
      <div className="rounded-xl border border-dashed border-slate-700 p-3 text-slate-400">
        Conseil : creez une fiche chaque 1er du mois pour rester aligne.
      </div>
      <SignOutButton />
    </div>
  </div>
);

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 border-r border-border bg-muted/40 p-6 text-sm md:flex">
        {renderSidebarContent()}
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
          "fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col border-r border-border bg-muted/90 p-6 text-sm shadow-2xl transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
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
        {renderSidebarContent()}
      </aside>
    </>
  );
};

export default Sidebar;
