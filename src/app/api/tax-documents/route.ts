import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { decryptValue } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

// GET : liste les TaxDocuments de la famille (cases décryptées si disponibles)
export const GET = async (req: NextRequest) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const taxYear = searchParams.get("taxYear");

  const documents = await prisma.taxDocument.findMany({
    where: {
      familyId: session.user.familyId,
      ...(taxYear ? { taxYear: Number(taxYear) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const result = documents.map((doc) => ({
    id: doc.id,
    taxYear: doc.taxYear,
    documentType: doc.documentType,
    blobUrl: doc.blobUrl,
    extractionStatus: doc.extractionStatus,
    extractionConfidence: doc.extractionConfidence,
    validatedAt: doc.validatedAt,
    createdAt: doc.createdAt,
    cases:
      doc.encryptedExtractedCases
        ? (() => {
            try {
              return JSON.parse(decryptValue(doc.encryptedExtractedCases)) as Record<string, number>;
            } catch {
              return null;
            }
          })()
        : null,
  }));

  return NextResponse.json(result);
};

// POST : upload d'un document fiscal et déclenchement de l'extraction IA
export const POST = async (req: NextRequest) => {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const taxYearRaw = formData.get("taxYear");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  if (!taxYearRaw || typeof taxYearRaw !== "string") {
    return NextResponse.json({ error: "taxYear manquant" }, { status: 400 });
  }

  const taxYear = Number(taxYearRaw);
  if (!Number.isInteger(taxYear) || taxYear < 2020 || taxYear > 2100) {
    return NextResponse.json({ error: "taxYear invalide" }, { status: 400 });
  }

  const mimeType = file.type as AllowedMimeType;
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    return NextResponse.json(
      { error: "Type de fichier non supporté. Utilisez PDF, JPEG ou PNG." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 10 Mo)." },
      { status: 400 }
    );
  }

  // Upload vers Vercel Blob
  const blob = await put(file.name, buffer, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: mimeType,
  });

  // Création du document en DB
  const document = await prisma.taxDocument.create({
    data: {
      familyId: session.user.familyId,
      taxYear,
      documentType: "DECLARATION_2042",
      blobUrl: blob.url,
      blobKey: blob.pathname,
      extractionStatus: "PENDING",
      encryptedExtractedCases: "",
    },
  });

  // Déclencher l'extraction en arrière-plan (fire-and-forget)
  const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host")}`;
  fetch(`${baseUrl}/api/tax-documents/${document.id}/extract`, {
    method: "POST",
    headers: {
      // On passe le cookie de session pour que la route d'extraction puisse authentifier
      cookie: req.headers.get("cookie") ?? "",
    },
  }).catch(() => {
    // Erreur silencieuse — le statut FAILED sera mis à jour par la route d'extraction
  });

  return NextResponse.json({ documentId: document.id, status: "PENDING" }, { status: 201 });
};
