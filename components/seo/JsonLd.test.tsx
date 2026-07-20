import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonLd, serializeJsonLd } from "./JsonLd";

describe("JsonLd — server-only", () => {
  it("has no \"use client\" directive statement in source (must stay a Server Component)", () => {
    const source = readFileSync(path.join(__dirname, "JsonLd.tsx"), "utf8");
    // A directive is a standalone statement on its own line — not merely
    // the phrase appearing in prose/comments (this doc file's own JSDoc
    // mentions "use client" descriptively, which must not trip this up).
    expect(source).not.toMatch(/^\s*["']use client["'];?\s*$/m);
  });

  it("is a plain function component (no hooks), safely renderable via renderToStaticMarkup", () => {
    const markup = renderToStaticMarkup(
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Thing" }} />,
    );
    expect(markup).toContain('type="application/ld+json"');
  });
});

describe("JsonLd — renders exactly one script tag with the serialized payload", () => {
  it("embeds the serializeJsonLd output verbatim inside the script tag", () => {
    const data = { "@context": "https://schema.org", "@graph": [{ a: 1 }] };
    const markup = renderToStaticMarkup(<JsonLd data={data} />);
    expect(markup).toBe(
      `<script type="application/ld+json">${serializeJsonLd(data)}</script>`,
    );
  });
});

describe("serializeJsonLd — prevents </script> injection while staying valid JSON", () => {
  it("escapes every '<' so a raw '</script>' can never appear in the output", () => {
    const dangerous = {
      description: 'Trusted copy </script><script>alert(1)</script>',
    };
    const serialized = serializeJsonLd(dangerous);
    expect(serialized).not.toContain("</script>");
    expect(serialized).not.toContain("<script>");
    expect(serialized).toContain("\\u003c/script>");
    expect(serialized).toContain("\\u003cscript>");
  });

  it("round-trips through JSON.parse to the original value (still valid JSON)", () => {
    const data = {
      title: "A </script> tag inside a string",
      nested: { list: ["<b>bold</b>", 0, false] },
    };
    const serialized = serializeJsonLd(data);
    expect(JSON.parse(serialized)).toEqual(data);
  });

  it("escapes U+2028 / U+2029 line/paragraph separators", () => {
    const data = { text: `line one\u2028line two\u2029line three` };
    const serialized = serializeJsonLd(data);
    expect(serialized).not.toContain("\u2028");
    expect(serialized).not.toContain("\u2029");
    expect(JSON.parse(serialized)).toEqual(data);
  });

  it("matches raw JSON.stringify for payloads with nothing to escape", () => {
    const data = { a: 1, b: "plain string", c: [true, false, 0] };
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
