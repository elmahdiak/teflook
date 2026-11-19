import { PRODUCTS, CATEGORIES, REVIEWS } from "@/data/teflookData";

export interface CODOrderItem {
  productId: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface CODOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  notes?: string;
  items: CODOrderItem[];
  totalMad: number;
  status: OrderStatus;
  paymentMethod: "COD";
}

export interface AdminProduct {
  id: string;
  title: string;
  handle: string;
  categorySlug: string;
  categoryName: string;
  priceMad: number;
  oldPriceMad?: number;
  inStock: boolean;
  ageBracket: string;
  images: string[];
  description: string;
  material?: string;
  origin?: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  itemCount: number;
}

export interface AdminReview {
  id: string;
  authorName: string;
  city: string;
  rating: number;
  comment: string;
  productName: string;
  productImage: string;
  date: string;
  isVerifiedBuyer: boolean;
  status: "approved" | "pending";
}

// Storage Keys
const ORDERS_STORAGE_KEY = "teflook_cod_orders_v2";
const PRODUCTS_STORAGE_KEY = "teflook_admin_products_v2";
const CATEGORIES_STORAGE_KEY = "teflook_admin_categories_v2";
const REVIEWS_STORAGE_KEY = "teflook_admin_reviews_v2";

// Seed realistic initial orders
const INITIAL_ORDERS: CODOrder[] = [
  {
    id: "CMD-84910",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    customerName: "Khadija Benani",
    customerPhone: "0661234567",
    customerCity: "Casablanca",
    customerAddress: "Bd Ghandi, Résidence Anfa Palm, Imm B, Apt 14",
    notes: "Appeler avant la livraison svp",
    items: [
      {
        productId: "prod-disc-1",
        title: "Horloge Minuteur Visuel 'Focus & Rituels' Silencieux",
        variantTitle: "7 - 10 ans",
        price: 199,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
      },
      {
        productId: "prod-emo-1",
        title: "La Météo des Émotions : Roue & Cartes d'Apaisement",
        variantTitle: "5 - 6 ans",
        price: 189,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop",
      },
    ],
    totalMad: 388,
    status: "pending",
    paymentMethod: "COD",
  },
  {
    id: "CMD-84909",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    customerName: "Omar Tazi",
    customerPhone: "0670889900",
    customerCity: "Rabat",
    customerAddress: "Avenue Annakhil, Hay Riad, Villa 42",
    items: [
      {
        productId: "prod-auto-1",
        title: "Set d'Apprentissage Culinaire Sécurisé 'Petit Chef'",
        variantTitle: "Tous âges",
        price: 229,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
      },
    ],
    totalMad: 229,
    status: "confirmed",
    paymentMethod: "COD",
  },
  {
    id: "CMD-84908",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    customerName: "Salma El Idrissi",
    customerPhone: "0655443322",
    customerCity: "Marrakech",
    customerAddress: "Guéliz, Rue de la Liberté, Apt 6",
    notes: "Livraison l'après-midi uniquement",
    items: [
      {
        productId: "prod-crit-1",
        title: "Casse-Tête Labyrinthe Gravitationnel en Bois Écologique",
        variantTitle: "7 - 10 ans",
        price: 189,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop",
      },
    ],
    totalMad: 378,
    status: "shipped",
    paymentMethod: "COD",
  },
  {
    id: "CMD-84907",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // yesterday
    customerName: "Mehdi Cherkaoui",
    customerPhone: "0663112233",
    customerCity: "Tanger",
    customerAddress: "Malabata, Résidence Bay City, Bloc C",
    items: [
      {
        productId: "prod-disc-2",
        title: "Tour de Concentration & Équilibre Zen en Bois Massif",
        variantTitle: "5 - 6 ans",
        price: 249,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=600&auto=format&fit=crop",
      },
    ],
    totalMad: 249,
    status: "delivered",
    paymentMethod: "COD",
  },
];

/* ========================================================================= */
/* ORDERS MANAGEMENT                                                         */
/* ========================================================================= */

