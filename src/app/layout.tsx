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
    icon: "/images/Untitled Design.png",
    shortcut: "/images/Untitled Design.png",
    apple: "/images/Untitled Design.png",
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
        <link rel="icon" href="/images/Untitled Design.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FBF9F5] text-[#1C2A2B] antialiased selection:bg-[#FE7C58] selection:text-white">
        {children}
        {/* Floating WhatsApp Contact Button (Active across all pages) */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
