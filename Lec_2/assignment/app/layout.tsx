import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Persona AI — Hitesh & Piyush styles",
  description: "Beautiful chat UI with animated persona switching"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* theme is toggled by client */}
      <body data-theme="hitesh">{children}</body>
    </html>
  );
}
