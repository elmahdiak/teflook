import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  DM_Sans,
  Cairo,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import { CookieConsentProvider } from "@/lib/cookies";
import { ConsentScriptLoader } from "@/components/cookies/ConsentScriptLoader";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-arabic",
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
      className={`h-full scroll-smooth ${bricolageGrotesque.variable} ${dmSans.variable} ${cairo.variable} ${ibmPlexSansArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/images/Untitled Design.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F3EFE6] text-[#1C2625] antialiased selection:bg-[#C85D3E] selection:text-white">
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
