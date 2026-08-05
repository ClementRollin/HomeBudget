import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE : suppression d'un document fiscal (Blob + DB)
export const DELETE = async (
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

  // Vérifier que le document appartient à la famille de l'utilisateur
  if (document.familyId !== session.user.familyId) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Supprimer depuis Vercel Blob
  await del(document.blobKey, {
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  // Supprimer de la DB
  await prisma.taxDocument.delete({ where: { id } });

  return NextResponse.json({ success: true });
};
