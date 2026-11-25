export type WhatsAppPosition = "right" | "left";

export interface SiteSettings {
  whatsapp_phone: string;
  whatsapp_enabled: boolean;
  whatsapp_position: WhatsAppPosition;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp_phone: "+212600000000",
  whatsapp_enabled: true,
  whatsapp_position: "right",
};

const STORAGE_KEY = "teflook_site_settings_v1";

/**
 * Clean and standardize any phone number into a format compatible with WhatsApp wa.me URL.
 * Automatically formats local Moroccan numbers (06XXXXXXXX -> 2126XXXXXXXX).
 */
export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return "";

  // Remove whitespace, dashes, parens, plus, dots
  let cleaned = phone.replace(/[\s\-\(\)\+\.]/g, "").trim();

  // Strip international 00 prefix (e.g. 002126... -> 2126...)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Handle accidental +212 06... -> 2126...
  if (/^2120[5-7]\d{8}$/.test(cleaned)) {
    cleaned = `212${cleaned.substring(4)}`;
  }

  // If local Moroccan number starting with 0 (e.g. 0661234567, 07..., 05...)
  if (/^0[5-7]\d{8}$/.test(cleaned)) {
    cleaned = `212${cleaned.substring(1)}`;
  }

  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, "");

  return cleaned;
}

function normalizePosition(pos: unknown): WhatsAppPosition {
  return pos === "left" ? "left" : "right";
}

/**
 * Fetch live settings from /api/settings (no-store) with localStorage fallback on network failure.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/settings", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error && typeof data.whatsapp_phone === "string" && data.whatsapp_phone.trim()) {
          const normalized: SiteSettings = {
            whatsapp_phone: data.whatsapp_phone.trim(),
            whatsapp_enabled: data.whatsapp_enabled !== false,
            whatsapp_position: normalizePosition(data.whatsapp_position),
            updated_at: data.updated_at,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          } catch {}
          return normalized;
        }
      }
    } catch (e) {
      console.warn("fetchSiteSettings network error:", e);
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed.whatsapp_phone === "string" && parsed.whatsapp_phone.trim()) {
          return {
            whatsapp_phone: parsed.whatsapp_phone.trim(),
            whatsapp_enabled: parsed.whatsapp_enabled !== false,
            whatsapp_position: normalizePosition(parsed.whatsapp_position),
            updated_at: parsed.updated_at,
          };
        }
      }
    } catch {}
  }

  return DEFAULT_SITE_SETTINGS;
}

/**
 * Save settings to Supabase via /api/settings
 */
export async function saveSiteSettings(
  settings: Partial<SiteSettings>
): Promise<{ success: boolean; data?: SiteSettings; error?: string }> {
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const json = await res.json();
    if (!res.ok || json.error || !json.success) {
      return {
        success: false,
        error: json.error || "Impossible d'enregistrer les paramètres dans Supabase.",
      };
    }

    const normalizedData: SiteSettings = {
      whatsapp_phone: json.data.whatsapp_phone,
      whatsapp_enabled: json.data.whatsapp_enabled !== false,
      whatsapp_position: normalizePosition(json.data.whatsapp_position),
      updated_at: json.data.updated_at,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedData));
        window.dispatchEvent(new CustomEvent("teflook:settings-updated", { detail: normalizedData }));
      } catch {}
    }

    return { success: true, data: normalizedData };
  } catch (e) {
    console.error("saveSiteSettings network error:", e);
    return { success: false, error: "Erreur réseau lors de la sauvegarde." };
  }
}
