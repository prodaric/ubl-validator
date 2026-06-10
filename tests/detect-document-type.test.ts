import { describe, expect, it } from "vitest";
import {
  detectDocumentType,
  detectDocumentTypeFromJson,
  detectDocumentTypeFromXml,
  inferFormat,
  normalizeInput,
  resolveFormat,
} from "../src/detect-document-type.js";
import {
  creditNoteXml,
  invoiceJson,
  invoiceJsonObject,
  invoiceXml,
  orderXml,
} from "./helpers/fixtures.js";

describe("inferFormat / resolveFormat", () => {
  it("infers xml and json from trimmed input", () => {
    expect(inferFormat("  <Invoice/>")).toBe("xml");
    expect(inferFormat('  {"Invoice":{}}')).toBe("json");
    expect(inferFormat("  [{\"Invoice\":{}}]")).toBe("json");
  });

  it("throws when format cannot be inferred", () => {
    expect(() => inferFormat("not-xml-or-json")).toThrow(/Unable to infer format/);
  });

  it("honours explicit format over inference", () => {
    expect(resolveFormat("xml", '{"Invoice":{}}')).toBe("xml");
    expect(resolveFormat("json", "<Invoice/>")).toBe("json");
  });
});

describe("detectDocumentType", () => {
  it("detects Invoice from XML and JSON strings", () => {
    expect(detectDocumentType(invoiceXml)).toEqual({
      documentType: "Invoice",
      format: "xml",
    });
    expect(detectDocumentType(invoiceJson)).toEqual({
      documentType: "Invoice",
      format: "json",
    });
  });

  it("detects CreditNote and Order from XML", () => {
    expect(detectDocumentTypeFromXml(creditNoteXml)).toBe("CreditNote");
    expect(detectDocumentTypeFromXml(orderXml)).toBe("Order");
  });

  it("detects document type from JSON object", () => {
    expect(detectDocumentType(invoiceJsonObject)).toEqual({
      documentType: "Invoice",
      format: "json",
    });
    expect(detectDocumentTypeFromJson(invoiceJsonObject)).toBe("Invoice");
  });

  it("ignores namespace metadata keys in JSON", () => {
    expect(
      detectDocumentTypeFromJson({
        _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
        Invoice: { ID: [{ _: "1" }] },
      }),
    ).toBe("Invoice");
  });

  it("rejects unknown XML root elements", () => {
    expect(() => detectDocumentTypeFromXml("<UnknownDoc/>")).toThrow(/Unknown UBL root element/);
  });

  it("rejects JSON without a document root property", () => {
    expect(() => detectDocumentTypeFromJson({ _D: "x", foo: 1 })).toThrow(
      /Unable to detect UBL document type/,
    );
  });
});

describe("normalizeInput", () => {
  it("preserves string input and wraps objects", () => {
    expect(normalizeInput("<Invoice/>")).toEqual({ text: "<Invoice/>" });
    const object = { Invoice: {} };
    expect(normalizeInput(object)).toEqual({
      text: JSON.stringify(object),
      object,
    });
  });
});
