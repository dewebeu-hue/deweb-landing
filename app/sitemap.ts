import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/seo-policy.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_ORIGIN}/` },
    { url: `${SITE_ORIGIN}/tehnicka-provjera-weba` },
    { url: `${SITE_ORIGIN}/alati/sidrene-cijene` },
  ];
}
