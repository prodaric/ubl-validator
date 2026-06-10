import { beforeAll, describe, expect, it } from "vitest";
import { validate, validateXml } from "../src/index.js";
import { preloadDocumentTypes as preloadXmlSchemas } from "../src/validate-xml.js";
import { getOasisOfficialExample } from "./helpers/oasis-official-examples.js";
import { readSchemaFixture } from "./helpers/fixtures.js";
import { expectInvalidUblResult } from "./helpers/assertions.js";

describe("validateXml", () => {
  beforeAll(async () => {
    await preloadXmlSchemas(["Invoice"]);
  });

  it("reports structural XSD violations with issue paths", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const xml = readSchemaFixture(invoice.exampleXml).replace("<cbc:ID>TOSL108</cbc:ID>", "");
    const result = await validate(xml, { format: "xml", documentType: "Invoice" });
    expectInvalidUblResult(result);
    expect(result.errors.some((issue) => issue.path || issue.message)).toBe(true);
  });

  it("reports malformed XML before schema validation", async () => {
    const result = await validateXml("<Invoice><unclosed>", "Invoice");
    expectInvalidUblResult(result);
    expect(result.errors[0]?.rule).toBe("XML_PARSE");
  });

  it("rejects unknown document types at registry lookup", async () => {
    const invoice = getOasisOfficialExample("Invoice");
    const xml = readSchemaFixture(invoice.exampleXml);
    await expect(validateXml(xml, "NotARealDoc")).rejects.toThrow(/Unknown UBL document type/);
  });
});
