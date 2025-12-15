import type { Session } from "next-auth";

import { getCurrentSession } from "@/lib/auth";

export type FamilySession = {
  session: Session;
  userId: string;
  familyId: string;
  familyName: string;
};

export const requireFamilySession = async (): Promise<FamilySession> => {
  const session = await getCurrentSession();
  if (!session?.user?.id || !session.user.familyId) {
    throw new Error("Unauthenticated");
  }

  return {
    session,
    userId: session.user.id,
    familyId: session.user.familyId,
    familyName: session.user.familyName ?? "",
  };
};
