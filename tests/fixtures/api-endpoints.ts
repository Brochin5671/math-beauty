/*
 * Single source of truth for every API endpoint shipped under src/pages/api/
 * CONFIGURE: add an entry here when adding a new endpoint; remove the entry
 * (and the route file) if you do not need APIs at all
 *
 * `path` uses Astro's route notation (so dynamic routes appear as
 * `/api/users/[id]`, matching the file at `src/pages/api/users/[id].ts`)
 *
 * `method` is the primary HTTP method the endpoint exports; multi-method
 * endpoints can repeat with different methods or use the most representative one
 */

export const apiEndpoints: { path: string; method: string; description: string }[] = [];

export type ApiEndpoint = (typeof apiEndpoints)[number];
