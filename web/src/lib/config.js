const APP_INFO = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  name: process.env.NEXT_PUBLIC_APP_NAME || "Templify",
  tagline:
    process.env.NEXT_PUBLIC_APP_TAGLINE || "Automated PDF Generation Made Simple",
  description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    "Generate custom PDFs from data using your own HTML/CSS templates.",
  version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
  author: {
    name: process.env.NEXT_PUBLIC_APP_AUTHOR || "Pooria Soltani",
    url: process.env.NEXT_PUBLIC_APP_AUTHOR_URL || "https://github.com/pmsoltani",
  },
};

const HTML_METADATA = {
  metadataBase: new URL(APP_INFO.baseUrl),
  title: {
    template: `%s | ${APP_INFO.name}`,
    default: `${APP_INFO.name} | ${APP_INFO.tagline}`,
  },
  description: APP_INFO.description,
  authors: [{ name: APP_INFO.author.name, url: APP_INFO.author.url }],
  keywords: [
    "PDF Generator API",
    "HTML to PDF",
    "PDF Templates",
    "Dynamic PDF Generation",
    "Custom PDF Creation",
    "PDF Automation",
    "Template to PDF",
    "PDF Generation Service",
    "Invoice Generator",
    "Document Automation",
  ],
  creator: APP_INFO.author.name,
  publisher: APP_INFO.name,
  robots: "index, follow",
  manifest: "/manifest.json",
  alternates: { canonical: APP_INFO.baseUrl },
  category: "Technology",
  classification: "Business Application",
  openGraph: {
    title: `${APP_INFO.name} | ${APP_INFO.tagline}`,
    description: APP_INFO.description,
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: `${APP_INFO.name} | ${APP_INFO.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_INFO.name} | ${APP_INFO.tagline}`,
    description: APP_INFO.description,
    images: ["/images/twitter-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/images/icons/icon0.svg", type: "image/svg+xml" },
      { url: "/images/icons/icon1.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/images/icons/apple-touch-icon.png",
  },
};

export { APP_INFO, HTML_METADATA };
