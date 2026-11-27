import { ADMIN_ORDERS_PATH, ADMIN_REVIEWS_PATH } from "@/lib/admin-config";
import { fetchSyncedCODOrders, type CODOrder } from "@/lib/cod-service";
import type { ProductReview } from "@/lib/reviews-service";

export type AdminNotificationType = "order" | "review";

export interface AdminNotificationItem {
  id: string;
  type: AdminNotificationType;
  summary: string;
  meta: string;
  createdAt: string;
  href: string;
  isRead: boolean;
}

const READ_NOTIFICATIONS_STORAGE_KEY = "teflook_admin_read_notifications_v1";
const MAX_STORED_READ_IDS = 500;

export function getReadNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
    }
  } catch {}
  return [];
}

function saveReadNotificationIds(ids: string[]): string[] {
  const deduped = Array.from(new Set(ids)).slice(-MAX_STORED_READ_IDS);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        READ_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(deduped)
      );
      window.dispatchEvent(
        new CustomEvent("teflook:notifications-read-updated", { detail: deduped })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("teflook_sync");
        bc.postMessage({ type: "notifications-read-updated", readIds: deduped });
        bc.close();
      }
    } catch {}
  }
  return deduped;
}

export function markNotificationRead(id: string): string[] {
  const existing = getReadNotificationIds();
  if (existing.includes(id)) return existing;
  return saveReadNotificationIds([...existing, id]);
}

export function markAllNotificationsRead(ids: string[]): string[] {
  const existing = getReadNotificationIds();
  return saveReadNotificationIds([...existing, ...ids]);
}

export function mapOrderToNotification(
  raw: Partial<CODOrder> & Record<string, any>,
  readIds: Set<string>
): AdminNotificationItem {
  const orderId = String(raw.id || "");
  const totalMad = Number(raw.totalMad ?? raw.total_mad ?? 0);
  const city = String(raw.customerCity ?? raw.customer_city ?? "").trim();
  const customerName = String(
    raw.customerName ?? raw.customer_name ?? ""
  ).trim();
  const createdAt = String(
    raw.createdAt ?? raw.created_at ?? new Date().toISOString()
  );

  const notifId = `order:${orderId}`;
  const citySuffix = city && city !== "-" ? ` — ${city}` : "";

  return {
    id: notifId,
    type: "order",
    summary: `Nouvelle commande COD • ${totalMad} MAD${citySuffix}`,
    meta: customerName ? `${customerName} • #${orderId}` : `#${orderId}`,
    createdAt,
    href: ADMIN_ORDERS_PATH,
    isRead: readIds.has(notifId),
  };
}

export function mapReviewToNotification(
  raw: Partial<ProductReview> & Record<string, any>,
  readIds: Set<string>
): AdminNotificationItem {
  const reviewId = String(raw.id || "");
  const authorName = String(
    raw.author_name ?? raw.authorName ?? "Parent"
  ).trim();
  const rating = Math.max(1, Math.min(5, Number(raw.rating ?? 5) || 5));
  const createdAt = String(
    raw.created_at ?? raw.createdAt ?? new Date().toISOString()
  );

  const notifId = `review:${reviewId}`;

  return {
    id: notifId,
    type: "review",
    summary: "Nouvel avis client soumis",
    meta: `${authorName} • ${rating}/5 ★`,
    createdAt,
    href: ADMIN_REVIEWS_PATH,
    isRead: readIds.has(notifId),
  };
}

export async function fetchRecentAdminNotifications(): Promise<
  AdminNotificationItem[]
> {
  const readIds = new Set(getReadNotificationIds());

  const [ordersResult, reviewsResult] = await Promise.allSettled([
    fetchSyncedCODOrders(),
    fetch("/api/reviews", { cache: "no-store" }).then((res) =>
      res.ok ? res.json() : []
    ),
  ]);

  const orders: CODOrder[] =
    ordersResult.status === "fulfilled" && Array.isArray(ordersResult.value)
      ? ordersResult.value.slice(0, 12)
      : [];

  const reviews: ProductReview[] =
    reviewsResult.status === "fulfilled" && Array.isArray(reviewsResult.value)
      ? reviewsResult.value.slice(0, 8)
      : [];

  const items: AdminNotificationItem[] = [
    ...orders
      .filter((o) => Boolean(o?.id))
      .map((o) => mapOrderToNotification(o, readIds)),
    ...reviews
      .filter((r) => Boolean(r?.id))
      .map((r) => mapReviewToNotification(r, readIds)),
  ];

  return items
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 18);
}

export function formatRelativeTimeFr(
  isoDate: string,
  nowMs: number = Date.now()
): string {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) return "Récemment";

  const diffSeconds = Math.max(0, Math.floor((nowMs - timestamp) / 1000));
  if (diffSeconds < 60) return "À l'instant";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays} j`;

  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

let sharedAudioContext: AudioContext | null = null;

export function unlockNotificationAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioCtx();
    }
    if (sharedAudioContext.state === "suspended") {
      void sharedAudioContext.resume().catch(() => {});
    }
  } catch {}
}

/**
 * Play a subtle two-tone Web Audio chime without external audio assets.
 */
export function playNotificationChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!sharedAudioContext || sharedAudioContext.state === "closed") {
      sharedAudioContext = new AudioCtx();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 783.99, start: now, duration: 0.14 }, // G5
      { freq: 1046.5, start: now + 0.11, duration: 0.24 }, // C6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, note.start);

      gain.gain.setValueAtTime(0.0001, note.start);
      gain.gain.exponentialRampToValueAtTime(0.075, note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        note.start + note.duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(note.start);
      osc.stop(note.start + note.duration + 0.02);
    }
  } catch {
    // Ignore audio context autoplay restrictions cleanly
  }
}
