import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Get This Item – Melbourne Moving Sale",
  description: "We're leaving Melbourne and would love to find a family that will take all our things.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
