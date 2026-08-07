import type { ReactElement } from "react";

const FROM = "HomeBudget <noreply@[VOTRE-DOMAINE]>";

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY non configuré — email non envoyé:", subject);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM, to, subject, react });
  } catch (err) {
    console.error("[email] Échec d'envoi:", err);
  }
}
