import { FileoraHubClient } from "@/components/marketing/FileoraHubClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildJsonLdForRoute,
  buildMetadataForRoute,
  ROUTE_IDS,
} from "@/lib/seo";

const routeId = ROUTE_IDS.FILEORA_HUB;

export const metadata = buildMetadataForRoute(routeId);

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(routeId)} />
      <FileoraHubClient />
    </>
  );
}
