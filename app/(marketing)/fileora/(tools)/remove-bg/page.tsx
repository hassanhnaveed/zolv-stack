import { JsonLd } from "@/components/seo/JsonLd";
import { buildJsonLdForRoute, buildMetadataForRoute } from "@/lib/seo";

const routeId = "remove-bg";

export const metadata = buildMetadataForRoute(routeId);

export default function Page() {
  return (
    <>
      <JsonLd data={buildJsonLdForRoute(routeId)} />
      <main style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 80px" }}>
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              background: "var(--color-bg-2)",
              border: "1px dashed var(--color-border)",
              borderRadius: 16,
            }}
          >
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--color-text-1)",
                marginBottom: 8,
              }}
            >
              🚧 Coming Soon
            </p>
            <p style={{ fontSize: 14, color: "var(--color-text-3)" }}>
              Background Remover is currently being finalized. Check back soon!
            </p>
          </div>
        </div>
      </main>
    </>
  );
}