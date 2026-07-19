/// <reference types="astro/client" />

// Demo-only build-time brand overrides (set in cd.yml); unset for consumers, so
// the `site` resolver in site-config.ts falls back to `brand`
interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_SHORT_NAME?: string;
  readonly PUBLIC_SITE_TAGLINE?: string;
  readonly PUBLIC_SITE_DESCRIPTION?: string;
}
