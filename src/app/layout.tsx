import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pool4ward — The Collaborative Platform for Logistics Ecosystems",
  description:
    "Pool4ward helps organizations discover, design, and implement collaborative logistics initiatives across networks of actors. Optimize beyond company boundaries.",
  keywords: [
    "logistics optimization",
    "collaborative transport",
    "supply chain collaboration",
    "multimodal logistics",
    "logistics platform",
    "ecosystem optimization",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
