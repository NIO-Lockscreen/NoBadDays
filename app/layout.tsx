import type { Metadata } from "next";
import "./globals.css";

// Vercel exposes the deployment host at build time; fall back to localhost so
// `next dev` and local builds still resolve absolute Open Graph image URLs.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ingen dårlige dager – en kortfortelling",
  description:
    "Les forordet og last ned den norske kortfortellingen Ingen dårlige dager.",
  openGraph: {
    title: "Ingen dårlige dager",
    description:
      "Hva ville skje dersom vi kunne fjerne alt som gjør livet vondt, uten å fjerne selve livet?",
    type: "book",
    locale: "nb_NO",
    images: ["/assets/cover.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  );
}
