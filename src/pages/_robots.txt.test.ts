import { describe, expect, it } from "vitest";
import { getRobotsTxt } from "@/pages/robots.txt";

describe("getRobotsTxt", () => {
  const sitemapURL = new URL("sitemap-index.xml", "https://example.com");
  const output = getRobotsTxt(sitemapURL);

  it("contains User-agent directive", () => {
    expect(output).toContain("User-agent: *");
  });

  it("contains Allow directive", () => {
    expect(output).toContain("Allow: /");
  });

  it("contains Sitemap with correct URL", () => {
    expect(output).toContain("Sitemap: https://example.com/sitemap-index.xml");
  });
});
