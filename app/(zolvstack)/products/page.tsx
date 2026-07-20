import { JsonLd } from "@/components/seo/JsonLd";
import { ProductsPageContent } from "@/components/marketing/zolvstack/ProductsPageContent";
import { ZolvStackPageShell } from "@/components/layout/ZolvStackPageShell";
import {
  buildJsonLdForRoute,
  buildMetadataForRoute,
  ROUTE_IDS,
} from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.PRODUCTS);

export default function ProductsPage() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(ROUTE_IDS.PRODUCTS)} />
      <ZolvStackPageShell>
        <ProductsPageContent />
      </ZolvStackPageShell>
    </>
  );
}
