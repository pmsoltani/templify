import "./globals.css";

export const metadata = {
  title: "Templify | API-Driven PDF Generation",
  description: "Generate custom PDFs from data using your own HTML/CSS templates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
