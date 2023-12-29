import type { Metadata } from "next";
import { IBM_Plex_Sans_Condensed } from "next/font/google";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex_condensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-plex-condensed",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Drive Clone",
  description: "File Storage and Conversion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plex_condensed.variable} ${plex.variable}`}>
      <body className="overscroll-none">{children}</body>
    </html>
  );
}
