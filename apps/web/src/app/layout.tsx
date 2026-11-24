import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NAMH ASTRO — Talk & Chat with Verified Vedic Astrologers",
  description:
    "Connect with verified Vedic astrologers on NAMH ASTRO for live chat, audio call, video consultation, Free Janam Kundli, Kundli Matching, Daily Horoscope, Online Puja, and Astro Store.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#351044",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${cormorant.variable} ${devanagari.variable}`}
    >
      <body>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
