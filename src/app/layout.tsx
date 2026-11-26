import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { CookieConsentProvider } from "@/lib/cookies";
import { ConsentScriptLoader } from "@/components/cookies/ConsentScriptLoader";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

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
    <html
      lang="fr"
      className={`h-full scroll-smooth ${cormorantGaramond.className} ${cormorantGaramond.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/Untitled Design.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`min-h-full flex flex-col bg-[#FBF9F5] text-[#1C2A2B] font-medium text-[15px] sm:text-base antialiased selection:bg-[#FE7C58] selection:text-white ${cormorantGaramond.className} ${cormorantGaramond.variable}`}
      >
        <CookieConsentProvider>
          {children}
          {/* Floating WhatsApp Contact Button (Active across all pages) */}
          <WhatsAppButton />
          {/* Opposite-Corner Back to Top Button */}
          <BackToTopButton />
          {/* Production-Ready Cookie Consent Banner & Preferences Modal */}
          <ConsentScriptLoader />
        </CookieConsentProvider>
      </body>
    </html>
  );
}
