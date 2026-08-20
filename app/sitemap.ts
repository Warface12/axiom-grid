import type { MetadataRoute } from "next";

const BASE_URL = "https://nivarobet.best";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Keep this list limited to real, public, indexable pages.
  // Do NOT add blocked/review-only GEO or casino pages here.
  const routes = [
    "",
    "/casinos",
    "/about",
    "/legal/privacy",
    "/legal/responsible-gambling",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
