import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const APP_URL = process.env.NEXTAUTH_URL ?? "https://homebudget.app";

export const metadata: Metadata = {
  title: {
    default: "HomeBudget — Gérez votre budget et votre patrimoine en famille",
    template: "%s — HomeBudget",
  },
  description:
    "HomeBudget est l'application de gestion budgétaire et patrimoniale pour les familles françaises. Suivi mensuel, patrimoine, simulation IR, extraction 2042 par IA.",
  keywords: ["budget familial", "gestion patrimoine", "simulation impôts", "déclaration 2042", "budget mensuel", "PEA", "assurance vie"],
  authors: [{ name: "HomeBudget" }],
  openGraph: {
    title: "HomeBudget — Budget et patrimoine en famille",
    description:
      "Suivez votre budget mensuel, gérez votre patrimoine et simulez votre impôt sur le revenu avec HomeBudget.",
    url: APP_URL,
    siteName: "HomeBudget",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeBudget — Budget et patrimoine en famille",
    description:
      "Suivez votre budget mensuel, gérez votre patrimoine et simulez votre impôt sur le revenu.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(APP_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
