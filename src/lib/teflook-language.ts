import { useState, useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChildStoreCategory } from "./teflook-categories";

export const CHILD_STORE_CATEGORY_MESSAGE_KEYS: Record<ChildStoreCategory, string> = {
  discipline: "category.discipline",
  emotionalIntelligence: "category.emotionalIntelligence",
  independence: "category.independence",
  confidence: "category.confidence",
  creativity: "category.creativity",
  criticalThinking: "category.criticalThinking",
};

export type Locale = "fr" | "ar";

export const translations: Record<Locale, Record<string, string>> = {
  fr: {
    "a11y.promises": "Nos promesses pour les familles",
    "announcement.one": "Grandir, jouer, s’épanouir ensemble",
    "announcement.two": "La curiosité se cultive chaque jour",
    "announcement.three": "De précieux moments parent-enfant",
    "announcement.four": "Choisir à hauteur d'enfant",
    "a11y.categories": "Catégories de développement de l'enfant",
    "a11y.search": "Recherche dans la boutique",
    "search.placeholder": "Que cherchez-vous ?",
    "a11y.clearSearch": "Effacer la recherche",
    "a11y.openMenu": "Ouvrir le menu de navigation",
    "a11y.cart": "Panier",
    "hero.eyebrow": "À leurs côtés, chaque jour",
    "hero.title": "Grandir, jouer, s’épanouir ensemble.",
    "hero.description":
      "Des idées pour protéger les enfants, éveiller leur curiosité et nourrir le lien qui vous unit.",
    "hero.explore": "Explorer la sélection",
    "hero.family": "Pensé pour les familles",
    "hero.play": "Apprendre en jouant",
    "category.eyebrow": "Pour chaque petit pas",
    "category.heading": "Les accompagner en grandissant",
    "category.discipline": "Discipline & gestion de soi",
    "category.discipline.subtitle": "Maîtrise",
    "category.emotionalIntelligence": "Intelligence émotionnelle",
    "category.emotionalIntelligence.subtitle": "Empathie",
    "category.independence": "Autonomie & compétences de vie",
    "category.independence.subtitle": "Autonomie",
    "category.confidence": "Confiance & compétences sociales",
    "category.confidence.subtitle": "Social",
    "category.creativity": "Créativité & imagination",
    "category.creativity.subtitle": "Imagination",
    "category.criticalThinking": "Pensée critique & résolution de problèmes",
    "category.criticalThinking.subtitle": "Logique",
    "shop.eyebrow": "L’échoppe TefLook",
    "shop.heading": "Grandir à leurs côtés",
    "shop.searchResults": "Résultats de recherche pour",
    "shop.products": "produits",
    "shop.product": "produit",
    "shop.discover": "Découvrir",
    "shop.noProducts": "Aucun produit trouvé",
    "shop.empty":
      "La sélection pour les enfants et leurs parents se prépare. Donnez-nous le nom et le prix d’un produit à ajouter dans la conversation.",
    "shop.emptyCategory": "Aucun article ne correspond pour l'instant à cette catégorie.",
    "shop.reset": "Réinitialiser les filtres",
    "values.safety": "Protéger au quotidien",
    "values.safetyText":
      "Des essentiels pensés pour aider les familles à choisir selon leurs besoins.",
    "values.growth": "Éveiller leur curiosité",
    "values.growthText":
      "Le jeu, les histoires et les découvertes font grandir à petits pas.",
    "values.connection": "Cultiver votre complicité",
    "values.connectionText":
      "De nouvelles idées pour partager du temps et nourrir le lien parent-enfant.",
    "footer.tagline": "Grandir, ensemble.",
    "footer.description":
      "Des idées choisies pour les enfants qui grandissent et les familles qui les accompagnent.",
    "footer.shop": "La boutique",
    "footer.allProducts": "Tous les produits",
    "footer.values": "Grandir ensemble",
    "footer.brand": "TefLook",
    "footer.children": "Pour les enfants",
    "footer.families": "Pour les familles",
    "footer.help": "Besoin d'aide ? Écrivez-nous",
    "footer.note": "À vos côtés, à chaque étape.",
    "notice.close": "Fermer la notification",
    "product.unavailable": "Cette variante est actuellement épuisée.",
    "product.addedPrefix": "Ajouté au panier : ",
    "product.add": "Ajouter au panier",
    "error.title": "Impossible de charger la boutique",
    "error.retry": "Réessayer",
    "cart.title": "Votre panier",
    "cart.countItem": "article",
    "cart.countItems": "articles",
    "cart.countPrefix": " choisis",
    "cart.emptyText": "Votre sélection pour le développement de l'enfant.",
    "cart.empty": "Votre panier est vide",
    "cart.keepShopping": "Découvrir nos trésors",
    "cart.subtotal": "Sous-total",
    "cart.shippingFee": "Livraison calculée lors de la finalisation de la commande.",
    "cart.updating": "Mise à jour...",
    "cart.checkout": "Commander maintenant",
    "cart.security": "Paiement sécurisé et service attentionné pour votre famille",
    "reviews.title": "Avis des parents & clients",
    "reviews.subtitle": "Avis vérifiés de familles et d'éducateurs",
    "reviews.write": "Écrire un avis",
    "reviews.verified": "Acheteur vérifié",
    "reviews.empty": "Soyez le premier à donner votre avis sur ce produit !",
    "reviews.emptySub": "Partagez votre expérience pour aider d'autres parents dans l'éveil de leurs enfants.",
    "reviews.recommended": "Recommandé par les familles",
    "reviews.stars": "étoiles",
    "reviews.star": "étoile",
    "reviews.basedOn": "Basé sur",
    "reviews.reviews": "avis",
    "reviews.review": "avis",
    "reviews.modalTitle": "Donner votre avis",
    "reviews.modalSubtitle": "Partagez votre retour d'expérience avec ce jeu ou outil",
    "reviews.ratingLabel": "Note globale",
    "reviews.nameLabel": "Votre prénom ou nom",
    "reviews.roleLabel": "Votre rôle (ex: Maman de 2 enfants, Papa, Éducatrice)",
    "reviews.commentLabel": "Votre avis détaillé",
    "reviews.commentPlaceholder": "Dites-nous comment votre enfant a réagi, ce qui vous a plu...",
    "reviews.submit": "Publier mon avis",
    "reviews.submitting": "Publication...",
    "reviews.success": "Merci ! Votre avis a été enregistré avec succès.",
    "reviews.cancel": "Annuler",
  },
  ar: {
    "a11y.promises": "وعودنا لكل عائلة",
    "announcement.one": "نكبر، نلعب ونزدهر معاً",
    "announcement.two": "الفضول ينمو يوماً بعد يوم",
    "announcement.three": "لحظات ثمينة بين الوالدين والطفل",
    "announcement.four": "اختيارات تناسب عالم طفلك",
    "a11y.categories": "أقسام تطور الطفل",
    "a11y.search": "البحث في المتجر",
    "search.placeholder": "عن ماذا تبحث؟",
    "a11y.clearSearch": "مسح البحث",
    "a11y.openMenu": "فتح القائمة",
    "a11y.cart": "سلة المشتريات",
    "hero.eyebrow": "بجانبهم، كل يوم",
    "hero.title": "نكبر، نلعب، ونزدهر معاً.",
    "hero.description":
      "أفكار لحماية الأطفال، وإيقاظ فضولهم، وتغذية الرابط الذي يجمعكم.",
    "hero.explore": "استكشف التشكيلة",
    "hero.family": "مصمم للعائلات",
    "hero.play": "التعلم باللعب",
    "category.eyebrow": "لكل خطوة صغيرة",
    "category.heading": "نرافقهم في كل مرحلة نمو",
    "category.discipline": "الانضباط وإدارة الذات",
    "category.discipline.subtitle": "تحكم",
    "category.emotionalIntelligence": "الذكاء العاطفي",
    "category.emotionalIntelligence.subtitle": "تعاطف",
    "category.independence": "الاستقلالية والمهارات الحياتية",
    "category.independence.subtitle": "استقلالية",
    "category.confidence": "الثقة والمهارات الاجتماعية",
    "category.confidence.subtitle": "تواصل",
    "category.creativity": "الإبداع والخيال",
    "category.creativity.subtitle": "خيال",
    "category.criticalThinking": "التفكير النقدي وحل المشكلات",
    "category.criticalThinking.subtitle": "منطق",
    "shop.eyebrow": "متجر تيفلوك",
    "shop.heading": "نكبر بجانبهم",
    "shop.searchResults": "نتائج البحث عن",
    "shop.products": "منتجات",
    "shop.product": "منتج",
    "shop.discover": "اكتشف المزيد",
    "shop.noProducts": "لم يتم العثور على أي منتج",
    "shop.empty":
      "التشكيلة المخصصة للأطفال وأولياء أمورهم قيد التحضير. يمكنك تزويدنا باسم وسعر المنتج لإضافته.",
    "shop.emptyCategory": "لا توجد منتجات مطابقة لهذا القسم حالياً.",
    "shop.reset": "إعادة تعيين الفلاتر",
    "values.safety": "حماية يومية",
    "values.safetyText":
      "أساسيات مدروسة لمساعدة العائلات على الاختيار المناسب لأطفالهم.",
    "values.growth": "إيقاظ فضولهم",
    "values.growthText":
      "اللعب والقصص والاكتشافات تجعلهم يكبرون خطوة بخطوة في بيئة محبة.",
    "values.connection": "تعزيز الرابطة الأسرية",
    "values.connectionText":
      "أفكار جديدة لقضاء أوقات ممتعة وبناء جسور التواصل بين الآباء والأبناء.",
    "footer.tagline": "نكبر، معاً.",
    "footer.description":
      "أفكار منتقاة بعناية للأطفال الذين يكبرون وللعائلات التي ترافق مسيرتهم.",
    "footer.shop": "المتجر",
    "footer.allProducts": "جميع المنتجات",
    "footer.values": "نكبر معاً",
    "footer.brand": "تيفلوك",
    "footer.children": "للأطفال",
    "footer.families": "للعائلات",
    "footer.help": "هل تحتاج مساعدة؟ راسلنا",
    "footer.note": "بجانبكم في كل خطوة ومرحلة.",
    "notice.close": "إغلاق الإشعار",
    "product.unavailable": "هذا المنتج غير متوفر حالياً.",
    "product.addedPrefix": "تمت الإضافة إلى السلة: ",
    "product.add": "إضافة إلى السلة",
    "error.title": "تعذر تحميل المتجر",
    "error.retry": "إعادة المحاولة",
    "cart.title": "سلة المشتريات",
    "cart.countItem": "منتج",
    "cart.countItems": "منتجات",
    "cart.countPrefix": " محددة",
    "cart.emptyText": "مختاراتكم المخصصة لتطوير مهارات الطفل.",
    "cart.empty": "سلة المشتريات فارغة",
    "cart.keepShopping": "استكشف مختاراتنا",
    "cart.subtotal": "المجموع الفرعي",
    "cart.shippingFee": "يتم احتساب رسوم التوصيل عند إنهاء الطلب.",
    "cart.updating": "جاري التحديث...",
    "cart.checkout": "إتمام الطلب الآن",
    "cart.security": "دفع آمن وخدمة مهتمة براحة عائلتك في جميع أنحاء المغرب",
    "reviews.title": "آراء أولياء الأمور والعملاء",
    "reviews.subtitle": "تقييمات موثقة من العائلات والمربين",
    "reviews.write": "كتابة تقييم",
    "reviews.verified": "مشتري موثق",
    "reviews.empty": "كن أول من يشاركنا رأيه في هذا المنتج !",
    "reviews.emptySub": "شارك تجربتك لمساعدة أولياء الأمور الآخرين في تنمية مهارات أطفالهم.",
    "reviews.recommended": "يوصى به من قبل العائلات",
    "reviews.stars": "نجوم",
    "reviews.star": "نجمة",
    "reviews.basedOn": "بناءً على",
    "reviews.reviews": "تقييمات",
    "reviews.review": "تقييم",
    "reviews.modalTitle": "شاركنا رأيك في هذا المنتج",
    "reviews.modalSubtitle": "أخبرنا بتجربتك مع هذه اللعبة أو الأداة التعليمية",
    "reviews.ratingLabel": "التقييم العام",
    "reviews.nameLabel": "الاسم الكامل",
    "reviews.roleLabel": "صفتك (مثال: أم لطفلين، أب، مربية أطفال)",
    "reviews.commentLabel": "رأيك بالتفصيل",
    "reviews.commentPlaceholder": "أخبرنا كيف تفاعل طفلك، وما الذي نال إعجابك...",
    "reviews.submit": "نشر التقييم الآن",
    "reviews.submitting": "جاري النشر...",
    "reviews.success": "شكراً لك! تم تسجيل تقييمك بنجاح.",
    "reviews.cancel": "إلغاء",
  },
};

interface LanguageStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      locale: "fr",
      setLocale: (locale) => {
        set({ locale });
        if (typeof document !== "undefined") {
          document.documentElement.lang = locale;
          document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
        }
      },
    }),
    {
      name: "teflook-locale",
      skipHydration: true,
    }
  )
);

export function useTefLookLanguage() {
  const [mounted, setMounted] = useState(false);
  const storeLocale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  useEffect(() => {
    void useLanguageStore.persist.rehydrate();
    setMounted(true);
  }, []);

  // During SSR and initial client hydration pass, lock to "fr" (the SSR default)
  const locale: Locale = mounted ? storeLocale : "fr";
  const direction: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  const t = (key: string): string => {
    return translations[locale]?.[key] ?? translations.fr[key] ?? key;
  };

  return {
    locale,
    direction,
    setLocale,
    t,
    isMounted: mounted,
  };
}
