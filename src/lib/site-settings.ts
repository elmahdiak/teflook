export interface SiteSettings {
  whatsapp_phone: string;
  whatsapp_enabled: boolean;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  whatsapp_phone: "+212600000000",
  whatsapp_enabled: true,
};

const STORAGE_KEY = "teflook_site_settings_v1";

/**
 * Clean and standardize any phone number into a format compatible with WhatsApp wa.me URL.
 * Automatically formats local Moroccan numbers (06XXXXXXXX -> 2126XXXXXXXX).
 */
export function cleanWhatsAppNumber(phone: string): string {
  if (!phone) return "212600000000";

  // Remove whitespace, dashes, parens, plus
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "").trim();

  // If local Moroccan number starting with 0 (e.g. 0661234567 or 07...)
  if (/^0[5-7]\d{8}$/.test(cleaned)) {
    cleaned = `212${cleaned.substring(1)}`;
  }

  // Remove any remaining non-digit characters
  cleaned = cleaned.replace(/\D/g, "");

  return cleaned || "212600000000";
}

/**
 * Fetch settings from API / Supabase with localStorage backup
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.whatsapp_phone === "string") {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch (e) {
      console.warn("fetchSiteSettings error:", e);
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        return JSON.parse(local);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      return { success: false, error: json.error || "Impossible d'enregistrer les paramètres." };
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        window.dispatchEvent(new CustomEvent("teflook:settings-updated", { detail: json.data }));
      } catch {}
    }

    return { success: true, data: json.data };
  } catch (e) {
    console.error("saveSiteSettings network error:", e);
    return { success: false, error: "Erreur réseau lors de la sauvegarde." };
  }
}
