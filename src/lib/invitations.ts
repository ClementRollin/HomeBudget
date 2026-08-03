import crypto from "node:crypto";

const getInvitePepper = () => {
  const pepper = process.env.INVITE_PEPPER ?? process.env.AUTH_SECRET;
  if (!pepper) {
    if (process.env.NODE_ENV !== "production") {
      return "invite-dev-pepper";
    }
    throw new Error("INVITE_PEPPER manquant dans l'environnement.");
  }
  return pepper;
};

// [Important 1] Appel lazy dans hashInvitationCode au lieu d'évaluation à l'import.
// Garantit que les env vars sont disponibles au moment de l'appel,
// quel que soit le contexte Next.js (Edge, Server Components, etc.).
export const hashInvitationCode = (code: string) => {
  const pepper = getInvitePepper();
  return crypto.createHash("sha256").update(`${code}:${pepper}`).digest("hex");
};

export const defaultInvitationExpirationDays = Number(
  process.env.INVITE_EXPIRATION_DAYS ?? 7,
);

export const getInvitationExpirationDate = (days = defaultInvitationExpirationDays) => {
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires;
};
