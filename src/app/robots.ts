import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://homebudget.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/legal/"],
        disallow: ["/dashboard", "/sheets/", "/patrimoine", "/fiscalite/", "/family", "/analytics", "/bilan", "/api/", "/onboarding"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
