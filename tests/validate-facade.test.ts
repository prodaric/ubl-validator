import { describe, expect, it } from "vitest";
import { preloadDocumentTypes, validate } from "../src/index.js";
import { invoiceJson, invoiceJsonObject, invoiceXml } from "./helpers/fixtures.js";
import { expectValidUblResult } from "./helpers/assertions.js";

describe("validate facade", () => {
  it("auto-detects XML format and document type", async () => {
    const result = await validate(invoiceXml);
    expectValidUblResult(result, { documentType: "Invoice", format: "xml" });
  });

  it("auto-detects JSON format and document type", async () => {
    const result = await validate(invoiceJson);
    expectValidUblResult(result, { documentType: "Invoice", format: "json" });
  });

  it("validates JSON objects without re-serialization ambiguity", async () => {
    const result = await validate(invoiceJsonObject);
    expectValidUblResult(result, { documentType: "Invoice", format: "json" });
  });

  it("preloads validators for repeated calls", async () => {
    await preloadDocumentTypes(["Invoice"]);
    const first = await validate(invoiceXml, { format: "xml", documentType: "Invoice" });
    const second = await validate(invoiceJson, { format: "json", documentType: "Invoice" });
    expect(first.valid).toBe(true);
    expect(second.valid).toBe(true);
  });
});
