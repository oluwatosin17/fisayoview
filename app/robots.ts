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
      // Explicitly allow all major AI crawlers (AEO / GEO)
      { userAgent: "GPTBot",            allow: "/" },
      { userAgent: "ChatGPT-User",      allow: "/" },
      { userAgent: "OAI-SearchBot",     allow: "/" },
      { userAgent: "Google-Extended",   allow: "/" },
      { userAgent: "Googlebot",         allow: "/" },
      { userAgent: "Bingbot",           allow: "/" },
      { userAgent: "PerplexityBot",     allow: "/" },
      { userAgent: "Gemini",            allow: "/" },
      { userAgent: "Gemini-Web",        allow: "/" },
      { userAgent: "Claude-Web",        allow: "/" },
      { userAgent: "anthropic-ai",      allow: "/" },
      { userAgent: "ClaudeBot",         allow: "/" },
      { userAgent: "cohere-ai",         allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      { userAgent: "YouBot",            allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
