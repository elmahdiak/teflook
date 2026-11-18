import type { Metadata } from "next";
import "./globals.css";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  metadataBase: new URL("https://teflook.com"),
  title: "TefLook | Développement, Éveil & Protection de l'Enfant",
  description:
    "Maison TefLook : Favoriser le développement et la connexion de l'enfant. Kits de sécurité domestique certifiés, jouets d'éveil sensoriel Montessori et jeux de connexion parent-enfant.",
  keywords: [
    "TefLook",
    "Protection Enfant",
    "Sécurité Domestique",
    "Jouets d'Éveil",
    "Montessori",
    "Connexion Parents-Enfants",
    "Jeux famille",
    "Artisanat Marocain",
  ],
  icons: {
    icon: "/images/teflook-mark.png",
    shortcut: "/images/teflook-mark.png",
    apple: "/images/teflook-mark.png",
  },
  openGraph: {
    title: "TefLook — Développement, Éveil & Protection de l'Enfant",
    description: "Favoriser le développement & la connexion de l'enfant. Sécurité domestique, jouets d'éveil et moments complices.",
    siteName: "TefLook",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/teflook-brand-horizontal.png",
        width: 1200,
        height: 630,
        alt: "TefLook - Développement & Connexion de l'Enfant",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/images/teflook-mark.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9F8F6] text-[#1E293B] antialiased selection:bg-[#FF6B00] selection:text-white">
        {children}
        {/* Floating WhatsApp Contact Button (Active across all pages) */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
