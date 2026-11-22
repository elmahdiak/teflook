import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchProductByHandle,
  fetchRelatedProducts,
  MOCK_SHOPIFY_PRODUCTS,
} from "@/lib/shopify-storefront";
import { ProductDetailView } from "@/components/product/ProductDetailView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await fetchProductByHandle(handle);

  if (!product) {
    return {
      title: "Produit non trouvé — TefLook",
    };
  }

  return {
    title: `${product.title} — TefLook`,
    description: product.description,
    openGraph: {
      title: `${product.title} — TefLook`,
      description: product.description,
      images: [
        {
          url: product.images.edges[0]?.node?.url || "/images/teflook-mark.png",
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await fetchProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const relatedProducts = await fetchRelatedProducts(product.category, product.id, 4);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
