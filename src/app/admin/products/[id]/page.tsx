import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminViewer } from "@/lib/commerce/auth";
import { getAdminProduct } from "@/lib/commerce/catalogue";
import { currencySymbol } from "@/lib/commerce/currency";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;

  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      currencySymbol={currencySymbol(product.currency)}
    />
  );
}
