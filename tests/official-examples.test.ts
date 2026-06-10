import { beforeAll, describe, expect, it } from "vitest";
import { preloadDocumentTypes, validate } from "../src/index.js";
import {
  documentsWithOfficialExamples,
  readSchemaFixture,
} from "./helpers/fixtures.js";
import { OFFICIAL_JSON_FIXTURE_GAPS } from "./helpers/known-fixture-gaps.js";

describe("official OASIS examples", () => {
  const documents = documentsWithOfficialExamples();

  beforeAll(async () => {
    await preloadDocumentTypes(documents.map((doc) => doc.documentType));
  });

  it.each(documents.map((doc) => [doc.documentType, doc.exampleXml!, doc.exampleJson!] as const))(
    "validates %s XML and JSON fixtures",
    async (documentType, exampleXml, exampleJson) => {
      const xml = readSchemaFixture(exampleXml);
      const json = readSchemaFixture(exampleJson);

      const xmlResult = await validate(xml, { format: "xml", documentType });
      const jsonResult = await validate(json, { format: "json", documentType });

      expect(xmlResult.valid, `${documentType} XML`).toBe(true);
      if (OFFICIAL_JSON_FIXTURE_GAPS.has(documentType)) {
        expect(jsonResult.valid, `${documentType} JSON (known OASIS fixture gap)`).toBe(false);
      } else {
        expect(jsonResult.valid, `${documentType} JSON`).toBe(true);
      }
      expect(xmlResult.documentType).toBe(documentType);
      expect(jsonResult.documentType).toBe(documentType);
    },
    60_000,
  );

  it("documents the OrderResponse JSON fixture gap", async () => {
    const doc = documents.find((entry) => entry.documentType === "OrderResponse");
    expect(doc?.exampleJson).toBeDefined();
    const json = readSchemaFixture(doc!.exampleJson!);
    const result = await validate(json, { format: "json", documentType: "OrderResponse" });
    expect(result.valid).toBe(false);
    expect(result.errors.every((issue) => issue.rule === "additionalProperties")).toBe(true);
  });
});
