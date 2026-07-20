import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildJsonLdForRoute,
  buildMetadataForRoute,
  ROUTE_IDS,
} from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.HOME);

export default function ZolvStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(ROUTE_IDS.HOME)} />
      {children}
    </>
  );
}
