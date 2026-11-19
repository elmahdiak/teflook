import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, fetchRelatedProducts } from "@/lib/shopify-storefront";
import { ProductDetailView } from "@/components/product/ProductDetailView";

export const Route = createFileRoute("/product/$handle" as any)({
  loader: async ({ params }: { params: { handle: string } }) => {
    const product = await fetchProductByHandle(params.handle);
    const relatedProducts = product
      ? await fetchRelatedProducts(product.category, product.id, 4)
      : [];
    return { product, relatedProducts };
  },
  component: ProductRouteComponent,
});

function ProductRouteComponent() {
  const params = Route.useParams() as { handle: string };
  const handle = params.handle;

  const { data, isLoading } = useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: async () => {
      const product = await fetchProductByHandle(handle);
      const relatedProducts = product
        ? await fetchRelatedProducts(product.category, product.id, 4)
        : [];
      return { product, relatedProducts };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-center px-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Produit introuvable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            L'article demandé n'est pas disponible dans le catalogue actuel.
          </p>
        </div>
      </div>
    );
  }

  return <ProductDetailView product={data.product} relatedProducts={data.relatedProducts} />;
}
