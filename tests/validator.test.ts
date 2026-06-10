import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  detectDocumentType,
  getAllRegistryDocuments,
  getRegistryDocument,
  UBL_DOCUMENT_TYPES,
  validate,
} from "../src/index.js";
import { schemasRoot } from "../src/schema-reader/node-reader.js";

const fixtures = {
  invoiceXml: path.join(schemasRoot, "vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example.xml"),
  creditNoteXml: path.join(schemasRoot, "vendor/ubl-2.1/xml/UBL-CreditNote-2.1-Example.xml"),
  orderXml: path.join(schemasRoot, "vendor/ubl-2.1/xml/UBL-Order-2.1-Example.xml"),
  invoiceJson: path.join(
    schemasRoot,
    "vendor/ubl-2.1-json-v2.0/json-model/UBL-Invoice-2.1-Example.json",
  ),
};

describe("registry", () => {
  it("registers 65 UBL 2.1 document types", () => {
    expect(UBL_DOCUMENT_TYPES.length).toBe(65);
  });

  it("resolves schema paths for every document type", () => {
    for (const doc of getAllRegistryDocuments()) {
      expect(() => readFileSync(path.join(schemasRoot, doc.xsd), "utf8")).not.toThrow();
      expect(() => readFileSync(path.join(schemasRoot, doc.jsonModel), "utf8")).not.toThrow();
      expect(getRegistryDocument(doc.documentType).documentType).toBe(doc.documentType);
    }
  });
});

describe("detectDocumentType", () => {
  it("detects Invoice from XML", () => {
    const xml = readFileSync(fixtures.invoiceXml, "utf8");
    expect(detectDocumentType(xml).documentType).toBe("Invoice");
  });

  it("detects Invoice from JSON", () => {
    const json = readFileSync(fixtures.invoiceJson, "utf8");
    expect(detectDocumentType(json).documentType).toBe("Invoice");
  });
});

describe("validate XML", () => {
  it("validates official Invoice example", async () => {
    const xml = readFileSync(fixtures.invoiceXml, "utf8");
    const result = await validate(xml, { format: "xml" });
    expect(result.valid).toBe(true);
    expect(result.documentType).toBe("Invoice");
    expect(result.errors).toHaveLength(0);
  });

  it("validates official CreditNote example", async () => {
    const xml = readFileSync(fixtures.creditNoteXml, "utf8");
    const result = await validate(xml, { format: "xml" });
    expect(result.valid).toBe(true);
    expect(result.documentType).toBe("CreditNote");
  });

  it("validates official Order example", async () => {
    const xml = readFileSync(fixtures.orderXml, "utf8");
    const result = await validate(xml, { format: "xml" });
    expect(result.valid).toBe(true);
    expect(result.documentType).toBe("Order");
  });

  it("reports invalid XML structure", async () => {
    const xml = readFileSync(fixtures.invoiceXml, "utf8").replace(
      "<cbc:ID>TOSL108</cbc:ID>",
      "",
    );
    const result = await validate(xml, { format: "xml", documentType: "Invoice" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validate JSON", () => {
  it("validates official Invoice JSON example", async () => {
    const json = readFileSync(fixtures.invoiceJson, "utf8");
    const result = await validate(json, { format: "json" });
    expect(result.valid).toBe(true);
    expect(result.documentType).toBe("Invoice");
  });

  it("reports missing required JSON property", async () => {
    const parsed = JSON.parse(readFileSync(fixtures.invoiceJson, "utf8")) as Record<string, unknown>;
    delete parsed.Invoice;
    const result = await validate(parsed, {
      format: "json",
      documentType: "Invoice",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
