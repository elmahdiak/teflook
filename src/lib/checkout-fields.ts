export type CheckoutFieldType = "text" | "textarea" | "select" | "checkbox" | "number";

export interface CheckoutFieldConfig {
  id: string;
  field_key: string;
  label_fr: string;
  label_ar: string;
  field_type: CheckoutFieldType;
  is_required: boolean;
  is_enabled: boolean;
  display_order: number;
  placeholder_fr: string;
  placeholder_ar: string;
  options?: string[];
  is_system?: boolean;
}

export const MOROCCAN_CITIES_OPTIONS = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Mohammédia",
  "El Jadida",
  "Nador",
  "Béni Mellal",
  "Autre ville au Maroc",
];

export const DEFAULT_CHECKOUT_FIELDS: CheckoutFieldConfig[] = [
  {
    id: "field-full-name",
    field_key: "full_name",
    label_fr: "Nom et prénom",
    label_ar: "الاسم الكامل",
    field_type: "text",
    is_required: true,
    is_enabled: true,
    display_order: 1,
    placeholder_fr: "Ex: Fatima Zahra Alami",
    placeholder_ar: "مثال: فاطمة الزهراء العلمي",
    is_system: true,
  },
  {
    id: "field-phone",
    field_key: "phone",
    label_fr: "Numéro de téléphone portable",
    label_ar: "رقم الهاتف المحمول",
    field_type: "text",
    is_required: true,
    is_enabled: true,
    display_order: 2,
    placeholder_fr: "06 XX XX XX XX",
    placeholder_ar: "06 XX XX XX XX",
    is_system: true,
  },
  {
    id: "field-city",
    field_key: "city",
    label_fr: "Ville de livraison",
    label_ar: "مدينة التوصيل",
    field_type: "select",
    is_required: true,
    is_enabled: true,
    display_order: 3,
    placeholder_fr: "Sélectionnez votre ville",
    placeholder_ar: "اختر مدينتك",
    options: MOROCCAN_CITIES_OPTIONS,
    is_system: true,
  },
  {
    id: "field-neighborhood",
    field_key: "neighborhood",
    label_fr: "Quartier / Secteur",
    label_ar: "الحي أو المنطقة",
    field_type: "text",
    is_required: false,
    is_enabled: true,
    display_order: 4,
    placeholder_fr: "Ex: Maârif, Agdal...",
    placeholder_ar: "مثال: المعاريف، أكدال...",
    is_system: true,
  },
  {
    id: "field-address",
    field_key: "address",
    label_fr: "Adresse de livraison complète",
    label_ar: "عنوان التوصيل الكامل",
    field_type: "textarea",
    is_required: true,
    is_enabled: true,
    display_order: 5,
    placeholder_fr: "Rue, numéro de porte, étage, résidence...",
    placeholder_ar: "الشارع، رقم الباب، الطابق، الإقامة...",
    is_system: true,
  },
  {
    id: "field-notes",
    field_key: "notes",
    label_fr: "Instructions de livraison",
    label_ar: "ملاحظات التوصيل",
    field_type: "textarea",
    is_required: false,
    is_enabled: false,
    display_order: 6,
    placeholder_fr: "Créneau préféré, point de repère...",
    placeholder_ar: "الوقت المفضل، معلم قريب...",
    is_system: true,
  },
  {
    id: "field-gift-wrap",
    field_key: "gift_wrap",
    label_fr: "Emballage cadeau offert",
    label_ar: "تغليف هدية مجاني",
    field_type: "checkbox",
    is_required: false,
    is_enabled: false,
    display_order: 7,
    placeholder_fr: "Ajouter un emballage cadeau soigné",
    placeholder_ar: "إضافة تغليف هدية أنيق",
  },
];

const CHECKOUT_FIELDS_STORAGE_KEY = "teflook_checkout_fields_v1";

export const CHECKOUT_FIELDS_SQL_MIGRATION = `CREATE TABLE IF NOT EXISTS public.checkout_fields (
  id text PRIMARY KEY,
  field_key text NOT NULL UNIQUE,
  label_fr text NOT NULL,
  label_ar text NOT NULL DEFAULT '',
  field_type text NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'number')),
  is_required boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 1,
  placeholder_fr text NOT NULL DEFAULT '',
  placeholder_ar text NOT NULL DEFAULT '',
  options jsonb DEFAULT '[]'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now()
);`;

const VALID_FIELD_TYPES = new Set<CheckoutFieldType>([
  "text",
  "textarea",
  "select",
  "checkbox",
  "number",
]);

