import { getCurrentSession } from "@/lib/auth";
import { decryptSheet, type SecureSheet } from "@/lib/sheets";

export const serializeSheet = (sheet: SecureSheet) => {
  const decrypted = decryptSheet(sheet);
  return {
    ...decrypted,
    createdAt: decrypted.createdAt.toISOString(),
  };
};

export const resolveFamilySession = async (): Promise<{ familyId: string; userId: string } | null> => {
  const session = await getCurrentSession();
  if (!session?.user) return null;
  return { familyId: session.user.familyId, userId: session.user.id };
};
