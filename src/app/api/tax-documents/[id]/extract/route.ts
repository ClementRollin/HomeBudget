import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { encryptValue } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { extractTaxCases } from "@/lib/tax-extraction";

// POST : déclenche l'extraction IA des cases fiscales depuis le document stocké dans Vercel Blob
export const POST = async (
  _req: NextRequest,
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

  // Passer le statut en PROCESSING
  await prisma.taxDocument.update({
    where: { id },
    data: { extractionStatus: "PROCESSING" },
  });

  try {
    // Télécharger le fichier depuis Vercel Blob
    const response = await fetch(document.blobUrl);
    if (!response.ok) {
      throw new Error(`Impossible de télécharger le fichier : ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Déduire le MIME type depuis l'URL ou le blobKey
    const mimeType = inferMimeType(document.blobKey);

    // Extraction via Gemini
    const { cases, confidence } = await extractTaxCases(fileBuffer, mimeType);

    // Chiffrer les cases extraites
    const encryptedExtractedCases = encryptValue(JSON.stringify(cases));

    // Mettre à jour le document avec les résultats
    await prisma.taxDocument.update({
      where: { id },
      data: {
        extractionStatus: "DONE",
        encryptedExtractedCases,
        extractionConfidence: confidence,
      },
    });

    return NextResponse.json({ success: true, confidence, caseCount: Object.keys(cases).length });
  } catch (error) {
    // En cas d'erreur, passer le statut en FAILED
    await prisma.taxDocument.update({
      where: { id },
      data: { extractionStatus: "FAILED" },
    });

    console.error("[extract] Erreur extraction IA :", error);
    return NextResponse.json({ error: "Extraction échouée" }, { status: 500 });
  }
};

const inferMimeType = (blobKey: string): "application/pdf" | "image/jpeg" | "image/png" => {
  const lower = blobKey.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  // Par défaut PDF
  return "application/pdf";
};
