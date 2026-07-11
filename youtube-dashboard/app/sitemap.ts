import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             SITE_URL,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        1,
    },
    {
      url:             `${SITE_URL}/demo`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    },
    {
      url:             `${SITE_URL}/login`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.5,
    },
    {
      url:             `${SITE_URL}/privacy`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
  ];
}