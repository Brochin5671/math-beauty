import { describe, expect, it } from "vitest";
import { buildAbsoluteURL, buildCanonicalURL, buildMetaTitle } from "./seo";

describe("buildMetaTitle", () => {
  it("suffixes the brand after a page title", () => {
    expect(buildMetaTitle("About", "Acme")).toBe("About - Acme");
  });

  it("leads with brand + tagline for the homepage (no title)", () => {
    expect(buildMetaTitle(undefined, "Acme", "We build things")).toBe("Acme - We build things");
  });

  it("falls back to just the brand when there is no tagline", () => {
    expect(buildMetaTitle(undefined, "Acme")).toBe("Acme");
  });
});

describe("buildCanonicalURL", () => {
  const site = new URL("https://example.com");

  it("constructs canonical from pathname", () => {
    expect(buildCanonicalURL("/about", site)).toBe("https://example.com/about");
  });

  it("handles root path", () => {
    expect(buildCanonicalURL("/", site)).toBe("https://example.com/");
  });

  it("handles nested paths", () => {
    expect(buildCanonicalURL("/privacy-policy", site)).toBe("https://example.com/privacy-policy");
  });
});

describe("buildAbsoluteURL", () => {
  const site = new URL("https://example.com");

  it("resolves a relative image path against the site", () => {
    expect(buildAbsoluteURL("/og-logo.png", site)).toBe("https://example.com/og-logo.png");
  });

  it("leaves an already-absolute URL untouched", () => {
    expect(buildAbsoluteURL("https://cdn.example.com/a.png", site)).toBe(
      "https://cdn.example.com/a.png",
    );
  });
});
