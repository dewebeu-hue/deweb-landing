import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/seo-policy.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_ORIGIN}/` }];
}
