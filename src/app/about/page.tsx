import type { Metadata } from "next";
import { AboutPageView } from "@/components/about/AboutPageView";

export const metadata: Metadata = {
  title: "À propos de TefLook — Grandir, ensemble",
  description:
    "Découvrez la mission et l'approche pédagogique de TefLook : des jeux et outils sans écran pour développer l'autonomie, la discipline et la créativité des enfants de 5 à 15 ans.",
};

export default function AboutPage() {
  return <AboutPageView />;
}
