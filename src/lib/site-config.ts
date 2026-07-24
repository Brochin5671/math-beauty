/*
 * CONFIGURE: this file holds your brand identity and footer socials. Layout,
 * SEO, JSON-LD schemas, footer, and astro.config.mjs (the `site` URL +
 * favicons name/short-name) all source from here, so changes propagate
 * site-wide. Two exports every consumer must update:
 *   - `brand` (name, shortName, url, logo, email, founder, sameAs)
 *   - `socials` (footer links + brand SVG icons; can also be empty array)
 * Add your own data structures (lists, catalogs, products, posts, projects)
 * as your site requires; this is the single configuration surface for
 * site-wide content
 */

export interface FooterSocial {
  href: string;
  icon: string;
  label: string;
}

// CONFIGURE: gates whether a direct /500 hit previews the 500 design. Default
// dev-only: outside dev a direct /500 renders the 404 page instead. Real 500
// errors always render, and /404 is unaffected
export const previewErrorPages = import.meta.env.DEV;

export const brand = {
  name: "Fractal Viewer",
  shortName: "Fractal Viewer",
  url: "https://fractal-viewer.brochin5671.workers.dev",
  logo: "/og-logo.png",
  description:
    "An interactive viewer for escape fractals: the Mandelbrot, Burning Ship, Tricorn and Multibrot sets and their Julia variants, rendered in your browser.",
  email: "maximbrochin@gmail.com",
  founder: "Maxim Brochin",
  sameAs: ["https://github.com/Brochin5671"],
} as const;

// CONFIGURE: per-page meta descriptions (search results + social cards). One
// source of truth for the copy the SEO component renders. `defaultDescription`
// is the site-wide fallback any page without its own description inherits
export const pageMeta = {
  defaultDescription:
    "Explore escape fractals in your browser with camera controls, live coloring and keyboard shortcuts.",
  home: "View the Mandelbrot, Burning Ship, Tricorn and Multibrot sets and their Julia variants, with camera controls, coloring presets and keyboard shortcuts.",
} as const;

// CONFIGURE: SEO identity, sourced site-wide by the SEO component, the <title>
// builder, and the JSON-LD. `tagline` is the homepage title suffix and value
// prop. Leave `twitterHandle` empty to omit the twitter:site / :creator tags;
// set it to your @handle to include them. `ogImage` describes /og-logo.png
export const siteSeo = {
  tagline: "View several escape fractals!",
  locale: "en_US",
  twitterHandle: "",
  ogImage: { width: 512, height: 512, type: "image/png" },
  defaultAuthor: brand.founder,
} as const;

// drop the shipped placeholder email/socials so the org JSON-LD omits them
// instead of emitting example.com / your-org until they are configured
const isPlaceholder = (value: string) =>
  value.includes("example.com") || value.includes("your-org");

// Resolved site identity: `brand`/`siteSeo`, plus PUBLIC_SITE_* build env for the
// demo; site-wide consumers read `site`, shortName falls back to the name
export const site = {
  name: import.meta.env.PUBLIC_SITE_NAME || brand.name,
  shortName:
    import.meta.env.PUBLIC_SITE_SHORT_NAME || import.meta.env.PUBLIC_SITE_NAME || brand.shortName,
  url: import.meta.env.PUBLIC_SITE_URL || brand.url,
  logo: brand.logo,
  description: import.meta.env.PUBLIC_SITE_DESCRIPTION || brand.description,
  email: isPlaceholder(brand.email) ? undefined : brand.email,
  founder: brand.founder,
  sameAs: brand.sameAs.filter((url) => !isPlaceholder(url)),
  // `??` not `||`: an explicit empty tagline (the demo) means no title suffix
  tagline: import.meta.env.PUBLIC_SITE_TAGLINE ?? siteSeo.tagline,
} as const;

// CONFIGURE: replace SVG paths and href values with your real brand accounts
// Inline SVG keeps icons lightweight and theme-aware (currentColor)
export const socials: FooterSocial[] = [
  {
    href: "https://github.com/Brochin5671",
    icon: `<svg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='currentColor' viewBox='0 0 640 640'><path d='M320 16C152.3 16 16 152.3 16 320c0 134.4 87 248.4 207.7 288.5 15.2 2.8 20.7-6.6 20.7-14.6 0-7.2-.3-26.3-.4-51.6-84.5 18.4-102.3-40.8-102.3-40.8-13.8-35-33.7-44.3-33.7-44.3-27.5-18.8 2.1-18.4 2.1-18.4 30.4 2.1 46.4 31.2 46.4 31.2 27 46.3 70.9 32.9 88.2 25.2 2.7-19.6 10.6-32.9 19.2-40.5-67.5-7.7-138.4-33.8-138.4-150.2 0-33.2 11.8-60.4 31.2-81.6-3.1-7.7-13.5-38.6 3-80.4 0 0 25.5-8.2 83.4 31.2 24.2-6.7 50.1-10.1 75.8-10.2 25.7.1 51.6 3.5 75.8 10.2 57.9-39.4 83.4-31.2 83.4-31.2 16.5 41.8 6.1 72.7 3 80.4 19.4 21.2 31.2 48.4 31.2 81.6 0 116.7-71 142.4-138.6 149.9 10.9 9.4 20.6 27.9 20.6 56.2 0 40.6-.4 73.4-.4 83.3 0 8.1 5.5 17.6 20.9 14.6C537 568.4 624 454.4 624 320 624 152.3 487.7 16 320 16z' /></svg>`,
    label: "GitHub",
  },
];
