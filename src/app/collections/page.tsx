import type { Metadata } from "next";
import { CollectionsPageView } from "@/components/collections/CollectionsPageView";

export const metadata: Metadata = {
  title: "Nos Collections — TefLook",
  description:
    "Des outils d'apprentissage sans écran pensés pour chaque étape de l'enfant : discipline, intelligence émotionnelle, autonomie, confiance, créativité et esprit critique.",
};

export default function CollectionsPage() {
  return <CollectionsPageView />;
}
