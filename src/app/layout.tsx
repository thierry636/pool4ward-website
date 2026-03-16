import type { ReactNode } from "react";

// Root layout is required by Next.js but content is handled by [locale]/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
