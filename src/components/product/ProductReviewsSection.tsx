"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  MessageSquare,
  MessageSquarePlus,
  PenLine,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProductReview,
  ProductRatingSummary,
  calculateRatingSummary,
  fetchReviewsByProduct,
  submitProductReview,
} from "@/lib/reviews-service";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

interface ProductReviewsSectionProps {
  productId: string;
  productHandle?: string;
  productTitle: string;
  className?: string;
  onSummaryCalculated?: (summary: ProductRatingSummary) => void;
}

export function ProductReviewsSection({
  productId,
  productHandle,
  productTitle,
  className,
  onSummaryCalculated,
}: ProductReviewsSectionProps) {
  const { locale, direction, t } = useTefLookLanguage();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Load reviews on mount
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setIsLoading(true);
      const data = await fetchReviewsByProduct(productId, productHandle);
      if (isMounted) {
        setReviews(data);
        setIsLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [productId, productHandle]);

  const summary = calculateRatingSummary(reviews);

  const onSummaryCalculatedRef = useRef(onSummaryCalculated);
  useEffect(() => {
    onSummaryCalculatedRef.current = onSummaryCalculated;
  }, [onSummaryCalculated]);

  useEffect(() => {
    if (!isLoading && onSummaryCalculatedRef.current) {
      onSummaryCalculatedRef.current(calculateRatingSummary(reviews));
    }
  }, [reviews, isLoading, productId]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setFormError(locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة." : "Veuillez remplir votre nom et votre avis.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const res = await submitProductReview({
      productId,
      productHandle,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || (locale === "ar" ? "ولي أمر" : "Parent"),
      rating,
      comment: comment.trim(),
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      setReviews((prev) => [res.review!, ...prev]);
      setIsFormOpen(false);
      setAuthorName("");
      setAuthorRole("");
      setComment("");
      setRating(5);
      setToastMessage(t("reviews.success"));
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setFormError(res.error || (locale === "ar" ? "حدث خطأ أثناء إرسال التقييم." : "Erreur lors de l'envoi de l'avis."));
    }
  }

  const ratingDescriptions: Record<number, { fr: string; ar: string }> = {
    5: { fr: "Excellent ! Fortement recommandé", ar: "ممتاز ! أنصح به بشدة" },
    4: { fr: "Très bien, mon enfant apprécie", ar: "جيد جداً، طفلي سعيد به" },
    3: { fr: "Bien dans l'ensemble", ar: "جيد بشكل عام" },
    2: { fr: "Moyen, quelques réserves", ar: "متوسط، بعض الملاحظات" },
    1: { fr: "Décevant", ar: "غير مناسب" },
  };

  return (
    <section
      id="avis-clients"
      dir={direction}
      className={cn("mt-14 sm:mt-20 border-t border-border pt-12 sm:pt-16", className)}
      aria-label={t("reviews.title")}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 end-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-emerald-700 text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ms-2 hover:opacity-80 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. SECTION HEADER ROW */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[#ffbf00]/15 text-[#ffbf00]">
              <Star size={15} fill="currentColor" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#ff3500]">
              {t("reviews.subtitle")}
            </p>
          </div>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#1A2D2A]">
            {t("reviews.title")}
          </h2>
        </div>

        {/* High-End Primary "Write a Review" Button */}
        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 self-start sm:self-auto px-5 py-2.5 rounded-full bg-[#ff3500] hover:bg-[#e03000] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer"
        >
          <PenLine size={15} className="shrink-0" />
          <span>{t("reviews.write")}</span>
        </button>
      </div>

      {/* 2. INTERACTIVE "WRITE A REVIEW" FLOATING MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFormOpen(false)}
          />

          {/* Modal Card */}
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl sm:rounded-3xl border border-border bg-white p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/70">
              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-[#1A2D2A]">
                  {t("reviews.modalTitle")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reviews.modalSubtitle")} : <strong className="text-foreground">{productTitle}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              {/* Interactive 5-Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("reviews.ratingLabel")} *
                </label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isActive = (hoverRating || rating) >= starValue;
                    return (
                      <button
                        type="button"
                        key={starValue}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starValue)}
                        aria-label={`${starValue} étoiles`}
                        className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={cn(
                            "transition-colors",
                            isActive ? "text-[#ffbf00] fill-[#ffbf00]" : "text-border fill-transparent"
                          )}
                        />
                      </button>
                    );
                  })}
                  <span className="ms-2 text-xs font-bold text-brand-teal">
                    {ratingDescriptions[hoverRating || rating]?.[locale] || ""}
                  </span>
                </div>
              </div>

              {/* Name & Role Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("reviews.nameLabel")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={locale === "ar" ? "مثال: مريم العلمي" : "Ex: Meriem Benani"}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9797]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t("reviews.roleLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder={locale === "ar" ? "مثال: أم لطفلين (5 و 8 سنوات)" : "Ex: Maman de 2 enfants (5 et 8 ans)"}
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9797]/40"
                  />
                </div>
              </div>

              {/* Detailed Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("reviews.commentLabel")} *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t("reviews.commentPlaceholder")}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-border bg-[#FBF9F5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4b9797]/40 resize-y"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/70">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-muted-foreground hover:bg-secondary cursor-pointer"
                >
                  {t("reviews.cancel")}
                </button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#ff3500] hover:bg-[#e03000] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin me-2" />
                      <span>{t("reviews.submitting")}</span>
                    </>
                  ) : (
                    <span>{t("reviews.submit")}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RATING SUMMARY BOX (Average Score + Star Progress Bars) */}
      <div className="mb-10 rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column (Start in RTL/LTR): Big Score & Badge */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-start lg:border-e lg:border-slate-100 lg:pe-8">
            <div className="flex items-baseline gap-2" dir="ltr">
              <span className="font-display text-4xl sm:text-5xl font-black tracking-tight text-slate-900 tabular-nums">
                {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-base sm:text-lg text-slate-400 font-semibold">/ 5</span>
            </div>

            {/* Stars */}
            <div className="mt-2.5 flex items-center gap-1 text-[#ffbf00]">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={cn(
                    i <= Math.round(summary.averageRating)
                      ? "fill-[#ffbf00] text-[#ffbf00]"
                      : "fill-slate-100 text-slate-200"
                  )}
                />
              ))}
            </div>

            <p className="mt-2.5 text-xs sm:text-sm font-medium text-slate-500">
              {summary.totalReviews > 0 ? (
                <>
                  {t("reviews.basedOn")}{" "}
                  <strong className="font-bold text-slate-800">
                    {summary.totalReviews} {summary.totalReviews > 1 ? t("reviews.reviews") : t("reviews.review")}
                  </strong>
                </>
              ) : (
                locale === "ar" ? "لا توجد تقييمات مسجلة بعد" : "Aucun avis client pour le moment"
              )}
            </p>

            {summary.totalReviews > 0 && (
              <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#4b9797]/10 border border-[#4b9797]/20 px-3 py-1 text-xs font-bold text-[#2C6466]">
                <Sparkles size={13} className="text-[#4b9797] shrink-0" />
                <span>{summary.recommendPercentage}% {t("reviews.recommended")}</span>
              </div>
            )}
          </div>

          {/* Right Column (End in RTL/LTR): 5-to-1 Star Progress Bars */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {([5, 4, 3, 2, 1] as const).map((starNum) => {
              const count = summary.starCounts[starNum];
              const pct = summary.starPercentages[starNum];

              return (
                <div key={starNum} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center justify-end gap-1 w-10 shrink-0 font-bold text-slate-700 tabular-nums">
                    <span>{starNum}</span>
                    <Star size={13} fill="currentColor" className="text-[#ffbf00] shrink-0" />
                  </div>

                  {/* Progress Bar Track */}
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ffbf00] to-[#f59e0b] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-10 text-end text-xs font-semibold text-slate-400 tabular-nums shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. REVIEWS LIST (2-Column Enterprise Cards Grid) */}
      {isLoading ? (
        <div className="py-12 grid place-items-center">
          <div className="flex flex-col items-center gap-2">
            <LoaderCircle size={24} className="animate-spin text-[#4b9797]" />
            <p className="text-xs text-slate-500">
              {locale === "ar" ? "جاري تحميل التقييمات..." : "Chargement des avis..."}
            </p>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-slate-200 rounded-2xl p-8 sm:p-12 text-center bg-white shadow-sm">
          <div className="grid size-12 place-items-center rounded-2xl bg-[#4b9797]/10 mx-auto text-[#4b9797] mb-3">
            <MessageSquare size={22} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {t("reviews.empty")}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {t("reviews.emptySub")}
          </p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ff3500] hover:bg-[#e03000] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <PenLine size={14} />
            <span>{t("reviews.write")}</span>
          </button>
        </div>
      ) : (
        /* 2-Column Enterprise Review Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((rev) => {
            const initial = (rev.author_name || "P").trim().charAt(0).toUpperCase();
            const dateStr = rev.created_at
              ? new Date(rev.created_at).toLocaleDateString(
                  locale === "ar" ? "ar-MA-u-nu-latn" : "fr-FR",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )
              : "";

            return (
              <article
                key={rev.id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-4"
              >
                {/* Header Row (Author & Rating) */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Start: Avatar + Name + Verified Badge + Role */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Circular Gradient Brand Teal Avatar */}
                    <div className="size-11 rounded-full bg-gradient-to-br from-[#4b9797] to-[#2C6466] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 select-none">
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {rev.author_name}
                        </h4>
                        {rev.is_verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#4b9797]/10 border border-[#4b9797]/20 px-2 py-0.5 text-[11px] font-semibold text-[#2C6466]">
                            <BadgeCheck size={12} className="text-[#4b9797] shrink-0" />
                            <span>{t("reviews.verified")}</span>
                          </span>
                        )}
                      </div>

                      {rev.author_role && (
                        <p className="mt-0.5 text-xs font-medium text-slate-500 truncate">
                          {rev.author_role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* End (Right in LTR, Left in RTL): 5-Star Rating & Date */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 ps-14 sm:ps-0">
                    <div
                      className="flex items-center gap-0.5 text-[#ffbf00]"
                      aria-label={`${rev.rating} / 5`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={cn(
                            i < rev.rating
                              ? "fill-[#ffbf00] text-[#ffbf00]"
                              : "fill-slate-100 text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    {dateStr && (
                      <time
                        dateTime={rev.created_at}
                        className="text-[11px] font-medium text-slate-400 whitespace-nowrap"
                      >
                        {dateStr}
                      </time>
                    )}
                  </div>
                </div>

                {/* Clean Natural Review Typography (No Awkward Inner Box) */}
                <p
                  className={cn(
                    "text-slate-700 text-sm leading-relaxed font-normal text-start",
                    locale === "ar" && "font-sans leading-loose"
                  )}
                >
                  {rev.comment}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
