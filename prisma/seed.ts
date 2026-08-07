import { PrismaClient, ChargeCategory } from "@prisma/client";
import { hash } from "bcryptjs";
import { createCipheriv, createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

// Crypto dupliqué ici — seed tourne en standalone, pas d'alias @/lib
const getKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) throw new Error("ENCRYPTION_KEY manquant dans .env");
  const buf =
    secret.length === 44
      ? Buffer.from(secret, "base64")
      : createHash("sha256").update(secret).digest();
  if (buf.length !== 32) throw new Error("ENCRYPTION_KEY invalide (32 bytes requis)");
  return buf;
};

const enc = (value: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

const encNum = (value: number): string => enc(value.toFixed(2));

async function main() {
  console.log("🌱 Nettoyage de la base...");

  await prisma.assetSnapshot.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.sheet.deleteMany();
  await prisma.fiscalConfig.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.patrimonialGoal.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.family.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.appConfig.deleteMany();

  console.log("📋 Création des plans d'abonnement...");

  await prisma.plan.createMany({
    data: [
      {
        name: "FREE",
        label: "Gratuit",
        maxSheets: 3,
        maxAssets: 5,
        maxDebts: 3,
        maxGoals: 2,
        priceMonthly: 0,
        isActive: true,
      },
      {
        name: "PRO",
        label: "Pro",
        maxSheets: 2147483647,
        maxAssets: 2147483647,
        maxDebts: 2147483647,
        maxGoals: 2147483647,
        priceMonthly: 9.9,
        stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? null,
        stripePriceIdAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL ?? null,
        isActive: true,
      },
    ],
  });

  console.log("⚙️  Création de la configuration applicative...");

  await prisma.appConfig.createMany({
    data: [
      { key: "INVITE_EXPIRATION_DAYS", value: "7", description: "Durée de validité des invitations (jours)" },
    ],
  });

  console.log("👨‍👩‍👧 Création de la famille...");

  const family = await prisma.family.create({
    data: {
      name: "Famille Dupont",
      slug: "dupont",
      inviteCode: "SEED-DUPONT-2026",
    },
  });

  const passwordHash = await hash("test1234", 12);
  const user = await prisma.user.create({
    data: {
      name: "Clément Dupont",
      email: "test@homebudget.fr",
      password: passwordHash,
      familyId: family.id,
    },
  });

  const memberClement = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: user.id,
      displayName: "Clément",
      slug: "clement",
    },
  });

  const memberSophie = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      displayName: "Sophie",
      slug: "sophie",
    },
  });

  console.log("🏦 Création des dettes...");

  const debtImmo = await prisma.debt.create({
    data: {
      familyId: family.id,
      encryptedLabel: enc("Crédit immobilier résidence principale"),
      encryptedBalance: encNum(245_000),
      encryptedRate: encNum(1.85),
      encryptedMonthlyPayment: encNum(1_150),
      endDate: new Date("2044-03-01"),
    },
  });

  const debtAuto = await prisma.debt.create({
    data: {
      familyId: family.id,
      encryptedLabel: enc("Crédit automobile"),
      encryptedBalance: encNum(8_500),
      encryptedRate: encNum(4.5),
      encryptedMonthlyPayment: encNum(285),
      endDate: new Date("2028-06-01"),
    },
  });

  console.log("📈 Création des actifs...");

  await prisma.asset.createMany({
    data: [
      {
        familyId: family.id,
        type: "PEA",
        encryptedName: enc("PEA Fortuneo"),
        encryptedCurrentValue: encNum(18_500),
        encryptedTotalInvested: encNum(15_000),
        encryptedAnnualFee: encNum(0),
      },
      {
        familyId: family.id,
        type: "ASSURANCE_VIE",
        encryptedName: enc("AV Linxea Spirit 2"),
        encryptedCurrentValue: encNum(32_000),
        encryptedTotalInvested: encNum(28_000),
        encryptedAnnualFee: encNum(0.5),
      },
      {
        familyId: family.id,
        type: "PER",
        encryptedName: enc("PER Linxea"),
        encryptedCurrentValue: encNum(12_000),
        encryptedTotalInvested: encNum(11_000),
        encryptedAnnualFee: encNum(0.6),
      },
      {
        familyId: family.id,
        type: "LIVRET",
        encryptedName: enc("Livret A + LDDS"),
        encryptedCurrentValue: encNum(15_000),
        encryptedTotalInvested: encNum(15_000),
        encryptedAnnualFee: encNum(0),
      },
      {
        familyId: family.id,
        type: "IMMOBILIER",
        encryptedName: enc("Résidence principale Paris 11e"),
        encryptedCurrentValue: encNum(380_000),
        encryptedTotalInvested: encNum(320_000),
        encryptedAnnualFee: encNum(0),
      },
      {
        familyId: family.id,
        type: "CRYPTO",
        encryptedName: enc("Bitcoin / ETH"),
        encryptedCurrentValue: encNum(4_200),
        encryptedTotalInvested: encNum(3_000),
        encryptedAnnualFee: encNum(0),
      },
    ],
  });

  console.log("🎯 Création des objectifs...");

  await prisma.patrimonialGoal.createMany({
    data: [
      {
        familyId: family.id,
        encryptedLabel: enc("Retraite anticipée à 55 ans"),
        encryptedTarget: encNum(600_000),
        horizon: 2045,
      },
      {
        familyId: family.id,
        encryptedLabel: enc("Résidence secondaire Bretagne"),
        encryptedTarget: encNum(150_000),
        horizon: 2032,
      },
      {
        familyId: family.id,
        encryptedLabel: enc("Remboursement anticipé crédit immo"),
        encryptedTarget: encNum(245_000),
        horizon: 2038,
      },
    ],
  });

  console.log("🧾 Création de la configuration fiscale...");

  await prisma.fiscalConfig.create({
    data: {
      familyId: family.id,
      isCoupled: true,
      encryptedPerContribYTD: encNum(3_000),
    },
  });

  console.log("📋 Création des fiches mensuelles...");

  type MonthConfig = {
    month: number;
    year: number;
    edf: number;
    clementSalary: number;
    sophieSalary: number;
    exceptional: { label: string; amount: number; category: ChargeCategory }[];
  };

  const months: MonthConfig[] = [
    {
      month: 3, year: 2026,
      edf: 130, clementSalary: 3_600, sophieSalary: 2_900,
      exceptional: [],
    },
    {
      month: 4, year: 2026,
      edf: 110, clementSalary: 3_600, sophieSalary: 2_900,
      exceptional: [
        { label: "Taxe foncière", amount: 1_240, category: "EXCEPTIONNEL_COMMUN" },
      ],
    },
    {
      month: 5, year: 2026,
      edf: 85, clementSalary: 3_750, sophieSalary: 2_900,
      exceptional: [
        { label: "Vacances printemps (Barcelone)", amount: 1_100, category: "EXCEPTIONNEL_COMMUN" },
      ],
    },
    {
      month: 6, year: 2026,
      edf: 70, clementSalary: 3_600, sophieSalary: 2_900,
      exceptional: [],
    },
    {
      month: 7, year: 2026,
      edf: 65, clementSalary: 3_600, sophieSalary: 3_200,
      exceptional: [
        { label: "Vacances été (Bretagne)", amount: 1_850, category: "EXCEPTIONNEL_COMMUN" },
        { label: "Réparation voiture", amount: 420, category: "EXCEPTIONNEL_INDIVIDUEL" },
      ],
    },
    {
      month: 8, year: 2026,
      edf: 60, clementSalary: 3_600, sophieSalary: 2_900,
      exceptional: [
        { label: "Rentrée scolaire", amount: 310, category: "EXCEPTIONNEL_COMMUN" },
      ],
    },
  ];

  for (const m of months) {
    const sheet = await prisma.sheet.create({
      data: {
        year: m.year,
        month: m.month,
        familyId: family.id,
        ownerId: user.id,
      },
    });

    // Salaires
    await prisma.salary.createMany({
      data: [
        {
          sheetId: sheet.id,
          memberId: memberClement.id,
          encryptedLabel: enc("Salaire net Clément"),
          encryptedAmount: encNum(m.clementSalary),
        },
        {
          sheetId: sheet.id,
          memberId: memberSophie.id,
          encryptedLabel: enc("Salaire net Sophie"),
          encryptedAmount: encNum(m.sophieSalary),
        },
      ],
    });

    // Charges fixes communes
    const fixesCommunes: { label: string; amount: number; debtId?: string }[] = [
      { label: "Crédit immobilier", amount: 1_150, debtId: debtImmo.id },
      { label: "Crédit automobile", amount: 285, debtId: debtAuto.id },
      { label: "Assurance habitation MMA", amount: 85 },
      { label: "Assurance auto Clément", amount: 95 },
      { label: "Mutuelle Alan", amount: 110 },
      { label: "EDF / Gaz", amount: m.edf },
      { label: "Fibre Orange", amount: 45 },
      { label: "Forfaits mobiles (×2)", amount: 60 },
      { label: "Netflix + Spotify", amount: 28 },
    ];

    for (const c of fixesCommunes) {
      await prisma.charge.create({
        data: {
          sheetId: sheet.id,
          category: ChargeCategory.FIXE_COMMUN,
          encryptedLabel: enc(c.label),
          encryptedAmount: encNum(c.amount),
          debtId: c.debtId ?? null,
        },
      });
    }

    // Charges fixes individuelles
    const fixesIndividuelles: { label: string; amount: number; memberId: string }[] = [
      { label: "Navigo Clément", amount: 88, memberId: memberClement.id },
      { label: "Salle de sport Clément", amount: 50, memberId: memberClement.id },
      { label: "Déjeuners semaine Clément", amount: 120, memberId: memberClement.id },
      { label: "Navigo Sophie", amount: 88, memberId: memberSophie.id },
      { label: "Cours de yoga Sophie", amount: 45, memberId: memberSophie.id },
      { label: "Déjeuners semaine Sophie", amount: 95, memberId: memberSophie.id },
    ];

    for (const c of fixesIndividuelles) {
      await prisma.charge.create({
        data: {
          sheetId: sheet.id,
          category: ChargeCategory.FIXE_INDIVIDUEL,
          memberId: c.memberId,
          encryptedLabel: enc(c.label),
          encryptedAmount: encNum(c.amount),
        },
      });
    }

    // Charges exceptionnelles
    for (const c of m.exceptional) {
      await prisma.charge.create({
        data: {
          sheetId: sheet.id,
          category: c.category,
          encryptedLabel: enc(c.label),
          encryptedAmount: encNum(c.amount),
        },
      });
    }

    // Budgets
    await prisma.budget.createMany({
      data: [
        { sheetId: sheet.id, encryptedLabel: enc("Courses alimentaires"), encryptedAmount: encNum(700) },
        { sheetId: sheet.id, encryptedLabel: enc("Restaurants & sorties"), encryptedAmount: encNum(250) },
        { sheetId: sheet.id, encryptedLabel: enc("Loisirs & culture"), encryptedAmount: encNum(150) },
        { sheetId: sheet.id, encryptedLabel: enc("Épargne mensuelle"), encryptedAmount: encNum(500) },
      ],
    });
  }

  console.log("");
  console.log("✅ Seed terminé avec succès !");
  console.log("─────────────────────────────────");
  console.log("👤 Email    : test@homebudget.fr");
  console.log("🔑 Mot de passe : test1234");
  console.log("─────────────────────────────────");
  console.log("📊 Données créées :");
  console.log("   • 1 famille (Dupont) · 2 membres");
  console.log("   • 6 fiches (mars → août 2026)");
  console.log("   • 6 actifs (PEA, AV, PER, Livret, Immobilier, Crypto)");
  console.log("   • 2 dettes (immo + auto)");
  console.log("   • 3 objectifs patrimoniaux");
  console.log("   • Config fiscale (couple, 3 000 € PER YTD)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
