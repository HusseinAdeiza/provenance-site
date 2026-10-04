/**
 * data/site.ts — figures baked in AT BUILD TIME, not fetched by the browser.
 *
 * Every number on this page was read from either (a) the running Canton stack
 * or (b) proof.json — the eval suite's own output — seconds before the bundle
 * was produced. The build gate (../build.ts) fails if the stack is down, if
 * proof.json is stale, or if ANY check failed. A figure on this page and a
 * check in CI are the same artifact.
 */

export interface SiteData {
  /** live stack, read at build time */
  strangerSees: number;
  aiEnabled: boolean;
  auditorTrailEntries: number;
  auditorTrailCauses: number;
  issuerContracts: number;
  readAt: string;
  readAtUnix: number;
  /** eval proof — emitted by ../provenance/proof.sh */
  damlTestsOk: number;
  aiScreenPass: number;
  mcpEvalPass: number;
  liveDemoPass: number;
  proofAt: string;
}

import data from './site.generated.json'

export const site = data as SiteData