export function sanitizeFieldKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeCheckoutField(
  raw: Partial<CheckoutFieldConfig>,
  index: number
): CheckoutFieldConfig {
  const fieldKey =
    typeof raw.field_key === "string" && raw.field_key.trim()
      ? sanitizeFieldKey(raw.field_key) || `custom_field_${index + 1}`
      : `custom_field_${index + 1}`;

  const fieldType: CheckoutFieldType =
    raw.field_type && VALID_FIELD_TYPES.has(raw.field_type)
      ? raw.field_type
      : "text";

  let options: string[] | undefined = undefined;
  if (Array.isArray(raw.options)) {
    options = raw.options
      .map((o) => String(o).trim())
      .filter(Boolean);
  } else if (typeof raw.options === "string") {
    const str = (raw.options as string).trim();
    if (str) {
      options = str
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
    }
  }

  if (fieldKey === "city" && (!options || options.length === 0)) {
    options = MOROCCAN_CITIES_OPTIONS;
  }

  return {
    id:
      typeof raw.id === "string" && raw.id.trim()
        ? raw.id.trim()
        : `field-${fieldKey}-${index + 1}`,
    field_key: fieldKey,
    label_fr:
      typeof raw.label_fr === "string" && raw.label_fr.trim()
        ? raw.label_fr.trim()
        : fieldKey,
    label_ar:
      typeof raw.label_ar === "string" ? raw.label_ar.trim() : "",
    field_type: fieldType,
    is_required: Boolean(raw.is_required),
    is_enabled: raw.is_enabled !== false,
    display_order:
      typeof raw.display_order === "number" && Number.isFinite(raw.display_order)
        ? raw.display_order
        : index + 1,
    placeholder_fr:
      typeof raw.placeholder_fr === "string" ? raw.placeholder_fr.trim() : "",
    placeholder_ar:
      typeof raw.placeholder_ar === "string" ? raw.placeholder_ar.trim() : "",
    options,
    is_system: Boolean(raw.is_system),
  };
}

export function sortCheckoutFields(
  fields: CheckoutFieldConfig[]
): CheckoutFieldConfig[] {
  return [...fields]
    .sort((a, b) => a.display_order - b.display_order)
    .map((f, idx) => ({ ...f, display_order: idx + 1 }));
}

export async function fetchCheckoutFields(): Promise<{
  fields: CheckoutFieldConfig[];
  needsMigration?: boolean;
}> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/checkout-fields", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = Array.isArray(json)
          ? json
          : Array.isArray(json?.fields)
          ? json.fields
          : null;
        if (rawList && rawList.length > 0) {
          const normalized = sortCheckoutFields(
            rawList.map((item: Partial<CheckoutFieldConfig>, idx: number) =>
              normalizeCheckoutField(item, idx)
            )
          );
          // Only overwrite local cache if server had persisted DB rows (not unmigrated fallback over local custom edits)
          if (!json?.needsMigration) {
            try {
              localStorage.setItem(
                CHECKOUT_FIELDS_STORAGE_KEY,
                JSON.stringify(normalized)
              );
            } catch {}
            return { fields: normalized, needsMigration: false };
          }

          // When Supabase table isn't created yet, prefer admin-saved localStorage cache if present
          try {
            const localRaw = localStorage.getItem(CHECKOUT_FIELDS_STORAGE_KEY);
            if (localRaw) {
              const parsed = JSON.parse(localRaw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return {
                  fields: sortCheckoutFields(
                    parsed.map((f: Partial<CheckoutFieldConfig>, i: number) =>
                      normalizeCheckoutField(f, i)
                    )
                  ),
                  needsMigration: true,
                };
              }
            }
          } catch {}

          return { fields: normalized, needsMigration: true };
        }
      }
    } catch (e) {
      console.warn("fetchCheckoutFields error:", e);
    }

    try {
      const local = localStorage.getItem(CHECKOUT_FIELDS_STORAGE_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            fields: sortCheckoutFields(
              parsed.map((f: Partial<CheckoutFieldConfig>, i: number) =>
                normalizeCheckoutField(f, i)
              )
            ),
          };
        }
      }
    } catch {}
  }

  return { fields: DEFAULT_CHECKOUT_FIELDS };
}

export async function saveCheckoutFields(
  fields: CheckoutFieldConfig[]
): Promise<{
  success: boolean;
  fields: CheckoutFieldConfig[];
  needsMigration?: boolean;
  error?: string;
}> {
  const sorted = sortCheckoutFields(
    fields.map((f, idx) => normalizeCheckoutField(f, idx))
  );

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CHECKOUT_FIELDS_STORAGE_KEY, JSON.stringify(sorted));
      window.dispatchEvent(
        new CustomEvent("teflook:checkout-fields-updated", { detail: sorted })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("teflook_sync");
        bc.postMessage({ type: "checkout-fields-updated", fields: sorted });
        bc.close();
      }
    } catch {}
  }

  try {
    const res = await fetch("/api/checkout-fields", {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: sorted }),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        fields: sorted,
        needsMigration: Boolean(json?.needsMigration),
        error:
          json?.error ||
          "Erreur lors de l'enregistrement des champs dans Supabase.",
      };
    }

    const returnedFields = Array.isArray(json?.fields)
      ? sortCheckoutFields(
          json.fields.map((f: Partial<CheckoutFieldConfig>, idx: number) =>
            normalizeCheckoutField(f, idx)
          )
        )
      : sorted;

    return {
      success: true,
      fields: returnedFields,
      needsMigration: Boolean(json?.needsMigration),
    };
  } catch (e) {
    console.error("saveCheckoutFields error:", e);
    return {
      success: false,
      fields: sorted,
      error: "Erreur réseau lors de l'enregistrement.",
    };
  }
}
