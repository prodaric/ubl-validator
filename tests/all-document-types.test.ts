import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { getAllRegistryDocuments, preloadDocumentTypes, validate } from "../src/index.js";
import { schemasRoot } from "../src/schema-reader/index.js";

describe("all UBL 2.1 document types — OASIS XSD (profile:none)", () => {
  const documents = getAllRegistryDocuments();

  beforeAll(async () => {
    await preloadDocumentTypes(documents.map((d) => d.documentType));
  });

  it("registry lists 65 UBL 2.1 document types with XSD paths", () => {
    expect(documents).toHaveLength(65);
    for (const doc of documents) {
      expect(doc.xsd).toMatch(/\.xsd$/);
      expect(existsSync(path.join(schemasRoot, doc.xsd))).toBe(true);
    }
  });

  it.each(
    documents.filter((d) => d.exampleXml).map((d) => [d.documentType, d.exampleXml!] as const),
  )("%s official example validates against OASIS XSD", async (documentType, exampleXml) => {
    const xml = readFileSync(path.join(schemasRoot, exampleXml), "utf8");
    const result = await validate(xml, {
      format: "xml",
      documentType,
      profile: "none",
    });
    expect(result.stages?.schema?.valid).toBe(true);
    expect(result.errors.filter((e) => e.stage === "schema")).toEqual([]);
  }, 60_000);
});
