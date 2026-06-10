import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  getAllRegistryDocuments,
  getRegistryDocument,
  loadRegistry,
  UBL_DOCUMENT_TYPES,
} from "../src/registry/index.js";
import { schemasRoot } from "./helpers/fixtures.js";

describe("registry", () => {
  it("registers 65 UBL 2.1 document types", () => {
    expect(loadRegistry().documentCount).toBe(65);
    expect(UBL_DOCUMENT_TYPES).toHaveLength(65);
    expect(new Set(UBL_DOCUMENT_TYPES).size).toBe(65);
  });

  it("resolves XSD and JSON model paths for every document type", () => {
    for (const doc of getAllRegistryDocuments()) {
      expect(() => readFileSync(path.join(schemasRoot, doc.xsd), "utf8")).not.toThrow();
      expect(() => readFileSync(path.join(schemasRoot, doc.jsonModel), "utf8")).not.toThrow();
      expect(getRegistryDocument(doc.documentType).documentType).toBe(doc.documentType);
    }
  });

  it("indexes at least 30 official OASIS fixture pairs", () => {
    const withExamples = getAllRegistryDocuments().filter(
      (doc) => doc.exampleXml && doc.exampleJson,
    );
    expect(withExamples.length).toBeGreaterThanOrEqual(30);
  });
});
