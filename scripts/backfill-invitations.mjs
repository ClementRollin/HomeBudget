import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const invitePepper =
  process.env.INVITE_PEPPER ??
  process.env.AUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "invite-dev-pepper" : null);

if (!invitePepper) {
  console.error("INVITE_PEPPER manquant");
  process.exit(1);
}

const hashCode = (code) =>
  crypto.createHash("sha256").update(`${code}:${invitePepper}`).digest("hex");

async function main() {
  const families = await prisma.family.findMany({
    select: { id: true, inviteCode: true, invitations: { select: { id: true }, take: 1 } },
  });

  let created = 0;
  for (const family of families) {
    if (!family.inviteCode) continue;
    if (family.invitations.length > 0) continue;

    await prisma.invitation.create({
      data: {
        familyId: family.id,
        codeHash: hashCode(family.inviteCode),
      },
    });
    created += 1;
  }

  console.log(`Backfill termine : ${created} invitations creees.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
