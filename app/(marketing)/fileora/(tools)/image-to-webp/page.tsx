import { JsonLd } from "@/components/seo/JsonLd";
import { ToolPage } from "@/components/tools/ToolPage";
import { buildJsonLdForRoute, buildMetadataForRoute } from "@/lib/seo";

const routeId = "image-to-webp";

export const metadata = buildMetadataForRoute(routeId);

export default function Page() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(routeId)} />
      <ToolPage slug="image-to-webp" />
    </>
  );
}
