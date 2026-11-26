import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, type ProductItem } from "@/data/teflookData";
import { PRODUCT_TRANSLATIONS_AR } from "@/lib/product-localization";
import {
  normalizeProductAgeRanges,
  normalizeProductImages,
  type AdminProduct,
} from "@/lib/cod-service";
import { ADMIN_PRODUCTS_PATH } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Initialize standard Supabase client with Anon Key (works seamlessly in Vercel Serverless)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvqcsxwwkgypvqfewbtn.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IkjoHS4mwYG9qEXkBWy8Xg_jw3TI_AF";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seeded products generator - ONLY used when explicitly restoring demo products
function getDemoProducts(): AdminProduct[] {
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
      images:
        p.images && p.images.length > 0
          ? p.images
          : ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop"],
      description: p.description,
      material: p.material,
      origin: p.origin,
      title_ar: trAr?.title,
      description_ar: trAr?.description,
      categoryName_ar: trAr?.categoryName,
      features: p.features,
      rating: 0,
      reviewsCount: 0,
    };
  });
}

function mapRowToAdminProduct(row: any): AdminProduct {
  const images = normalizeProductImages(row);

  const id = String(row.id);
  const title = row.title || row.name || "Produit TefLook";
  const priceMad = Number(row.price_mad ?? row.price ?? row.priceMad ?? 0);
  const oldPriceMad =
    row.old_price_mad != null
      ? Number(row.old_price_mad)
      : row.old_price != null
      ? Number(row.old_price)
      : row.oldPriceMad != null
      ? Number(row.oldPriceMad)
      : undefined;

  const categorySlug =
    row.category_slug || row.category || row.categorySlug || "discipline-maitrise-de-soi";
  const categoryName =
    row.category_name || row.categoryName || categorySlug.replace(/-/g, " ");
  const rawAgeRanges = normalizeProductAgeRanges(row);
  const ageRanges = rawAgeRanges.length > 0 ? rawAgeRanges : ["7 - 10 ans"];
  const primaryAgeBracket = ageRanges[0] || "7 - 10 ans";

  return {
    id,
    title,
    handle: row.handle || id,
    categorySlug,
    categoryName,
    priceMad,
    oldPriceMad,
    inStock: row.in_stock ?? row.inStock ?? true,
    ageBracket: primaryAgeBracket,
    ageRanges,
    age_ranges: ageRanges,
    ageRange: row.age_range || row.ageRange || ageRanges.join(", "),
    createdAt: row.created_at || row.createdAt,
    skills: Array.isArray(row.skills)
      ? row.skills
      : typeof row.skills === "string" && row.skills.trim().length > 0
      ? row.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    sku: row.sku || row.reference || id,
    reference: row.reference || row.sku || `Référence ${id.replace(/[^0-9]/g, "").slice(-5) || "67907"}`,
    images,
    description: row.description || "",
    material: row.material,
    origin: row.origin,
    title_ar: row.title_ar || row.name_ar,
    description_ar: row.description_ar,
    categoryName_ar: row.category_name_ar,
    features: Array.isArray(row.features) ? row.features : [],
    rating: row.rating != null ? Number(row.rating) : 0,
    reviewsCount: row.reviews_count != null ? Number(row.reviews_count) : row.reviewsCount != null ? Number(row.reviewsCount) : 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    // Strictly fetch from Supabase
    let products: AdminProduct[] = [];
    try {
      const [productsRes, reviewsRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("product_reviews")
          .select("product_id, product_handle, rating"),
      ]);

      if (productsRes.error) {
        console.warn("Supabase GET error:", productsRes.error.message);
        // Do NOT auto-seed! Return empty array if error
        return NextResponse.json([]);
      }

      // Aggregate live review stats per product
      const allReviews: any[] = (!reviewsRes.error && Array.isArray(reviewsRes.data)) ? reviewsRes.data : [];
      const reviewStatsMap = new Map<string, { count: number; sum: number }>();

      for (const r of allReviews) {
        const ratingVal = Number(r.rating) || 5;
        if (r.product_id) {
          const key = String(r.product_id).trim().toLowerCase();
          const curr = reviewStatsMap.get(key) || { count: 0, sum: 0 };
          reviewStatsMap.set(key, { count: curr.count + 1, sum: curr.sum + ratingVal });
        }
        if (r.product_handle) {
          const key = String(r.product_handle).trim().toLowerCase();
          if (key !== String(r.product_id || "").trim().toLowerCase()) {
            const curr = reviewStatsMap.get(key) || { count: 0, sum: 0 };
            reviewStatsMap.set(key, { count: curr.count + 1, sum: curr.sum + ratingVal });
          }
        }
      }

      // Map rows with live computed review stats
      products = (productsRes.data || []).map((row: any) => {
        const prod = mapRowToAdminProduct(row);
        const idKey = prod.id.trim().toLowerCase();
        const handleKey = (prod.handle || "").trim().toLowerCase();
        const stats = reviewStatsMap.get(idKey) || (handleKey ? reviewStatsMap.get(handleKey) : undefined);

        if (stats && stats.count > 0) {
          prod.reviewsCount = stats.count;
          prod.rating = Number((stats.sum / stats.count).toFixed(1));
        } else {
          prod.reviewsCount = 0;
          prod.rating = 0;
        }

        return prod;
      });
    } catch (dbErr) {
      console.warn("Supabase GET caught exception:", dbErr);
      return NextResponse.json([]);
    }

    if (handle) {
      const found = products.find(
        (p) =>
          p.handle.toLowerCase() === handle.toLowerCase() ||
          p.id.toLowerCase() === handle.toLowerCase()
      );
      if (!found) {
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    if (id) {
      const found = products.find((p) => p.id === id);
      if (!found) {
        return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    if (category && category !== "all") {
      const filtered = products.filter(
        (p) => p.categorySlug === category || p.categoryName === category
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    // Never auto-seed: return empty array
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || body.priceMad === undefined) {
      return NextResponse.json(
        { error: "Le titre et le prix sont obligatoires." },
        { status: 400 }
      );
    }

    const productId = body.id || `prod-custom-${Date.now()}`;
    const priceMadNum = Number(body.priceMad || 0);
    const oldPriceMadNum = body.oldPriceMad ? Number(body.oldPriceMad) : null;
    const categorySlug = body.categorySlug || "discipline-maitrise-de-soi";
    const imagesList = normalizeProductImages(body);
    const primaryImage = imagesList[0] || "";
    const parsedAgeRanges = normalizeProductAgeRanges(body);
    const ageRangesList = parsedAgeRanges.length > 0 ? parsedAgeRanges : ["7 - 10 ans"];
    const primaryAgeBracket = ageRangesList[0] || "7 - 10 ans";

    // Attempt upsert with all standard columns
    const fullPayload: Record<string, any> = {
      id: productId,
      title: body.title,
      name: body.title,
      price: priceMadNum,
      price_mad: priceMadNum,
      old_price: oldPriceMadNum,
      old_price_mad: oldPriceMadNum,
      category: categorySlug,
      category_slug: categorySlug,
      category_name: body.categoryName || categorySlug.replace(/-/g, " "),
      image: primaryImage,
      images: imagesList,
      description: body.description || "",
      in_stock: body.inStock ?? true,
      age_bracket: primaryAgeBracket,
      age_ranges: ageRangesList,
      age_range: body.ageRange || ageRangesList.join(", "),
      skills: Array.isArray(body.skills)
        ? body.skills
        : typeof body.skills === "string" && body.skills.trim().length > 0
        ? body.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      sku: body.sku || body.reference || productId,
      reference: body.reference || body.sku || `Référence ${productId.replace(/[^0-9]/g, "").slice(-5) || "67907"}`,
    };

    let upsertResult = await supabase.from("products").upsert(fullPayload);

    // If schema lacks some optional columns, retry preserving `images` first, then baseline columns
    if (upsertResult.error) {
      console.warn("Full payload upsert failed, retrying core+images columns:", upsertResult.error.message);
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      const coreWithImagesPayload: Record<string, any> = {
        title: body.title,
        price: priceMadNum,
        category: categorySlug,
        image: primaryImage,
        images: imagesList,
        description: body.description || "",
      };
      if (isUUID) {
        coreWithImagesPayload.id = productId;
      }
      upsertResult = await supabase.from("products").upsert(coreWithImagesPayload);

      if (upsertResult.error) {
        console.warn("Core+images upsert failed, retrying with baseline columns:", upsertResult.error.message);
        const baselinePayload: Record<string, any> = {
          title: body.title,
          price: priceMadNum,
          category: categorySlug,
          image: primaryImage,
          description: body.description || "",
        };
        if (isUUID) {
          baselinePayload.id = productId;
        }
        upsertResult = await supabase.from("products").upsert(baselinePayload);
      }
    }

    const savedProduct: AdminProduct = {
      id: productId,
      title: body.title,
      handle: body.handle || productId,
      categorySlug,
      categoryName: body.categoryName || categorySlug.replace(/-/g, " "),
      priceMad: priceMadNum,
      oldPriceMad: oldPriceMadNum || undefined,
      inStock: body.inStock ?? true,
      ageBracket: primaryAgeBracket,
      ageRanges: ageRangesList,
      age_ranges: ageRangesList,
      ageRange: body.ageRange || ageRangesList.join(", "),
      images: imagesList,
      description: body.description || "",
      material: body.material,
      origin: body.origin,
      title_ar: body.title_ar,
      description_ar: body.description_ar,
      categoryName_ar: body.categoryName_ar,
      features: body.features || [],
      rating: body.rating != null ? Number(body.rating) : 0,
      reviewsCount: body.reviewsCount != null ? Number(body.reviewsCount) : 0,
    };

    // Instant Next.js Cache Invalidation
    try {
      revalidatePath("/", "layout");
      revalidatePath("/product/[handle]", "page");
      revalidatePath(ADMIN_PRODUCTS_PATH);
      if (savedProduct.handle) {
        revalidatePath(`/product/${savedProduct.handle}`);
      }
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      success: true,
      product: savedProduct,
    });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du produit." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";
    const reset = searchParams.get("reset") === "true";

    // 1. Explicit user request to restore the 24 demo products
    if (reset) {
      try {
        await supabase.from("products").delete().not("id", "is", null);
      } catch (e) {
        console.warn("Supabase clear on reset error:", e);
      }

      const demoList = getDemoProducts();
      try {
        const rowsToInsert = demoList.map((p) => ({
          title: p.title,
          name: p.title,
          price: p.priceMad,
          price_mad: p.priceMad,
          old_price: p.oldPriceMad || null,
          old_price_mad: p.oldPriceMad || null,
          category: p.categorySlug,
          category_slug: p.categorySlug,
          category_name: p.categoryName,
          image: p.images[0] || "",
          images: p.images,
          description: p.description,
          in_stock: p.inStock,
          age_bracket: p.ageBracket,
          age_ranges: [p.ageBracket],
        }));
        const insertRes = await supabase.from("products").insert(rowsToInsert);
        if (insertRes.error) {
          // If schema is minimal, insert baseline columns
          const baselineRows = demoList.map((p) => ({
            title: p.title,
            price: p.priceMad,
            category: p.categorySlug,
            image: p.images[0] || "",
            description: p.description,
          }));
          await supabase.from("products").insert(baselineRows);
        }
      } catch (insertErr) {
        console.warn("Error inserting demo products during reset:", insertErr);
      }

      try {
        revalidatePath("/", "layout");
        revalidatePath("/product/[handle]", "page");
        revalidatePath(ADMIN_PRODUCTS_PATH);
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Catalogue réinitialisé avec les produits de démonstration.",
        count: demoList.length,
      });
    }

    // 2. Clear entire database (0 products)
    if (clearAll) {
      try {
        // Delete all rows in Supabase
        await supabase.from("products").delete().not("id", "is", null);
      } catch (e) {
        console.warn("Supabase clearAll delete error:", e);
      }

      try {
        revalidatePath("/", "layout");
        revalidatePath("/product/[handle]", "page");
        revalidatePath(ADMIN_PRODUCTS_PATH);
      } catch {}

      return NextResponse.json({
        success: true,
        message: "Tous les produits ont été supprimés avec succès.",
        count: 0,
      });
    }

    // 3. Single product deletion
    if (!id) {
      return NextResponse.json({ error: "Identifiant du produit manquant." }, { status: 400 });
    }

    try {
      const { error: dbError } = await supabase.from("products").delete().eq("id", id);
      if (dbError) {
        console.warn(`Supabase delete note for id ${id}:`, dbError.message);
      }
    } catch (dbErr) {
      console.warn("Supabase delete caught exception:", dbErr);
    }

    // Always revalidate paths
    try {
      revalidatePath("/", "layout");
      revalidatePath("/product/[handle]", "page");
      revalidatePath(`/product/${id}`);
      revalidatePath(ADMIN_PRODUCTS_PATH);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Produit supprimé avec succès.",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({
      success: true,
      message: "Produit traité.",
      id: req.nextUrl?.searchParams?.get("id") || null,
    });
  }
}
