import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invitationRepository } from "@/lib/repositories/invitations";
import MemberList from "@/components/family/MemberList";
import InvitationManager from "@/components/family/InvitationManager";

const FamilyPage = async () => {
  const session = await getCurrentSession();
  if (!session?.user?.familyId) redirect("/");

  const isOwner = session.user.familyRole === "OWNER";
  const familyId = session.user.familyId;

  const [members, invitations] = await Promise.all([
    prisma.familyMember.findMany({
      where: { familyId },
      include: { user: { select: { id: true, familyRole: true } } },
      orderBy: { createdAt: "asc" },
    }),
    isOwner ? invitationRepository.listActiveForFamily(familyId) : Promise.resolve([]),
  ]);

  // Sérialiser pour le passage aux Client Components
  const serializedMembers = members.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    slug: m.slug,
    userId: m.userId,
    familyRole: (m.user?.familyRole ?? null) as "OWNER" | "MEMBER" | null,
    birthDate: m.birthDate ? m.birthDate.toISOString().slice(0, 10) : null,
    fiscalRole: m.fiscalRole,
    isAlternateGuard: m.isAlternateGuard,
    isDisabled: m.isDisabled,
    createdAt: m.createdAt.toISOString(),
  }));

  const serializedInvitations = invitations.map((inv) => ({
    id: inv.id,
    familyId: inv.familyId,
    createdAt: inv.createdAt.toISOString(),
    expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : null,
    usedAt: inv.usedAt ? inv.usedAt.toISOString() : null,
  }));

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900/60 p-8">
        <p className="text-xs uppercase tracking-[0.35rem] text-slate-500">Foyer</p>
        <h1 className="text-3xl font-semibold text-white">Gestion du foyer</h1>
        <p className="mt-1 text-sm text-slate-400">
          Membres de la famille{" "}
          <span className="font-medium text-white">{session.user.familyName}</span>,
          rôles fiscaux et invitations.
        </p>
      </section>

      {/* Liste des membres */}
      <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
        <h2 className="mb-1 text-xl font-semibold text-white">Membres</h2>
        <p className="mb-6 text-sm text-slate-400">
          {members.length} membre{members.length !== 1 ? "s" : ""} dans le foyer.
        </p>
        <MemberList
          members={serializedMembers}
          currentUserId={session.user.id}
          isOwner={isOwner}
        />
      </section>

      {/* Gestion des invitations — OWNER uniquement */}
      {isOwner && (
        <section className="rounded-3xl border border-white/5 bg-black/30 p-6">
          <h2 className="mb-1 text-xl font-semibold text-white">Invitations</h2>
          <p className="mb-6 text-sm text-slate-400">
            Générez un code d&apos;invitation pour permettre à un nouveau membre de rejoindre le foyer.
          </p>
          <InvitationManager
            invitations={serializedInvitations}
            isOwner={isOwner}
          />
        </section>
      )}
    </div>
  );
};

export default FamilyPage;
