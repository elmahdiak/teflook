"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LoaderCircle,
  MessageSquare,
  MessageSquarePlus,
  PenLine,
  Pencil,
  Quote,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressReviewImage } from "@/lib/compress-image";
import {
  ProductReview,
  ProductRatingSummary,
  type StoredReviewOwnership,
  calculateRatingSummary,
  fetchReviewsByProduct,
  formatEditCountdown,
  formatReviewDate,
  getRemainingEditMs,
  getReviewImages,
  getStoredReviewTokens,
  submitProductReview,
  updateProductReview,
} from "@/lib/reviews-service";
import { useTefLookLanguage } from "@/lib/teflook-language";
import { cn } from "@/lib/utils";

const MAX_REVIEW_IMAGES = 3;

interface AttachedReviewPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

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
  const [attachedPhotos, setAttachedPhotos] = useState<AttachedReviewPhoto[]>([]);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [isCompressingImages, setIsCompressingImages] = useState(false);
  const [lightboxState, setLightboxState] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [ownedTokens, setOwnedTokens] = useState<
    Record<string, StoredReviewOwnership>
  >({});
  const [nowMs, setNowMs] = useState<number>(0);

  // Inline Edit State
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editAuthorName, setEditAuthorName] = useState("");
  const [editAuthorRole, setEditAuthorRole] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editExistingUrls, setEditExistingUrls] = useState<string[]>([]);
  const [editNewPhotos, setEditNewPhotos] = useState<AttachedReviewPhoto[]>([]);
  const [editPhotoNotice, setEditPhotoNotice] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditCompressing, setIsEditCompressing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<AttachedReviewPhoto[]>([]);
  const editPhotosRef = useRef<AttachedReviewPhoto[]>([]);

  useEffect(() => {
    setOwnedTokens(getStoredReviewTokens());
    setNowMs(Date.now());
  }, []);

  useEffect(() => {
    photosRef.current = attachedPhotos;
  }, [attachedPhotos]);

  useEffect(() => {
    editPhotosRef.current = editNewPhotos;
  }, [editNewPhotos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      editPhotosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!lightboxState) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxState(null);
      } else if (e.key === "ArrowRight" && lightboxState.images.length > 1) {
        setLightboxState((prev) =>
          prev
            ? { ...prev, index: (prev.index + 1) % prev.images.length }
            : null
        );
      } else if (e.key === "ArrowLeft" && lightboxState.images.length > 1) {
        setLightboxState((prev) =>
          prev
            ? {
                ...prev,
                index: (prev.index - 1 + prev.images.length) % prev.images.length,
              }
            : null
        );
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [lightboxState]);

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

  async function processSelectedImageFiles(
    selectedFiles: File[],
    currentCount: number
  ): Promise<{
    photos: AttachedReviewPhoto[];
    notice: string | null;
    error: string | null;
  }> {
    const remainingSlots = MAX_REVIEW_IMAGES - currentCount;
    const maxNotice =
      locale === "ar" ? "الحد الأقصى 3 صور لكل تقييم" : "Maximum 3 photos par avis";

    if (remainingSlots <= 0) {
      return { photos: [], notice: maxNotice, error: null };
    }

    const notice = selectedFiles.length > remainingSlots ? maxNotice : null;
    const filesToCompress = selectedFiles.slice(0, remainingSlots);
    const results = await Promise.allSettled(
      filesToCompress.map((file) => compressReviewImage(file))
    );

    const photos: AttachedReviewPhoto[] = [];
    let error: string | null = null;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        photos.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: result.value,
          previewUrl: URL.createObjectURL(result.value),
        });
      } else if (!error) {
        error =
          result.reason instanceof Error
            ? result.reason.message
            : locale === "ar"
            ? "تعذر تحسين إحدى الصور المختارة."
            : "Impossible d'optimiser l'une des images sélectionnées.";
      }
    });

    return { photos, notice, error };
  }

  async function handleImagesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (selectedFiles.length === 0) return;

    setFormError(null);
    setIsCompressingImages(true);

    try {
      const { photos, notice, error } = await processSelectedImageFiles(
        selectedFiles,
        attachedPhotos.length
      );
      setPhotoNotice(notice);
      if (photos.length > 0) {
        setAttachedPhotos((prev) => [...prev, ...photos].slice(0, MAX_REVIEW_IMAGES));
      }
      if (error) {
        setFormError(error);
      }
    } finally {
      setIsCompressingImages(false);
    }
  }

  function handleRemovePhoto(photoId: string) {
    setPhotoNotice(null);
    setAttachedPhotos((prev) => {
      const target = prev.find((p) => p.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }

  function startEditingReview(rev: ProductReview) {
    editPhotosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setEditingReviewId(rev.id);
    setEditRating(Math.max(1, Math.min(5, Math.round(rev.rating || 5))));
    setEditHoverRating(0);
    setEditAuthorName(rev.author_name || "");
    setEditAuthorRole(rev.author_role || "");
    setEditComment(rev.comment || "");
    setEditExistingUrls(getReviewImages(rev));
    setEditNewPhotos([]);
    setEditPhotoNotice(null);
    setEditError(null);
  }

  function cancelEditingReview() {
    editPhotosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setEditingReviewId(null);
    setEditNewPhotos([]);
    setEditExistingUrls([]);
    setEditPhotoNotice(null);
    setEditError(null);
  }

  async function handleEditImagesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (selectedFiles.length === 0) return;

    setEditError(null);
    setIsEditCompressing(true);

    try {
      const currentTotal = editExistingUrls.length + editNewPhotos.length;
      const { photos, notice, error } = await processSelectedImageFiles(
        selectedFiles,
        currentTotal
      );
      setEditPhotoNotice(notice);
      if (photos.length > 0) {
        setEditNewPhotos((prev) =>
          [...prev, ...photos].slice(
            0,
            Math.max(0, MAX_REVIEW_IMAGES - editExistingUrls.length)
          )
        );
      }
      if (error) {
        setEditError(error);
      }
    } finally {
      setIsEditCompressing(false);
    }
  }

  function handleRemoveEditExistingUrl(urlToRemove: string) {
    setEditPhotoNotice(null);
    setEditExistingUrls((prev) => prev.filter((u) => u !== urlToRemove));
  }

  function handleRemoveEditNewPhoto(photoId: string) {
    setEditPhotoNotice(null);
    setEditNewPhotos((prev) => {
      const target = prev.find((p) => p.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  }

  useEffect(() => {
    if (!nowMs) return;

    const hasActiveEditWindow =
      editingReviewId !== null ||
      reviews.some((rev) => {
        const ownership = ownedTokens[rev.id];
        if (!ownership) return false;
        return getRemainingEditMs(rev.created_at, ownership.createdAt, nowMs) > 0;
      });

    if (!hasActiveEditWindow) return;

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [nowMs, reviews, ownedTokens, editingReviewId]);

  useEffect(() => {
    if (!editingReviewId || !nowMs) return;
    const activeReview = reviews.find((r) => r.id === editingReviewId);
    const ownership = ownedTokens[editingReviewId];
    const remaining = activeReview
      ? getRemainingEditMs(activeReview.created_at, ownership?.createdAt, nowMs)
      : 0;

    if (remaining <= 0) {
      cancelEditingReview();
      setToastMessage(
        locale === "ar"
          ? "انتهت مهلة التعديل (30 ثانية)."
          : "Le délai de modification (30 secondes) est expiré."
      );
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, [nowMs, editingReviewId, reviews, ownedTokens, locale]);

  async function handleSaveEdit(e: React.FormEvent, revId: string) {
    e.preventDefault();
    if (isEditCompressing || isSavingEdit) return;
    if (!editAuthorName.trim() || !editComment.trim()) {
      setEditError(
        locale === "ar"
          ? "يرجى ملء الاسم ونص التقييم."
          : "Veuillez remplir votre nom et votre avis."
      );
      return;
    }

    const ownership = ownedTokens[revId];
    if (!ownership?.token) {
      setEditError(
        locale === "ar"
          ? "غير مصرح بتعديل هذا التقييم من هذا المتصفح."
          : "Modification non autorisée depuis ce navigateur."
      );
      return;
    }

    setEditError(null);
    setIsSavingEdit(true);

    const res = await updateProductReview({
      id: revId,
      editToken: ownership.token,
      authorName: editAuthorName.trim(),
      authorRole: editAuthorRole.trim(),
      rating: editRating,
      comment: editComment.trim(),
      existingImageUrls: editExistingUrls,
      newImageFiles: editNewPhotos.map((p) => p.file),
    });

    setIsSavingEdit(false);

    if (res.success && res.review) {
      setReviews((prev) =>
        prev.map((item) => (item.id === revId ? res.review! : item))
      );
      if (res.summary && onSummaryCalculatedRef.current) {
        onSummaryCalculatedRef.current(res.summary);
      }
      cancelEditingReview();
      setToastMessage(
        locale === "ar"
          ? "تم تحديث تقييمك بنجاح!"
          : "Votre avis a été mis à jour avec succès !"
      );
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      setEditError(
        res.error ||
          (locale === "ar"
            ? "تعذر حفظ التعديلات."
            : "Erreur lors de la mise à jour de l'avis.")
      );
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (isCompressingImages || isSubmitting) return;
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
      imageFiles: attachedPhotos.map((p) => p.file),
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      if (res.editToken) {
        const parsedCreated = res.review.created_at
          ? new Date(res.review.created_at).getTime()
          : NaN;
        const createdAtMs =
          Number.isFinite(parsedCreated) && parsedCreated > 0
            ? parsedCreated
            : Date.now();
        setOwnedTokens((prev) => ({
          ...prev,
          [res.review!.id]: { token: res.editToken!, createdAt: createdAtMs },
        }));
        setNowMs(Date.now());
      }
      setReviews((prev) => [res.review!, ...prev]);
      setIsFormOpen(false);
      setAuthorName("");
      setAuthorRole("");
      setComment("");
      setRating(5);
      attachedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setAttachedPhotos([]);
      setPhotoNotice(null);
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

              {/* Optional Multi-Photo Upload (Max 3) with Client-Side WebP Compression */}
              <div className="space-y-2.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {locale === "ar"
                    ? `أضف صور (${attachedPhotos.length}/3)`
                    : `Ajouter des photos (${attachedPhotos.length}/3)`}
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => void handleImagesSelect(e)}
                  className="sr-only"
                />

                {attachedPhotos.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {attachedPhotos.map((photo, idx) => (
                      <div key={photo.id} className="relative group/preview">
                        <img
                          src={photo.previewUrl}
                          alt={
                            locale === "ar"
                              ? `معاينة الصورة ${idx + 1}`
                              : `Aperçu photo ${idx + 1}`
                          }
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <span className="absolute bottom-1 start-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                          {Math.max(1, Math.round(photo.file.size / 1024))}{" "}
                          {locale === "ar" ? "ك.ب" : "Ko"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          aria-label={locale === "ar" ? "إزالة الصورة" : "Supprimer la photo"}
                          className="absolute -top-2 -end-2 grid size-6 place-items-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-colors cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isCompressingImages && (
                  <div className="flex items-center justify-center gap-2.5 rounded-xl border border-[#4b9797]/40 bg-[#4b9797]/5 px-4 py-3 text-xs sm:text-sm font-semibold text-[#1A3C34]">
                    <LoaderCircle size={17} className="animate-spin text-[#4b9797]" />
                    <span>
                      {locale === "ar"
                        ? "جاري تحسين الصور..."
                        : "Optimisation des images..."}
                    </span>
                  </div>
                )}

                {attachedPhotos.length < MAX_REVIEW_IMAGES && !isCompressingImages && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#4b9797]/45 bg-[#FBF9F5] hover:border-[#4b9797] hover:bg-[#4b9797]/5 px-4 py-3.5 text-xs sm:text-sm font-semibold text-[#1A3C34] transition-colors cursor-pointer"
                  >
                    <ImagePlus size={18} className="text-[#4b9797] shrink-0" />
                    <span>
                      {locale === "ar"
                        ? `إضافة صور (${attachedPhotos.length}/3)`
                        : `Ajouter des photos (${attachedPhotos.length}/3)`}
                    </span>
                  </button>
                )}

                {photoNotice && (
                  <p className="text-xs font-semibold text-[#ff3500]">
                    {photoNotice}
                  </p>
                )}
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
                  disabled={isSubmitting || isCompressingImages}
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
        /* 2-Column Centered Editorial Review Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4">
          {reviews.map((rev) => {
            const isAr = locale === "ar";
            const ownership = ownedTokens[rev.id];
            const remainingEditMs = ownership
              ? getRemainingEditMs(rev.created_at, ownership.createdAt, nowMs)
              : 0;
            const canEdit = Boolean(ownership?.token && nowMs > 0 && remainingEditMs > 0);
            const countdownLabel = formatEditCountdown(remainingEditMs);
            const formattedDate = formatReviewDate(rev.created_at, locale);
            const isEditing = editingReviewId === rev.id;
            const bottomTag = rev.author_role
              ? `${rev.author_role} • ${productTitle}`
              : productTitle;
            const totalEditPhotos = editExistingUrls.length + editNewPhotos.length;

            return (
              <article
                key={rev.id}
                dir={direction}
                className={cn(
                  "relative bg-slate-50/80 border rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(26,60,52,0.06)] flex flex-col",
                  isEditing
                    ? "border-[#4b9797]/45 bg-white text-start items-stretch"
                    : "border-slate-100 items-center text-center"
                )}
              >
                {/* Floating Teal Circular Quote Badge */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -top-3 sm:-top-3.5 w-10 h-10 rounded-full bg-[#4b9797] text-white flex items-center justify-center shadow-md",
                    isAr ? "-left-3 sm:-left-3.5" : "-right-3 sm:-right-3.5"
                  )}
                >
                  <Quote className="w-4 h-4 fill-current" />
                </span>

                {isEditing ? (
                  <form
                    onSubmit={(e) => void handleSaveEdit(e, rev.id)}
                    className="space-y-4 w-full"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <h4
                        className={cn(
                          "font-display font-bold text-base sm:text-lg text-[#1A3C34]",
                          isAr && "font-sans"
                        )}
                      >
                        {isAr ? "تعديل تقييمك" : "Modifier votre avis"}
                      </h4>
                      <span
                        dir="ltr"
                        className="rounded-full bg-[#4b9797]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#4b9797] tabular-nums"
                      >
                        {countdownLabel}
                      </span>
                    </div>

                    {editError && (
                      <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-xs font-semibold text-rose-700">
                        {editError}
                      </div>
                    )}

                    {/* Inline Star Rating Selector */}
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        {t("reviews.ratingLabel")}
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starValue) => {
                          const isActive =
                            (editHoverRating || editRating) >= starValue;
                          return (
                            <button
                              type="button"
                              key={starValue}
                              onMouseEnter={() => setEditHoverRating(starValue)}
                              onMouseLeave={() => setEditHoverRating(0)}
                              onClick={() => setEditRating(starValue)}
                              aria-label={`${starValue} / 5`}
                              className="p-0.5 rounded-md hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                size={22}
                                className={cn(
                                  "transition-colors",
                                  isActive
                                    ? "text-[#ffbf00] fill-[#ffbf00]"
                                    : "text-slate-300 fill-transparent"
                                )}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inline Author Name & Optional Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          {t("reviews.nameLabel")} *
                        </label>
                        <input
                          type="text"
                          required
                          value={editAuthorName}
                          onChange={(e) => setEditAuthorName(e.target.value)}
                          className="w-full h-9 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#FBF9F5] focus:bg-white focus:border-[#4b9797] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          {t("reviews.roleLabel")}
                        </label>
                        <input
                          type="text"
                          value={editAuthorRole}
                          onChange={(e) => setEditAuthorRole(e.target.value)}
                          className="w-full h-9 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#FBF9F5] focus:bg-white focus:border-[#4b9797] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Inline Comment Textarea */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {t("reviews.commentLabel")} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-[#FBF9F5] focus:bg-white focus:border-[#4b9797] focus:outline-none resize-y"
                      />
                    </div>

                    {/* Inline Multi-Photo Manager (Max 3) */}
                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {isAr
                          ? `الصور (${totalEditPhotos}/3)`
                          : `Photos (${totalEditPhotos}/3)`}
                      </span>

                      <input
                        ref={editFileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void handleEditImagesSelect(e)}
                        className="sr-only"
                      />

                      {totalEditPhotos > 0 && (
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {editExistingUrls.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative">
                              <img
                                src={url}
                                alt={`Photo ${idx + 1}`}
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEditExistingUrl(url)}
                                aria-label={isAr ? "إزالة الصورة" : "Supprimer la photo"}
                                className="absolute -top-2 -end-2 grid size-5 place-items-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 shadow-xs cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          {editNewPhotos.map((photo, idx) => (
                            <div key={photo.id} className="relative">
                              <img
                                src={photo.previewUrl}
                                alt={`Nouvelle photo ${idx + 1}`}
                                className="w-16 h-16 rounded-xl object-cover border border-[#4b9797]/40"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEditNewPhoto(photo.id)}
                                aria-label={isAr ? "إزالة الصورة" : "Supprimer la photo"}
                                className="absolute -top-2 -end-2 grid size-5 place-items-center rounded-full bg-white border border-slate-200 text-slate-600 hover:text-rose-600 shadow-xs cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {isEditCompressing && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#4b9797]">
                          <LoaderCircle size={15} className="animate-spin" />
                          <span>
                            {isAr
                              ? "جاري تحسين الصور..."
                              : "Optimisation des images..."}
                          </span>
                        </div>
                      )}

                      {totalEditPhotos < MAX_REVIEW_IMAGES && !isEditCompressing && (
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-dashed border-[#4b9797]/45 bg-[#FBF9F5] hover:border-[#4b9797] px-3 py-2 text-xs font-semibold text-[#1A3C34] transition-colors cursor-pointer"
                        >
                          <ImagePlus size={15} className="text-[#4b9797]" />
                          <span>
                            {isAr
                              ? `إضافة صور (${totalEditPhotos}/3)`
                              : `Ajouter des photos (${totalEditPhotos}/3)`}
                          </span>
                        </button>
                      )}

                      {editPhotoNotice && (
                        <p className="text-xs font-semibold text-[#ff3500]">
                          {editPhotoNotice}
                        </p>
                      )}
                    </div>

                    {/* Save & Cancel Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={cancelEditingReview}
                        disabled={isSavingEdit}
                        className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isAr ? "إلغاء" : "Annuler"}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingEdit || isEditCompressing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#4b9797] hover:bg-[#3a7d7d] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingEdit && <LoaderCircle size={13} className="animate-spin" />}
                        <span>
                          {isSavingEdit
                            ? isAr
                              ? "جاري الحفظ..."
                              : "Enregistrement..."
                            : isAr
                            ? "حفظ"
                            : "Enregistrer"}
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Centered 5-Star Rating Row */}
                    <div
                      className="text-[#ffbf00] flex items-center justify-center gap-1 mb-3"
                      aria-label={`${rev.rating} / 5`}
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={cn(
                            i < rev.rating
                              ? "fill-[#ffbf00] text-[#ffbf00]"
                              : "fill-slate-200/70 text-slate-200"
                          )}
                        />
                      ))}
                    </div>

                    {/* Centered Reviewer Name */}
                    <h4
                      className={cn(
                        "font-display font-bold text-lg sm:text-xl text-[#1A3C34] mb-3",
                        isAr && "font-sans"
                      )}
                    >
                      {rev.author_name}
                    </h4>

                    {/* Centered Review Comment */}
                    <p
                      className={cn(
                        "font-sans text-sm sm:text-base text-[#3D524D] leading-relaxed mb-6 max-w-xl",
                        isAr && "leading-loose"
                      )}
                    >
                      {rev.comment}
                    </p>

                    {/* Optional Customer Multi-Photo Thumbnails (1 to 3) */}
                    {(() => {
                      const reviewImages = getReviewImages(rev);
                      if (reviewImages.length === 0) return null;
                      return (
                        <div className="flex items-center justify-center gap-2.5 flex-wrap mb-5">
                          {reviewImages.map((imgUrl, idx) => (
                            <button
                              key={`${rev.id}-img-${idx}`}
                              type="button"
                              onClick={() =>
                                setLightboxState({ images: reviewImages, index: idx })
                              }
                              aria-label={
                                isAr
                                  ? `تكبير الصورة ${idx + 1} لتقييم ${rev.author_name}`
                                  : `Agrandir la photo ${idx + 1} de l'avis de ${rev.author_name}`
                              }
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b9797] rounded-xl cursor-zoom-in"
                            >
                              <img
                                src={imgUrl}
                                alt={
                                  isAr
                                    ? `صورة تقييم ${rev.author_name} (${idx + 1})`
                                    : `Photo de l'avis de ${rev.author_name} (${idx + 1})`
                                }
                                loading="lazy"
                                decoding="async"
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 hover:scale-105 transition-transform shadow-xs"
                              />
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Subtle Horizontal Separator */}
                    <div className="w-full border-t border-slate-200/80 mb-4 mt-auto" />

                    {/* Bottom Product Reference / Verified Author Tag + Date + Owner Edit Action */}
                    <div
                      className={cn(
                        "font-sans text-xs sm:text-sm text-slate-500 font-medium flex flex-col items-center justify-center gap-1.5",
                        isAr && "font-sans"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5">
                          {rev.is_verified && (
                            <BadgeCheck
                              size={15}
                              className="text-[#4b9797] shrink-0"
                              aria-label={t("reviews.verified")}
                            />
                          )}
                          <span>{bottomTag}</span>
                        </span>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => startEditingReview(rev)}
                            className="inline-flex items-center gap-1 rounded-full border border-[#4b9797]/30 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#4b9797] hover:bg-[#4b9797] hover:text-white transition-colors cursor-pointer tabular-nums"
                          >
                            <Pencil size={11} aria-hidden="true" />
                            <span>
                              {isAr
                                ? `تعديل (${countdownLabel})`
                                : `Modifier (${countdownLabel})`}
                            </span>
                          </button>
                        )}
                      </div>

                      {formattedDate && (
                        <time
                          dateTime={rev.created_at}
                          className="text-xs text-slate-400 font-normal"
                        >
                          {formattedDate}
                        </time>
                      )}
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Full-Screen Multi-Image Lightbox Preview */}
      {lightboxState && lightboxState.images.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "ar" ? "عرض صور التقييم" : "Aperçu des photos"}
          onClick={() => setLightboxState(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <button
            type="button"
            onClick={() => setLightboxState(null)}
            aria-label={locale === "ar" ? "إغلاق" : "Fermer"}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {lightboxState.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxState((prev) =>
                    prev
                      ? {
                          ...prev,
                          index:
                            (prev.index - 1 + prev.images.length) %
                            prev.images.length,
                        }
                      : null
                  );
                }}
                aria-label={locale === "ar" ? "الصورة السابقة" : "Photo précédente"}
                className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft
                  size={22}
                  className={cn(locale === "ar" && "rotate-180")}
                />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxState((prev) =>
                    prev
                      ? {
                          ...prev,
                          index: (prev.index + 1) % prev.images.length,
                        }
                      : null
                  );
                }}
                aria-label={locale === "ar" ? "الصورة التالية" : "Photo suivante"}
                className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight
                  size={22}
                  className={cn(locale === "ar" && "rotate-180")}
                />
              </button>
            </>
          )}

          <div
            className="flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxState.images[lightboxState.index]}
              alt={
                locale === "ar"
                  ? `صورة تقييم العميل (${lightboxState.index + 1}/${lightboxState.images.length})`
                  : `Photo du client (${lightboxState.index + 1}/${lightboxState.images.length})`
              }
              className="max-h-[82vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            />
            {lightboxState.images.length > 1 && (
              <span
                dir="ltr"
                className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold text-white tabular-nums"
              >
                {lightboxState.index + 1} / {lightboxState.images.length}
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
