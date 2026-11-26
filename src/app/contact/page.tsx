import type { Metadata } from "next";
import { ContactPageView } from "@/components/contact/ContactPageView";

export const metadata: Metadata = {
  title: "Contactez-Nous — TefLook",
  description:
    "Écrivez à l'équipe TefLook pour toute question sur nos jeux d'éveil, la sécurité de votre enfant ou le suivi de votre commande.",
};

export default function ContactPage() {
  return <ContactPageView />;
}
