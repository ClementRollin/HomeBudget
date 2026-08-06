"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import MemberFiscalEditor from "@/components/family/MemberFiscalEditor";

type MemberWithUser = {
  id: string;
  displayName: string;
  slug: string;
  userId: string | null;
  familyRole: "OWNER" | "MEMBER" | null;
  birthDate: string | null;
  fiscalRole: string;
  isAlternateGuard: boolean;
  isDisabled: boolean;
  createdAt: string;
};

type Props = {
  members: MemberWithUser[];
  currentUserId: string;
  isOwner: boolean;
};

const MemberList = ({ members, currentUserId, isOwner }: Props) => {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (memberId: string) => {
    setDeletingId(memberId);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/family/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? "Erreur lors de la suppression.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {deleteError && (
        <p className="rounded-xl border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-400">
          {deleteError}
        </p>
      )}

      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isAdmin = member.familyRole === "OWNER";
        const isGhost = member.userId === null;
        const canDelete = isOwner && isGhost;
        const isEditing = editingId === member.id;

        return (
          <div
            key={member.id}
            className="rounded-2xl border border-white/5 bg-white/[0.04] p-5"
          >
            {/* En-tête du membre */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-white">{member.displayName}</p>
                {isCurrentUser && (
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    Vous
                  </span>
                )}
                {isAdmin && (
                  <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-xs font-medium text-violet-400">
                    Admin
                  </span>
                )}
                {isGhost && (
                  <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400">
                    Fantôme
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(isEditing ? null : member.id)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
                >
                  {isEditing ? "Fermer" : "Modifier rôle fiscal"}
                </button>

                {canDelete && (
                  <button
                    type="button"
                    disabled={deletingId === member.id}
                    onClick={() => handleDelete(member.id)}
                    className="rounded-lg border border-rose-400/20 px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-400/10 disabled:opacity-50"
                  >
                    {deletingId === member.id ? "Suppression…" : "Supprimer"}
                  </button>
                )}
              </div>
            </div>

            {/* Infos secondaires */}
            <p className="mt-1 text-xs text-slate-500">
              {member.fiscalRole.replace(/_/g, " ")}
              {member.birthDate ? ` · Né(e) le ${member.birthDate}` : ""}
            </p>

            {/* Éditeur fiscal inline */}
            {isEditing && (
              <div className="mt-4">
                <MemberFiscalEditor
                  member={member}
                  onSuccess={() => setEditingId(null)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberList;
