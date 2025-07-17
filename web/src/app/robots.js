import { APP_INFO } from "@/lib/config";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/api/"], // Protect authenticated areas
      },
    ],
    sitemap: `${APP_INFO.baseUrl}/sitemap.xml`,
  };
}
