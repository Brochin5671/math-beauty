import type { BlogPosting, BreadcrumbList, Organization, Service, WebSite } from "schema-dts";

// schema-dts types these as a union with string (JSON-LD allows either a full
// object or a URL reference). Narrow to the object form so consumers can read
// individual fields without union juggling.
type OrganizationSchema = Exclude<Organization, string> & {
  "@context": "https://schema.org";
};
type ServiceSchema = Exclude<Service, string> & {
  "@context": "https://schema.org";
};
type WebSiteSchema = Exclude<WebSite, string> & {
  "@context": "https://schema.org";
};
type ArticleSchema = Exclude<BlogPosting, string> & {
  "@context": "https://schema.org";
};
type BreadcrumbSchema = Exclude<BreadcrumbList, string> & {
  "@context": "https://schema.org";
};

interface OrganizationInput {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  sameAs?: string[];
  founder?: string;
}

export function buildOrganizationSchema(input: OrganizationInput): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: input.name,
    url: input.url,
    ...(input.logo ? { logo: new URL(input.logo, input.url).href } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
    ...(input.founder ? { founder: { "@type": "Person", name: input.founder } } : {}),
  };
}

interface ServiceInput {
  name: string;
  description: string;
  provider: string;
  providerUrl?: string;
  areaServed?: string;
  serviceType?: string;
}

export function buildServiceSchema(input: ServiceInput): ServiceSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: input.provider,
      ...(input.providerUrl ? { url: input.providerUrl } : {}),
    },
    ...(input.areaServed ? { areaServed: input.areaServed } : {}),
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
  };
}

interface WebSiteInput {
  name: string;
  url: string;
  description?: string;
}

// Site-wide WebSite entity. Emitted on every page alongside Organization; helps
// search engines associate the brand name with the domain.
export function buildWebSiteSchema(input: WebSiteInput): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    ...(input.description ? { description: input.description } : {}),
  };
}

interface ArticleInput {
  headline: string;
  description: string;
  /** Canonical URL of the post. */
  url: string;
  /** ISO date strings. */
  datePublished: string;
  dateModified?: string;
  author: string;
  /** Absolute image URL. */
  image?: string;
  publisher: { name: string; url: string; logo?: string };
}

// BlogPosting entity for a blog post. Powers article rich results (author, date).
export function buildArticleSchema(input: ArticleInput): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    url: input.url,
    mainEntityOfPage: input.url,
    datePublished: input.datePublished,
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: { "@type": "Person", name: input.author },
    publisher: {
      "@type": "Organization",
      name: input.publisher.name,
      url: input.publisher.url,
      ...(input.publisher.logo ? { logo: input.publisher.logo } : {}),
    },
    ...(input.image ? { image: input.image } : {}),
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

// Ordered breadcrumb trail. Powers breadcrumb rich results in search.
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
