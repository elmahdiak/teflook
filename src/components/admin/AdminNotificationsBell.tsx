"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, ShoppingBag, Star, X } from "lucide-react";
import {
  fetchRecentAdminNotifications,
  formatRelativeTimeFr,
  getReadNotificationIds,
  mapOrderToNotification,
  mapReviewToNotification,
  markAllNotificationsRead,
  markNotificationRead,
  playNotificationChime,
  unlockNotificationAudio,
  type AdminNotificationItem,
} from "@/lib/admin-notifications";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

export function AdminNotificationsBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<AdminNotificationItem | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLiveAlert = useCallback((item: AdminNotificationItem) => {
    setLiveToast(item);
    playNotificationChime();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setLiveToast(null);
    }, 6000);
  }, []);

  const pushIncomingNotification = useCallback(
    (incoming: AdminNotificationItem) => {
      if (!incoming.id) return;
      const isBrandNew = !knownIdsRef.current.has(incoming.id);
      knownIdsRef.current.add(incoming.id);

      setNotifications((prev) => {
        const filtered = prev.filter((item) => item.id !== incoming.id);
        return [incoming, ...filtered].slice(0, 18);
      });

      if (isBrandNew && !incoming.isRead) {
        showLiveAlert(incoming);
      }
    },
    [showLiveAlert]
  );

  const syncNotifications = useCallback(async () => {
    try {
      const latest = await fetchRecentAdminNotifications();
      const firstNewUnread = isInitializedRef.current
        ? latest.find((item) => !knownIdsRef.current.has(item.id) && !item.isRead)
        : undefined;

      for (const item of latest) {
        knownIdsRef.current.add(item.id);
      }
      isInitializedRef.current = true;
      setNotifications(latest);

      if (firstNewUnread) {
        showLiveAlert(firstNewUnread);
      }
    } catch {}
  }, [showLiveAlert]);

  useEffect(() => {
    void syncNotifications();

    // Keep relative timestamps fresh every minute while mounted
    const tickInterval = setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    // Lightweight fallback poll so events from other devices still arrive even if Supabase Realtime publication is disabled
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void syncNotifications();
      }
    }, 25_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void syncNotifications();
      }
    };

    const syncReadFromStorage = () => {
      const readSet = new Set(getReadNotificationIds());
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: readSet.has(item.id) }))
      );
    };

    const handleCustomOrder = (e: Event) => {
      const order = (e as CustomEvent).detail;
      if (order?.id) {
        const readSet = new Set(getReadNotificationIds());
        pushIncomingNotification(mapOrderToNotification(order, readSet));
      }
    };

    const handleFirstInteraction = () => {
      unlockNotificationAudio();
      window.removeEventListener("pointerdown", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("teflook:cod-order-created", handleCustomOrder);
    window.addEventListener("teflook:notifications-read-updated", syncReadFromStorage);
    window.addEventListener("storage", syncReadFromStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("teflook_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "cod-order-created" && event.data.order?.id) {
          const readSet = new Set(getReadNotificationIds());
          pushIncomingNotification(
            mapOrderToNotification(event.data.order, readSet)
          );
        } else if (event.data?.type === "notifications-read-updated") {
          syncReadFromStorage();
        }
      };
    }

    // Supabase Realtime subscription on orders & product_reviews INSERT events
    const supabase = getSupabaseBrowserClient();
    const realtimeChannel = supabase
      ? supabase
          .channel("teflook-admin-notifications")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            (payload) => {
              const row = payload.new as Record<string, unknown> | undefined;
              if (!row?.id) return;
              const readSet = new Set(getReadNotificationIds());
              pushIncomingNotification(mapOrderToNotification(row, readSet));
            }
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "product_reviews" },
            (payload) => {
              const row = payload.new as Record<string, unknown> | undefined;
              if (!row?.id) return;
              const readSet = new Set(getReadNotificationIds());
              pushIncomingNotification(mapReviewToNotification(row, readSet));
            }
          )
          .subscribe()
      : null;

    return () => {
      clearInterval(tickInterval);
      clearInterval(pollInterval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("teflook:cod-order-created", handleCustomOrder);
      window.removeEventListener(
        "teflook:notifications-read-updated",
        syncReadFromStorage
      );
      window.removeEventListener("storage", syncReadFromStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channel) channel.close();
      if (supabase && realtimeChannel) {
        void supabase.removeChannel(realtimeChannel);
      }
    };
  }, [pushIncomingNotification, syncNotifications]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    const allIds = notifications.map((n) => n.id);
    const updatedReadSet = new Set(markAllNotificationsRead(allIds));
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: updatedReadSet.has(item.id) }))
    );
  }

  function handleNotificationClick(item: AdminNotificationItem) {
    markNotificationRead(item.id);
    setNotifications((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, isRead: true } : entry
      )
    );
    setIsOpen(false);
    setLiveToast(null);
    router.push(item.href);
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setNowMs(Date.now());
            setIsOpen((prev) => !prev);
          }}
          aria-expanded={isOpen}
          aria-label="Notifications"
          title="Notifications"
          className={cn(
            "relative grid size-9 sm:size-10 place-items-center rounded-xl transition-colors cursor-pointer",
            isOpen
              ? "bg-[#F3EFE6] text-[#4B9393]"
              : "text-[#1A3C34] hover:bg-[#F3EFE6] hover:text-[#4B9393]"
          )}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F67D56] text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs tabular-nums leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Card */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#4B9393]/20 rounded-2xl shadow-xl w-80 sm:w-96 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#4B9393]/15 bg-[#F3EFE6]/65">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-[#1A3C34]">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#F67D56]/15 px-2 py-0.5 text-[10px] font-bold text-[#F67D56] tabular-nums">
                    {unreadCount} non {unreadCount > 1 ? "lues" : "lue"}
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={unreadCount === 0}
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4B9393] hover:text-[#1A3C34] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Tout marquer comme lu</span>
              </button>
            </div>

            {/* Notification Items */}
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="mx-auto grid size-10 place-items-center rounded-full bg-[#F3EFE6] text-[#4B9393]">
                  <Bell size={18} />
                </div>
                <p className="text-xs font-semibold text-[#1A3C34]/70">
                  Aucune nouvelle notification
                </p>
              </div>
            ) : (
              <div>
                {unreadCount === 0 && (
                  <div className="px-4 py-2 bg-[#F3EFE6]/35 border-b border-[#4B9393]/10 text-[11px] font-medium text-[#4B9393]">
                    Aucune nouvelle notification
                  </div>
                )}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#4B9393]/10">
                {notifications.map((item) => {
                  const isOrder = item.type === "order";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer",
                        item.isRead
                          ? "bg-white hover:bg-[#F3EFE6]/45"
                          : "bg-[#F3EFE6]/45 hover:bg-[#F3EFE6]/75"
                      )}
                    >
                      <div
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-xl mt-0.5",
                          isOrder
                            ? "bg-[#F67D56]/15 text-[#F67D56]"
                            : "bg-[#4B9393]/15 text-[#4B9393]"
                        )}
                      >
                        {isOrder ? (
                          <ShoppingBag size={16} />
                        ) : (
                          <Star size={16} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p
                          className={cn(
                            "text-xs text-[#1A3C34] leading-snug",
                            item.isRead ? "font-medium" : "font-bold"
                          )}
                        >
                          {item.summary}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#1A3C34]/60">
                          <span className="truncate">{item.meta}</span>
                          <span>•</span>
                          <span className="shrink-0">
                            {formatRelativeTimeFr(item.createdAt, nowMs)}
                          </span>
                        </div>
                      </div>

                      {!item.isRead && (
                        <span
                          aria-label="Non lu"
                          className="size-2.5 shrink-0 rounded-full bg-[#F67D56] mt-1.5"
                        />
                      )}
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Non-intrusive Real-Time Arrival Toast */}
      {liveToast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 w-[min(calc(100vw-2.5rem),360px)] rounded-2xl border border-[#4B9393]/25 bg-white p-3.5 shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              liveToast.type === "order"
                ? "bg-[#F67D56] text-white"
                : "bg-[#4B9393] text-white"
            )}
          >
            {liveToast.type === "order" ? (
              <ShoppingBag size={16} />
            ) : (
              <Star size={16} />
            )}
          </div>

          <button
            type="button"
            onClick={() => handleNotificationClick(liveToast)}
            className="min-w-0 flex-1 text-left cursor-pointer"
          >
            <p className="text-xs font-bold text-[#1A3C34] leading-snug">
              {liveToast.summary}
            </p>
            <p className="text-[11px] text-[#4B9393] font-medium mt-0.5 truncate">
              {liveToast.meta} — Cliquer pour voir
            </p>
          </button>

          <button
            type="button"
            onClick={() => setLiveToast(null)}
            aria-label="Fermer la notification"
            className="grid size-6 shrink-0 place-items-center rounded-lg text-[#1A3C34]/50 hover:bg-[#F3EFE6] hover:text-[#1A3C34] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
