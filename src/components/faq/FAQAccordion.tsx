"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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
      aria-labelledby="faq-title"
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-[#F4F9F9] to-white",
        product
          ? "mt-14 sm:mt-20 rounded-3xl border border-[#4B9393]/15 py-12 sm:py-16 px-4 sm:px-8"
          : "border-t border-[#4B9393]/10",
        className
      )}
    >
      {/* Soft Ambient Brand Radial Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -end-28 w-[28rem] h-[28rem] sm:w-[36rem] sm:h-[36rem] rounded-full bg-[radial-gradient(circle,rgba(75,151,151,0.08)_0%,rgba(75,151,151,0)_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -start-28 w-[26rem] h-[26rem] sm:w-[34rem] sm:h-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,191,0,0.07)_0%,rgba(255,191,0,0)_70%)]"
      />

      {/* Centered Container */}
      <div
        className={cn(
          "relative mx-auto",
          product
            ? "max-w-4xl"
            : "max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        )}
      >
        {/* Start-Aligned Section Header */}
        <header className="text-start">
          <p
            className={cn(
              "font-display text-xs sm:text-[13px] font-bold text-[#4b9797]",
              isAr ? "tracking-normal font-sans text-sm" : "uppercase tracking-[0.14em]"
            )}
          >
            {isAr ? "الأسئلة المتداولة" : "QUESTIONS COURANTES"}
          </p>
          <h2
            id="faq-title"
            className={cn(
              "mt-2.5 font-display text-3xl sm:text-5xl font-extrabold text-[#1A3C34] leading-[1.12]",
              isAr ? "font-sans tracking-normal" : "tracking-tight"
            )}
          >
            {isAr ? "الأسئلة الشائعة" : "Questions Fréquentes"}
            <span className="text-[#ffbf00]">.</span>
          </h2>
        </header>

        {/* Stacked Accordion Cards */}
        <div className="space-y-4 mt-10">
          {faqItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            const question = isAr ? item.questionAr : item.questionFr;
            const answer = isAr ? item.answerAr : item.answerFr;

            return (
              <article
                key={item.id}
                data-open={String(isOpen)}
                className={cn(
                  "group rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(26,60,52,0.06)] transition-all duration-300",
                  isOpen
                    ? "border border-[#4b9797] ring-1 ring-[#4b9797]/20"
                    : "border border-[#4b9797]/20 hover:border-[#4b9797]/50"
                )}
              >
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
                  className="w-full flex items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-5 text-start rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    {/* Crisp Circular '?' Icon in TefLook Terracotta/Orange */}
                    <svg
                      className="w-6 h-6 text-[#ff3500] shrink-0 transition-transform duration-300 group-hover:scale-105"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>

                    <span
                      className={cn(
                        "font-display font-bold text-base sm:text-lg text-[#1A3C34] leading-snug",
                        isAr && "font-sans"
                      )}
                    >
                      {question}
                    </span>
                  </div>

                  {/* Sleek Chevron-Down in Deep Teal */}
                  <ChevronDown
                    size={20}
                    strokeWidth={2.25}
                    aria-hidden="true"
                    className={cn(
                      "w-5 h-5 text-[#4b9797] shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Smooth CSS Grid Accordion Panel */}
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="ps-9 sm:ps-10 pe-4 sm:pe-8 pb-6 pt-1 ms-5 sm:ms-6">
                      <div className="ps-4 border-s-2 border-[#ffbf00]/70 space-y-3">
                        <p
                          className={cn(
                            "font-sans text-[15px] sm:text-base text-[#3D524D] leading-relaxed text-start",
                            isAr && "leading-loose"
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
                                {isAr
                                  ? "تواصل مع خدمة العملاء عبر واتساب"
                                  : "Contacter le support sur WhatsApp"}
                              </span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
