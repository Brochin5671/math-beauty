/*
 * Single source of truth for every API endpoint shipped under src/pages/api/
 * Add an entry here when adding a new endpoint
 *
 * `path` uses Astro's route notation (so dynamic routes appear as
 * `/api/users/[id]`, matching the file at `src/pages/api/users/[id].ts`)
 *
 * `method` is the primary HTTP method the endpoint exports; multi-method
 * endpoints can repeat with different methods or use the most representative one
 */

/*
 * `emptyPayloadStatus` is what the endpoint answers for a well-formed request with an
 * empty JSON body, which is what the smoke spec sends. Without it the only assertable
 * contract is "not 404 and not 5xx", which 200, 400, 401, 403 and 429 all satisfy
 */
export const apiEndpoints: {
  path: string;
  method: string;
  description: string;
  emptyPayloadStatus: number;
}[] = [];

export type ApiEndpoint = (typeof apiEndpoints)[number];
