import { JsonLd } from "@/components/seo/JsonLd";
import { ZolvStackHomeClient } from "@/components/marketing/zolvstack/ZolvStackHomeClient";
import {
  buildJsonLdForRoute,
  buildMetadataForRoute,
  ROUTE_IDS,
} from "@/lib/seo";

export const metadata = buildMetadataForRoute(ROUTE_IDS.HOME);

export default function ZolvStackHomePage() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(ROUTE_IDS.HOME)} />
      <ZolvStackHomeClient />
    </>
  );
}
