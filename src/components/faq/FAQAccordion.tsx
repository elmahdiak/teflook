"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import type { ShopifyProduct } from "@/lib/shopify-storefront";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { getLocalizedProduct } from "@/lib/product-localization";
import { cleanWhatsAppNumber, fetchSiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  questionFr: string;
  questionAr: string;
  answerFr: string;
  answerAr: string;
  showWhatsAppCta?: boolean;
}

export interface FAQAccordionProps {
  product?: ShopifyProduct;
  className?: string;
}

export function FAQAccordion({ product, className }: FAQAccordionProps) {
  const { locale, direction } = useTefLookLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [whatsappPhone, setWhatsappPhone] = useState<string>("212600000000");

  useEffect(() => {
    setIsMounted(true);
    fetchSiteSettings().then((s) => {
      const cleaned = cleanWhatsAppNumber(s?.whatsapp_phone || "");
      if (cleaned) setWhatsappPhone(cleaned);
    });
  }, []);

  const currentLocale = isMounted ? locale : "fr";
  const currentDirection = isMounted ? direction : "ltr";
  const isAr = currentLocale === "ar";

  const localizedProduct = product ? getLocalizedProduct(product, currentLocale) : null;
  const ageText = product?.ageRange || product?.ageBracket || "";
  const skillsText =
    product?.skills && product.skills.length > 0 ? product.skills.join(", ") : "";

  const faqItems: FAQItem[] = [
    {
      id: "delivery-cod",
      questionFr: "Comment fonctionne la livraison et le paiement ?",
      questionAr: "كيف يعمل الدفع والتوصيل؟",
      answerFr:
        "Chez TefLook, vous commandez en toute sérénité grâce au Paiement à la Livraison (Cash on Delivery). Aucune carte bancaire n'est demandée en ligne : vous réglez en espèces directement au livreur après réception et vérification de votre colis. La livraison est rapide en 24h à 48h partout au Maroc (Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et toutes les autres villes).",
      answerAr:
        "في تيفلوك، تطلبون بكل أمان واطمئنان عبر خدمة الدفع عند الاستلام. لا حاجة لاستخدام البطاقة البنكية عبر الإنترنت: تدفعون نقداً مباشرة للموزع بعد استلام ومعاينة طلبيتكم. التوصيل سريع خلال 24 إلى 48 ساعة إلى جميع مدن المغرب (الدار البيضاء، الرباط، مراكش، طنجة، فاس، أكادير وكافة المدن).",
    },
    {
      id: "recommended-age",
      questionFr: product
        ? "Quel est l'âge recommandé pour ce kit ?"
        : "Quel est l'âge recommandé pour les kits TefLook ?",
      questionAr: product
        ? "ما هو العمر الموصى به لهذه المجموعة؟"
        : "ما هو العمر الموصى به لمجموعات تيفلوك؟",
      answerFr: product
        ? `Ce kit (${localizedProduct?.title}) est spécialement conçu pour les enfants de ${ageText || "5 à 12 ans"}. Ses dimensions, ses matériaux non toxiques et son niveau de difficulté sont adaptés pour stimuler l'enfant sans frustration, seul ou accompagné d'un parent.`
        : "Nos jeux et outils pédagogiques couvrent chaque étape clé de l'enfance et de l'adolescence, répartis en 4 tranches d'âge : 5 - 6 ans, 7 - 10 ans, 11 - 12 ans et 13 - 15 ans. Chaque fiche produit indique précisément l'âge conseillé.",
      answerAr: product
        ? `تم تصميم هذه المجموعة (${localizedProduct?.title}) خصيصاً للأطفال في الفئة العمرية ${ageText || "من 5 إلى 12 سنة"}. جميع المكونات والمواد غير السامة ومستوى التحدي مدروسة لتحفيز الطفل بلطف، سواء للعب الفردي أو التشاركي مع الوالدين.`
        : "تغطي ألعابنا وأدواتنا التربوية مختلف مراحل نمو الطفل والمراهق عبر 4 فئات عمرية مدروسة: 5 - 6 سنوات، 7 - 10 سنوات، 11 - 12 سنة، و13 - 15 سنة. يوضح كل منتج الفئة العمرية الأنسب له.",
    },
    {
      id: "child-benefits",
      questionFr: "Quels sont les bénéfices pour le développement de mon enfant ?",
      questionAr: "ما هي فوائد المنتج لتنمية طفلي؟",
      answerFr: product
        ? `Issu de l'univers « ${localizedProduct?.categoryName} », cet outil favorise ${
            skillsText
              ? skillsText
              : "la motricité fine, la concentration, l'autonomie et la créativité"
          }. Conçu sans écran, il aide votre enfant à canaliser son énergie, renforcer sa confiance en soi et partager des moments complices en famille.`
        : "Chaque création TefLook cible des compétences essentielles : motricité fine, concentration, gestion des émotions, autonomie quotidienne, confiance sociale, créativité et pensée logique. Des jeux sans écran pensés pour faire grandir l'enfant tout en renforçant le lien parent-enfant.",
      answerAr: product
        ? `ينتمي هذا المنتج إلى قسم « ${localizedProduct?.categoryName} »، ويساهم بفعالية في تنمية ${
            skillsText
              ? skillsText
              : "المهارات الحركية الدقيقة، التركيز العميق، الاستقلالية والإبداع"
          }. صُمم بعيداً عن الشاشات لمساعدة طفلك على تعزيز ثقته بنفسه وقضاء أوقات أسرية ممتعة ومفيدة.`
        : "تستهدف منتجات تيفلوك مهارات أساسية في شخصية الطفل: المهارات الحركية الدقيقة، التركيز، الذكاء العاطفي، الاستقلالية اليومية، الثقة بالنفس، الإبداع والتفكير المنطقي، وذلك عبر اللعب التفاعلي بعيداً عن الشاشات.",
    },
    {
      id: "order-support",
      questionFr: "Que faire en cas de problème avec ma commande ?",
      questionAr: "ماذا أفعل في حال وجود مشكلة في طلبي؟",
      answerFr:
        "Votre satisfaction est notre priorité absolue. En cas de question, d'erreur de livraison ou de besoin d'échange/retour, notre équipe marocaine est à votre écoute 7j/7. Cliquez simplement sur le bouton vert WhatsApp pour discuter directement avec notre service client et obtenir une solution immédiate.",
      answerAr:
        "رضاكم هو أولويتنا القصوى. في حال وجود أي استفسار أو خطأ في التوصيل أو رغبة في الاستبدال والإرجاع، فريقنا في المغرب رهن إشارتكم طوال أيام الأسبوع. يكفي الضغط على زر الواتساب الأخضر للتواصل الفوري مع خدمة العملاء والحصول على حل سريع.",
      showWhatsAppCta: true,
    },
  ];

  const whatsappHelpUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    isAr
      ? "مرحباً تيفلوك، لدي استفسار بخصوص طلبيتي أو أحد المنتجات."
      : "Bonjour TefLook, j'ai une question concernant ma commande ou un produit."
  )}`;

  return (
    <section
      id="faq"
      dir={currentDirection}
      lang={currentLocale}
      aria-labelledby="faq-heading"
      className={cn(
        product ? "mt-14 sm:mt-20 border-t border-border pt-12 sm:pt-16" : "store-shell pb-14 sm:pb-20",
        className
      )}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[#4b9797]/15 text-[#4b9797]">
              <HelpCircle size={15} />
            </span>
            <p
              className={cn(
                "text-[11px] font-bold text-[#ff3500]",
                isAr ? "tracking-normal font-sans text-xs" : "uppercase tracking-[0.15em]"
              )}
            >
              {isAr ? "مساعدة ومعلومات" : "Aide & Informations"}
            </p>
          </div>
          <h2
            id="faq-heading"
            className={cn(
              "mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#1A2D2A]",
              isAr && "font-sans"
            )}
          >
            {isAr ? "الأسئلة الشائعة" : "Questions Fréquentes"}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            {isAr
              ? "كل ما يحتاج الآباء معرفته حول التوصيل، الدفع عند الاستلام وفوائد منتجات تيفلوك."
              : "Tout ce que les parents doivent savoir sur la livraison, le paiement à la livraison et nos outils d'éveil."}
          </p>
        </div>
      </div>

      {/* Collapsible Accordion Container */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white shadow-sm overflow-hidden">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const question = isAr ? item.questionAr : item.questionFr;
          const answer = isAr ? item.answerAr : item.answerFr;

          return (
            <div
              key={item.id}
              className="border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                onClick={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-start hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <span
                  className={cn(
                    "font-bold text-sm sm:text-base transition-colors leading-snug",
                    isOpen ? "text-[#4b9797]" : "text-slate-900 group-hover:text-[#4b9797]",
                    isAr && "font-sans"
                  )}
                >
                  {question}
                </span>

                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full transition-all duration-300",
                    isOpen
                      ? "bg-[#4b9797]/15 text-[#4b9797] rotate-180"
                      : "bg-slate-100 text-slate-500 group-hover:bg-[#4b9797]/10 group-hover:text-[#4b9797]"
                  )}
                >
                  <ChevronDown size={17} strokeWidth={2.3} />
                </span>
              </button>

              {/* Smooth Grid Row Collapse/Expand Transition */}
              <div
                id={`faq-panel-${item.id}`}
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0.5 space-y-3">
                    <p
                      className={cn(
                        "text-xs sm:text-sm text-slate-600 leading-relaxed text-start",
                        isAr && "font-sans leading-loose"
                      )}
                    >
                      {answer}
                    </p>

                    {item.showWhatsAppCta && (
                      <div>
                        <a
                          href={whatsappHelpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 px-4 py-1.5 text-xs font-bold text-[#1a8f46] transition-colors"
                        >
                          <MessageCircle size={14} className="shrink-0" />
                          <span>
                            {isAr ? "تواصل مع خدمة العملاء عبر واتساب" : "Contacter le support sur WhatsApp"}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
