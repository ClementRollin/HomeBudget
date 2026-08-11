import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const extractedCasesSchema = z.record(z.string(), z.number());

export const TAX_CASES_TO_EXTRACT = [
  "1AJ", "1BJ", "1AS", "1BS",
  "6NS", "6NT", "6NU",
  "2DC", "2CH",
  "3VG",
  "4BA",
] as const;

export type TaxCaseCode = (typeof TAX_CASES_TO_EXTRACT)[number];

function getGenai() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/**
 * Extrait les cases fiscales d'un document PDF ou image via Gemini Flash.
 * Retourne les cases trouvées et un score de confiance (0–1).
 */
export const extractTaxCases = async (
  fileBuffer: Buffer,
  mimeType: "application/pdf" | "image/jpeg" | "image/png"
): Promise<{ cases: Record<string, number>; confidence: number }> => {
  const model = getGenai().getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: fileBuffer.toString("base64"),
      },
    },
    `Tu es un expert fiscaliste français. Analyse ce document fiscal (déclaration 2042 ou avis d'imposition).
Extrait les valeurs numériques des cases suivantes si elles sont présentes dans le document :
${TAX_CASES_TO_EXTRACT.join(", ")}.
Retourne UNIQUEMENT un objet JSON valide au format : { "1AJ": 38400, "1BJ": 31200 }
N'inclure que les cases effectivement trouvées dans le document. Montants en euros entiers. Aucun texte avant ou après le JSON.`,
  ]);

  const text = result.response.text().trim();

  // Extraire le JSON brut (parfois encadré dans ```json ... ```)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { cases: {}, confidence: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return { cases: {}, confidence: 0 };
  }

  const validated = extractedCasesSchema.safeParse(parsed);
  if (!validated.success) {
    return { cases: {}, confidence: 0 };
  }

  // confidence = proportion de cases reconnues parmi celles demandées
  const foundCount = Object.keys(validated.data).filter((k) =>
    (TAX_CASES_TO_EXTRACT as readonly string[]).includes(k)
  ).length;
  const confidence = foundCount / TAX_CASES_TO_EXTRACT.length;

  return { cases: validated.data, confidence };
};
