/**
 * Official OASIS JSON model examples that do not pass the bundled JSON Schema.
 * XML fixtures for the same document types still validate.
 */
export const OFFICIAL_JSON_FIXTURE_GAPS = new Set(["OrderResponse"]);

/**
 * Official OASIS XML examples that use empty elements (IND5) while still passing XSD.
 */
export const OFFICIAL_IND5_FIXTURE_GAPS = new Set([
  "ForecastRevision",
  "OrderResponse",
  "ProductActivity",
]);
