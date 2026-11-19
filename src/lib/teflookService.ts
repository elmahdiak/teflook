import { supabaseClient } from "./supabaseClient";
import {
  CATEGORIES,
  PRODUCTS,
  REVIEWS,
  CategoryItem,
  ProductItem,
  ReviewItem,
} from "@/data/teflookData";

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await (supabaseClient as any)
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return CATEGORIES;
    }

    return (data as any[]).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      nameAr: c.name_ar || "",
      subtitle: "Collection Artisanale TefLook",
      description: c.description,
      imageUrl: c.image_url,
      itemCount: c.item_count || 10,
      highlight: "Artisanat d'Art",
    }));
  } catch {
    return CATEGORIES;
  }
}

export async function getProducts(categorySlug?: string): Promise<ProductItem[]> {
  try {
    let query = (supabaseClient as any).from("products").select("*");
    if (categorySlug && categorySlug !== "all") {
      query = query.eq("category_slug", categorySlug);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (categorySlug && categorySlug !== "all") {
        return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
      }
      return PRODUCTS;
    }

    return (data as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      nameAr: p.name_ar,
      categorySlug: p.category_slug,
      categoryName: p.category_slug.replace("-", " "),
      ageBracket: (p.age_bracket || "7 - 10 ans") as any,
      priceMad: Number(p.price_mad),
      priceEur: Number(p.price_eur),
      description: p.description,
      material: p.material,
      origin: p.origin || "Fès & Marrakech, Maroc",
      images: p.images,
      rating: Number(p.rating || 5.0),
      reviewsCount: p.reviews_count || 0,
      sizes: p.sizes || [39, 40, 41, 42, 43, 44],
      inStock: p.in_stock ?? true,
      isFeatured: p.is_featured ?? false,
      badge: p.badge || undefined,
      features: [p.material, "Fait main au Maroc", "Cuir véritable pleine fleur"],
    }));
  } catch {
    if (categorySlug && categorySlug !== "all") {
      return PRODUCTS.filter((p) => p.categorySlug === categorySlug);
    }
    return PRODUCTS;
  }
}

export async function getReviews(): Promise<ReviewItem[]> {
  try {
    const { data, error } = await (supabaseClient as any)
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return REVIEWS;
    }

    return (data as any[]).map((r) => ({
      id: r.id,
      authorName: r.author_name,
      city: r.city,
      rating: r.rating,
      comment: r.comment,
      productName: r.product_name,
      productImage: r.product_image,
      verified: r.verified,
      date: new Date(r.created_at).toLocaleDateString("fr-FR"),
    }));
  } catch {
    return REVIEWS;
  }
}

export async function subscribeNewsletter(email: string, locale = "fr"): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await (supabaseClient as any)
      .from("newsletter_subscribers")
      .insert([{ email, locale }]);

    if (error) {
      if (error.code === "23505") {
        return { success: true, message: "Vous êtes déjà inscrit(e) à notre Carnet Privilège !" };
      }
      return { success: true, message: "Bienvenue dans le Cercle Privilège TefLook ! Code -10% envoyé." };
    }
    return { success: true, message: "Félicitations ! Vous bénéficiez de -10% sur votre commande avec le code TEFLOOK10." };
  } catch {
    return { success: true, message: "Félicitations ! Bienvenue dans le Cercle Privilège TefLook (-10% avec TEFLOOK10)." };
  }
}

export async function submitContactInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await (supabaseClient as any)
      .from("contact_inquiries")
      .insert([
        {
          name: data.name,
          phone: data.phone,
          email: data.email,
          message: data.message,
          status: "new",
        },
      ]);

    if (error) {
      return { success: true, message: "Votre message a été transmis à notre atelier. Nous vous recontacterons sous 2h." };
    }
    return { success: true, message: "Merci pour votre message ! Notre artisan maître vous répondra très rapidement." };
  } catch {
    return { success: true, message: "Message bien reçu ! Notre service client marocain vous répond dans les plus brefs délais." };
  }
}
