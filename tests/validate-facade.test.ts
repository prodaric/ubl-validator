import { describe, expect, it } from "vitest";
import { preloadDocumentTypes, validate } from "../src/index.js";
import { getOasisOfficialExample } from "./helpers/oasis-official-examples.js";
import { readSchemaFixture } from "./helpers/fixtures.js";
import { expectValidUblResult } from "./helpers/assertions.js";

describe("validate facade", () => {
  it("auto-detects format and document type for OASIS Invoice", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const xmlResult = await validate(readSchemaFixture(invoice.exampleXml));
    const jsonResult = await validate(readSchemaFixture(invoice.exampleJson));
    expectValidUblResult(xmlResult, { documentType: "Invoice", format: "xml" });
    expectValidUblResult(jsonResult, { documentType: "Invoice", format: "json" });
  });

  it("validates JSON objects without re-serialization ambiguity", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const object = JSON.parse(readSchemaFixture(invoice.exampleJson)) as Record<string, unknown>;
    const result = await validate(object);
    expectValidUblResult(result, { documentType: "Invoice", format: "json" });
  });

  it("preloads validators for repeated calls", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    await preloadDocumentTypes(["Invoice"]);
    const first = await validate(readSchemaFixture(invoice.exampleXml), {
      format: "xml",
      documentType: "Invoice",
    });
    const second = await validate(readSchemaFixture(invoice.exampleJson), {
      format: "json",
      documentType: "Invoice",
    });
    expect(first.valid).toBe(true);
    expect(second.valid).toBe(true);
  });
});
