import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getStoreProducts,
  saveStoreProduct,
  deleteStoreProduct,
  clearStoreProducts,
  resetStoreProductsToDefault,
} from "@/lib/server-store";
import type { AdminProduct } from "@/lib/cod-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const handle = searchParams.get("handle");
    const id = searchParams.get("id");
    const category = searchParams.get("category");

    const products = getStoreProducts();

    if (handle) {
      const found = products.find(
        (p) => p.handle.toLowerCase() === handle.toLowerCase() || p.id.toLowerCase() === handle.toLowerCase()
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
      const filtered = products.filter((p) => p.categorySlug === category);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Impossible de récupérer les produits." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.priceMad) {
      return NextResponse.json({ error: "Le titre et le prix sont obligatoires." }, { status: 400 });
    }

    const saved = saveStoreProduct(body);

    // Instant Next.js Cache Invalidation
    try {
      revalidatePath("/");
      revalidatePath("/product/[handle]", "page");
      if (saved.handle) {
        revalidatePath(`/product/${saved.handle}`);
      }
    } catch (e) {
      console.warn("revalidatePath warning:", e);
    }

    return NextResponse.json({
      success: true,
      product: saved,
    });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement du produit." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";
    const reset = searchParams.get("reset") === "true";

    if (reset) {
      const restored = resetStoreProductsToDefault();
      try {
        revalidatePath("/");
        revalidatePath("/product/[handle]", "page");
      } catch {}
      return NextResponse.json({
        success: true,
        message: "Catalogue réinitialisé avec les produits de base.",
        count: restored.length,
      });
    }

    if (clearAll) {
      clearStoreProducts();
      try {
        revalidatePath("/");
        revalidatePath("/product/[handle]", "page");
      } catch {}
      return NextResponse.json({
        success: true,
        message: "Tous les produits ont été supprimés avec succès.",
        count: 0,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Identifiant du produit manquant." }, { status: 400 });
    }

    const deleted = deleteStoreProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: "Produit non trouvé ou déjà supprimé." }, { status: 404 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/product/[handle]", "page");
      revalidatePath(`/product/${id}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Produit supprimé avec succès.",
      id,
    });
  } catch (error) {
    console.error("DELETE /api/products error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du produit." }, { status: 500 });
  }
}
