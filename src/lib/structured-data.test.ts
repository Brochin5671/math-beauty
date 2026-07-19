import { describe, expect, it } from "vitest";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  buildWebSiteSchema,
} from "./structured-data";

describe("buildOrganizationSchema", () => {
  const base = { name: "Site Name", url: "https://example.com" } as const;

  it("returns minimal Organization with required fields", () => {
    const schema = buildOrganizationSchema(base);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Site Name");
    expect(schema.url).toBe("https://example.com");
  });

  it("resolves relative logo against url", () => {
    const schema = buildOrganizationSchema({ ...base, logo: "/og-logo.png" });
    expect(schema.logo).toBe("https://example.com/og-logo.png");
  });

  it("preserves absolute logo url", () => {
    const schema = buildOrganizationSchema({ ...base, logo: "https://cdn.example.com/logo.png" });
    expect(schema.logo).toBe("https://cdn.example.com/logo.png");
  });

  it("omits optional fields when not provided", () => {
    const schema = buildOrganizationSchema(base);
    expect(schema).not.toHaveProperty("description");
    expect(schema).not.toHaveProperty("email");
    expect(schema).not.toHaveProperty("sameAs");
    expect(schema).not.toHaveProperty("founder");
  });

  it("includes all provided fields", () => {
    const schema = buildOrganizationSchema({
      ...base,
      description: "Software services",
      email: "hello@example.com",
      sameAs: ["https://linkedin.com/company/x", "https://twitter.com/x"],
      founder: "Founder Name",
    });
    expect(schema.description).toBe("Software services");
    expect(schema.email).toBe("hello@example.com");
    expect(schema.sameAs).toEqual(["https://linkedin.com/company/x", "https://twitter.com/x"]);
    expect(schema.founder).toEqual({ "@type": "Person", name: "Founder Name" });
  });

  it("drops empty sameAs array", () => {
    const schema = buildOrganizationSchema({ ...base, sameAs: [] });
    expect(schema).not.toHaveProperty("sameAs");
  });
});

describe("buildWebSiteSchema", () => {
  it("returns a WebSite with name and url", () => {
    const schema = buildWebSiteSchema({ name: "Site Name", url: "https://example.com" });
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe("Site Name");
    expect(schema.url).toBe("https://example.com");
  });

  it("includes description when provided", () => {
    const schema = buildWebSiteSchema({
      name: "Site Name",
      url: "https://example.com",
      description: "A demo",
    });
    expect(schema.description).toBe("A demo");
  });
});

describe("buildArticleSchema", () => {
  const input = {
    headline: "Hello",
    description: "A post",
    url: "https://example.com/blog/hello/",
    datePublished: "2026-05-10T00:00:00.000Z",
    author: "Jane Doe",
    publisher: {
      name: "Site Name",
      url: "https://example.com",
      logo: "https://example.com/og-logo.png",
    },
  };

  it("returns a BlogPosting with author Person and publisher Organization", () => {
    const schema = buildArticleSchema(input);
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Hello");
    expect(schema.datePublished).toBe("2026-05-10T00:00:00.000Z");
    expect(schema.author).toEqual({ "@type": "Person", name: "Jane Doe" });
    expect(schema.publisher).toMatchObject({ "@type": "Organization", name: "Site Name" });
    expect(schema.mainEntityOfPage).toBe("https://example.com/blog/hello/");
  });

  it("omits dateModified and image when not provided", () => {
    const schema = buildArticleSchema(input);
    expect(schema).not.toHaveProperty("dateModified");
    expect(schema).not.toHaveProperty("image");
  });

  it("includes dateModified and image when provided", () => {
    const schema = buildArticleSchema({
      ...input,
      dateModified: "2026-05-11T00:00:00.000Z",
      image: "https://example.com/og-logo.png",
    });
    expect(schema.dateModified).toBe("2026-05-11T00:00:00.000Z");
    expect(schema.image).toBe("https://example.com/og-logo.png");
  });
});

describe("buildBreadcrumbSchema", () => {
  it("numbers items from 1 in order", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Home", url: "https://example.com/" },
      { name: "Hello", url: "https://example.com/blog/hello/" },
    ]);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
      { "@type": "ListItem", position: 2, name: "Hello", item: "https://example.com/blog/hello/" },
    ]);
  });
});

describe("buildServiceSchema", () => {
  it("returns minimal Service with required fields", () => {
    const schema = buildServiceSchema({
      name: "Strategy",
      description: "Discovery and planning",
      provider: "Site Name",
    });
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Service");
    expect(schema.name).toBe("Strategy");
    expect(schema.provider).toEqual({
      "@type": "Organization",
      name: "Site Name",
    });
  });

  it("includes providerUrl when provided", () => {
    const schema = buildServiceSchema({
      name: "Build",
      description: "Engineering and shipping",
      provider: "Site Name",
      providerUrl: "https://example.com",
    });
    expect(schema.provider).toEqual({
      "@type": "Organization",
      name: "Site Name",
      url: "https://example.com",
    });
  });

  it("includes areaServed and serviceType when provided", () => {
    const schema = buildServiceSchema({
      name: "Run",
      description: "Maintenance and operations",
      provider: "Site Name",
      areaServed: "Worldwide",
      serviceType: "Software Maintenance",
    });
    expect(schema.areaServed).toBe("Worldwide");
    expect(schema.serviceType).toBe("Software Maintenance");
  });
});
