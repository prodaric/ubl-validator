import { beforeAll, describe, expect, it } from "vitest";
import { validate, validateXml } from "../src/index.js";
import { preloadDocumentTypes as preloadXmlSchemas } from "../src/validate-xml.js";
import { creditNoteXml, invoiceXml, orderXml } from "./helpers/fixtures.js";
import { expectInvalidUblResult, expectValidUblResult } from "./helpers/assertions.js";

describe("validateXml", () => {
  beforeAll(async () => {
    await preloadXmlSchemas(["Invoice", "CreditNote", "Order"]);
  });

  it("validates official Invoice, CreditNote and Order examples", async () => {
    for (const [xml, documentType] of [
      [invoiceXml, "Invoice"],
      [creditNoteXml, "CreditNote"],
      [orderXml, "Order"],
    ] as const) {
      const result = await validateXml(xml, documentType);
      expectValidUblResult(result, { documentType, format: "xml" });
    }
  });

  it("reports structural XSD violations with issue paths", async () => {
    const xml = invoiceXml.replace("<cbc:ID>TOSL108</cbc:ID>", "");
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
    await expect(validateXml(invoiceXml, "NotARealDoc")).rejects.toThrow(/Unknown UBL document type/);
  });
});
