import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pool4ward",
  description: "Pool4ward - Avancez ensemble",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
