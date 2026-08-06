import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentSession } from "@/lib/auth";
import { encryptValue } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const validateBodySchema = z.object({
  cases: z.record(z.string(), z.number()),
});

// PATCH : valide manuellement les cases extraites d'un document fiscal
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.taxDocument.findUnique({ where: { id } });

  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  if (document.familyId !== session.user.familyId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body: unknown = await req.json();
  const parsed = validateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const encryptedExtractedCases = encryptValue(JSON.stringify(parsed.data.cases));

  await prisma.taxDocument.update({
    where: { id },
    data: {
      encryptedExtractedCases,
      extractionStatus: "DONE",
      validatedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
};
