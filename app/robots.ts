import { MetadataRoute } from "next";

const BASE_URL = "https://fisayoview.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/"],
      },
      // Explicitly allow AI crawlers
      { userAgent: "GPTBot",       allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot",   allow: "/" },
      { userAgent: "Gemini",          allow: "/" },
      { userAgent: "Claude-Web",      allow: "/" },
      { userAgent: "anthropic-ai",    allow: "/" },
      { userAgent: "cohere-ai",       allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
