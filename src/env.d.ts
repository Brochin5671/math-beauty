/// <reference types="astro/client" />

// Optional build-time brand overrides. Unset by default, so the `site` resolver in
// site-config.ts falls back to `brand`
interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_SHORT_NAME?: string;
  readonly PUBLIC_SITE_TAGLINE?: string;
  readonly PUBLIC_SITE_DESCRIPTION?: string;
}
