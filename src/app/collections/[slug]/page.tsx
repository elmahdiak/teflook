import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionDetailPageView } from "@/components/collections/CollectionDetailPageView";
import { fetchProducts } from "@/lib/shopify-storefront";
import {
  getChildStoreCategoryConfig,
  resolveChildStoreCategory,
} from "@/lib/teflook-categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = resolveChildStoreCategory(slug);

  if (!category) {
    return {
      title: "Collection introuvable — TefLook",
    };
  }

  const config = getChildStoreCategoryConfig(category);

  return {
    title: `${config.titleFr} — Collections TefLook`,
    description: config.descFr,
  };
}

export default async function CollectionSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = resolveChildStoreCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await fetchProducts();

  return (
    <CollectionDetailPageView category={category} initialProducts={products} />
  );
}
