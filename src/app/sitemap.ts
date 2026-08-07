import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://homebudget.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${APP_URL}/legal/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/legal/cgv`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/legal/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/legal/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