export function getCODOrders(): CODOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveCODOrder(orderData: Omit<CODOrder, "id" | "createdAt" | "status" | "paymentMethod">): CODOrder {
  const current = getCODOrders();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const newOrder: CODOrder = {
    ...orderData,
    id: `CMD-${randomSuffix}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    paymentMethod: "COD",
  };

  const updated = [newOrder, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  }
  return newOrder;
}

export function updateCODOrderStatus(orderId: string, newStatus: OrderStatus): CODOrder | null {
  const current = getCODOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder = { ...current[index], status: newStatus };
  current[index] = updatedOrder;

  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(current));
  }
  return updatedOrder;
}

export function deleteCODOrder(orderId: string): boolean {
  const current = getCODOrders();
  const filtered = current.filter((o) => o.id !== orderId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* PRODUCTS MANAGEMENT                                                       */
/* ========================================================================= */

const SEEDED_PRODUCTS: AdminProduct[] = PRODUCTS.map((p) => ({
  id: p.id,
  title: p.name,
  handle: p.id,
  categorySlug: p.categorySlug,
  categoryName: p.categoryName,
  priceMad: p.priceMad,
  oldPriceMad: p.oldPriceMad,
  inStock: p.inStock,
  ageBracket: p.ageBracket,
  images: p.images,
  description: p.description,
  material: p.material,
  origin: p.origin,
}));

export function getAdminProducts(): AdminProduct[] {
  if (typeof window === "undefined") return SEEDED_PRODUCTS;
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(SEEDED_PRODUCTS));
      return SEEDED_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_PRODUCTS;
  }
}

export function saveAdminProduct(product: Omit<AdminProduct, "id" | "handle"> & { id?: string }): AdminProduct {
  const current = getAdminProducts();
  const id = product.id || `prod-custom-${Date.now()}`;
  const handle = id;

  const newProduct: AdminProduct = {
    ...product,
    id,
    handle,
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  let updated: AdminProduct[];
  if (existingIndex >= 0) {
    current[existingIndex] = newProduct;
    updated = [...current];
  } else {
    updated = [newProduct, ...current];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updated));
  }
  return newProduct;
}

export function deleteAdminProduct(productId: string): boolean {
  const current = getAdminProducts();
  const filtered = current.filter((p) => p.id !== productId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* CATEGORIES MANAGEMENT                                                     */
/* ========================================================================= */

const SEEDED_CATEGORIES: AdminCategory[] = CATEGORIES.map((c) => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  subtitle: c.subtitle,
  imageUrl: c.imageUrl,
  itemCount: c.itemCount,
}));

export function getAdminCategories(): AdminCategory[] {
  if (typeof window === "undefined") return SEEDED_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SEEDED_CATEGORIES));
      return SEEDED_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_CATEGORIES;
  }
}

export function saveAdminCategory(cat: Omit<AdminCategory, "id"> & { id?: string }): AdminCategory {
  const current = getAdminCategories();
  const id = cat.id || `cat-${Date.now()}`;
  const newCat: AdminCategory = { ...cat, id };

  const existingIndex = current.findIndex((c) => c.id === id);
  let updated: AdminCategory[];
  if (existingIndex >= 0) {
    current[existingIndex] = newCat;
    updated = [...current];
  } else {
    updated = [...current, newCat];
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
  }
  return newCat;
}

export function deleteAdminCategory(categoryId: string): boolean {
  const current = getAdminCategories();
  const filtered = current.filter((c) => c.id !== categoryId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* REVIEWS & VERIFIED BUYER WATERMARK MANAGEMENT                             */
/* ========================================================================= */

const SEEDED_REVIEWS: AdminReview[] = REVIEWS.map((r) => ({
  id: r.id,
  authorName: r.authorName,
  city: r.city,
  rating: r.rating,
  comment: r.comment,
  productName: r.productName,
  productImage: r.productImage,
  date: r.date,
  isVerifiedBuyer: r.verified ?? true,
  status: "approved",
}));

export function getAdminReviews(): AdminReview[] {
  if (typeof window === "undefined") return SEEDED_REVIEWS;
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(SEEDED_REVIEWS));
      return SEEDED_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_REVIEWS;
  }
}

export function toggleReviewApproval(reviewId: string): AdminReview | null {
  const current = getAdminReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  const currentStatus = current[index].status;
  const updated = {
    ...current[index],
    status: currentStatus === "approved" ? "pending" : "approved",
  } as AdminReview;
  current[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(current));
  }
  return updated;
}

export function toggleReviewVerified(reviewId: string): AdminReview | null {
  const current = getAdminReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  const updated = {
    ...current[index],
    isVerifiedBuyer: !current[index].isVerifiedBuyer,
  };
  current[index] = updated;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(current));
  }
  return updated;
}

export function deleteReview(reviewId: string): boolean {
  const current = getAdminReviews();
  const filtered = current.filter((r) => r.id !== reviewId);
  if (filtered.length === current.length) return false;

  if (typeof window !== "undefined") {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(filtered));
  }
  return true;
}

/* ========================================================================= */
/* ANALYTICS & STATS                                                         */
/* ========================================================================= */

export function getDashboardStats() {
  const orders = getCODOrders();
  const products = getAdminProducts();
  const reviews = getAdminReviews();

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalMad, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const confirmationRate =
    orders.length > 0
      ? Math.round(((confirmedOrders + shippedOrders + deliveredOrders) / orders.length) * 100)
      : 100;

  return {
    totalRevenue,
    totalOrdersCount: orders.length,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    confirmationRate,
    productsCount: products.length,
    reviewsCount: reviews.length,
    recentOrders: orders.slice(0, 5),
  };
}
