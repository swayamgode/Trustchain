import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cinzel, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-cinzel",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "TrustChain — Institutional Trust Infrastructure",
  description:
    "Institutional dashboard for decentralized credential issuance, verification, and trust registry operations.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${plusJakartaSans.variable} ${cinzel.variable} ${greatVibes.variable} ${playfair.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F7F4] text-[#101418] font-sans">
        {children}
      </body>
    </html>
  );
}
