import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminViewer } from "@/lib/commerce/auth";
import { commerceEnv } from "@/lib/commerce/env";
import { currencySymbol } from "@/lib/commerce/currency";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  // The layout renders the denial screen; returning null here just keeps
  // this page from producing anything for someone who should not see it.
  if (!(await getAdminViewer())) return null;
  return <ProductForm currencySymbol={currencySymbol(commerceEnv.currency)} />;
}
