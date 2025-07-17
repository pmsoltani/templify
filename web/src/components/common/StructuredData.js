import { APP_INFO } from "@/lib/config";

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_INFO.name,
    description: APP_INFO.description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      priceValidUntil: "2025-12-31",
      availability: "https://schema.org/InStock",
    },
    creator: {
      "@type": "Person",
      name: APP_INFO.author.name,
      url: APP_INFO.author.url,
    },
    url: APP_INFO.baseUrl,
    screenshot: `${APP_INFO.baseUrl}/images/og-image.png`,
    featureList: [
      "HTML to PDF conversion",
      "Custom template design",
      "API-based PDF generation",
      "Automated PDF generation",
      "Template variables",
      "Responsive design support",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
