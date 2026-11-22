import fs from "fs";
import path from "path";
import { PRODUCTS, CATEGORIES, REVIEWS, type ProductItem } from "@/data/teflookData";
import { PRODUCT_TRANSLATIONS_AR } from "./product-localization";
import type { AdminProduct, AdminCategory, CODOrder, AdminReview } from "./cod-service";

const DATA_DIR = path.join(process.cwd(), "src", "data", "live");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const REVIEWS_FILE = path.join(DATA_DIR, "reviews.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial Seed Data Generators
function getInitialProducts(): AdminProduct[] {
  return PRODUCTS.map((p: ProductItem) => {
    const trAr = PRODUCT_TRANSLATIONS_AR[p.id];
    return {
      id: p.id,
      title: p.name,
      handle: p.id,
      categorySlug: p.categorySlug,
      categoryName: p.categoryName,
      priceMad: p.priceMad,
      oldPriceMad: p.oldPriceMad,
      inStock: p.inStock,
      ageBracket: p.ageBracket,
      images: p.images && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop"],
      description: p.description,
      material: p.material,
      origin: p.origin,
      title_ar: trAr?.title,
      description_ar: trAr?.description,
      categoryName_ar: trAr?.categoryName,
      features: p.features,
      rating: p.rating || 4.9,
      reviewsCount: p.reviewsCount || 48,
    };
  });
}

function getInitialCategories(): AdminCategory[] {
  return CATEGORIES.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    subtitle: c.subtitle,
    imageUrl: c.imageUrl,
    itemCount: c.itemCount,
  }));
}

function getInitialOrders(): CODOrder[] {
  return [
    {
      id: "CMD-84910",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
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
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
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
}

function getInitialReviews(): AdminReview[] {
  return REVIEWS.map((r) => ({
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
}

/* ========================================================================= */
/* PRODUCTS STORE                                                            */
/* ========================================================================= */

export function getStoreProducts(): AdminProduct[] {
  ensureDirectoryExists();
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) {
      const initial = getInitialProducts();
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading products store:", err);
    return getInitialProducts();
  }
}

export function saveStoreProduct(product: Omit<AdminProduct, "id" | "handle"> & { id?: string }): AdminProduct {
  ensureDirectoryExists();
  const current = getStoreProducts();
  const id = product.id || `prod-custom-${Date.now()}`;
  const handle = id;

  const newProduct: AdminProduct = {
    ...product,
    id,
    handle,
  };

  const index = current.findIndex((p) => p.id === id);
  let updated: AdminProduct[];
  if (index >= 0) {
    current[index] = { ...current[index], ...newProduct };
    updated = [...current];
  } else {
    updated = [newProduct, ...current];
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return newProduct;
}

export function deleteStoreProduct(productId: string): boolean {
  ensureDirectoryExists();
  const current = getStoreProducts();
  const filtered = current.filter((p) => p.id !== productId);
  if (filtered.length === current.length) return false;

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export function clearStoreProducts(): boolean {
  ensureDirectoryExists();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
  return true;
}

export function resetStoreProductsToDefault(): AdminProduct[] {
  ensureDirectoryExists();
  const initial = getInitialProducts();
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initial, null, 2), "utf-8");
  return initial;
}

/* ========================================================================= */
/* CATEGORIES STORE                                                          */
/* ========================================================================= */

export function getStoreCategories(): AdminCategory[] {
  ensureDirectoryExists();
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      const initial = getInitialCategories();
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading categories store:", err);
    return getInitialCategories();
  }
}

export function saveStoreCategory(cat: Omit<AdminCategory, "id"> & { id?: string }): AdminCategory {
  ensureDirectoryExists();
  const current = getStoreCategories();
  const id = cat.id || `cat-${Date.now()}`;
  const newCat: AdminCategory = { ...cat, id };

  const index = current.findIndex((c) => c.id === id);
  let updated: AdminCategory[];
  if (index >= 0) {
    current[index] = newCat;
    updated = [...current];
  } else {
    updated = [...current, newCat];
  }

  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return newCat;
}

export function deleteStoreCategory(categoryId: string): boolean {
  ensureDirectoryExists();
  const current = getStoreCategories();
  const filtered = current.filter((c) => c.id !== categoryId);
  if (filtered.length === current.length) return false;

  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

/* ========================================================================= */
/* ORDERS STORE                                                              */
/* ========================================================================= */

export function getStoreOrders(): CODOrder[] {
  ensureDirectoryExists();
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      const initial = getInitialOrders();
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(ORDERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading orders store:", err);
    return getInitialOrders();
  }
}

export function saveStoreOrder(orderData: Omit<CODOrder, "id" | "createdAt" | "status" | "paymentMethod">): CODOrder {
  ensureDirectoryExists();
  const current = getStoreOrders();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const newOrder: CODOrder = {
    ...orderData,
    id: `CMD-${randomSuffix}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    paymentMethod: "COD",
  };

  const updated = [newOrder, ...current];
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return newOrder;
}

export function updateStoreOrderStatus(orderId: string, newStatus: CODOrder["status"]): CODOrder | null {
  ensureDirectoryExists();
  const current = getStoreOrders();
  const index = current.findIndex((o) => o.id === orderId);
  if (index === -1) return null;

  const updatedOrder = { ...current[index], status: newStatus };
  current[index] = updatedOrder;

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(current, null, 2), "utf-8");
  return updatedOrder;
}

export function deleteStoreOrder(orderId: string): boolean {
  ensureDirectoryExists();
  const current = getStoreOrders();
  const filtered = current.filter((o) => o.id !== orderId);
  if (filtered.length === current.length) return false;

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

/* ========================================================================= */
/* REVIEWS STORE                                                             */
/* ========================================================================= */

export function getStoreReviews(): AdminReview[] {
  ensureDirectoryExists();
  try {
    if (!fs.existsSync(REVIEWS_FILE)) {
      const initial = getInitialReviews();
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(REVIEWS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading reviews store:", err);
    return getInitialReviews();
  }
}

export function saveStoreReview(reviewData: Omit<AdminReview, "id" | "date"> & { id?: string }): AdminReview {
  ensureDirectoryExists();
  const current = getStoreReviews();
  const id = reviewData.id || `rev-${Date.now()}`;
  const newReview: AdminReview = {
    ...reviewData,
    id,
    date: new Date().toISOString().split("T")[0],
  };

  const index = current.findIndex((r) => r.id === id);
  let updated: AdminReview[];
  if (index >= 0) {
    current[index] = newReview;
    updated = [...current];
  } else {
    updated = [newReview, ...current];
  }

  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  return newReview;
}

export function toggleStoreReviewStatus(reviewId: string, field: "approval" | "verified"): AdminReview | null {
  ensureDirectoryExists();
  const current = getStoreReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  if (field === "approval") {
    current[index].status = current[index].status === "approved" ? "pending" : "approved";
  } else {
    current[index].isVerifiedBuyer = !current[index].isVerifiedBuyer;
  }

  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(current, null, 2), "utf-8");
  return current[index];
}

export function deleteStoreReview(reviewId: string): boolean {
  ensureDirectoryExists();
  const current = getStoreReviews();
  const filtered = current.filter((r) => r.id !== reviewId);
  if (filtered.length === current.length) return false;

  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
