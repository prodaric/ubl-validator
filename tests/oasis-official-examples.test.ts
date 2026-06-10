import { existsSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { detectDocumentType, preloadDocumentTypes, validate } from "../src/index.js";
import { expectValidUblResult, expectSchemaValidUblResult } from "./helpers/assertions.js";
import { readSchemaFixture, schemasRoot } from "./helpers/fixtures.js";
import {
  getOasisJsonFixtureGaps,
  getOasisJsonValidExamples,
  getOasisOfficialExamples,
  OASIS_OFFICIAL_EXAMPLE_COUNT,
  oasisExampleCases,
} from "./helpers/oasis-official-examples.js";
import { OFFICIAL_IND5_FIXTURE_GAPS } from "./helpers/known-fixture-gaps.js";

describe("OASIS UBL 2.1 — 33 official exemplifications", () => {
  const examples = getOasisOfficialExamples();
  const cases = oasisExampleCases();

  beforeAll(async () => {
    await preloadDocumentTypes(examples.map((entry) => entry.documentType));
  });

  describe("catalog", () => {
    it("indexes exactly 33 official XML+JSON pairs in the registry", () => {
      expect(examples).toHaveLength(OASIS_OFFICIAL_EXAMPLE_COUNT);
      expect(cases).toHaveLength(OASIS_OFFICIAL_EXAMPLE_COUNT);
    });

    it.each(cases.map(([documentType, exampleXml, exampleJson]) => [documentType, exampleXml, exampleJson] as const))(
      "%s fixture files exist on disk",
      (documentType, exampleXml, exampleJson) => {
        expect(existsSync(path.join(schemasRoot, exampleXml)), `${documentType} XML`).toBe(true);
        expect(existsSync(path.join(schemasRoot, exampleJson)), `${documentType} JSON`).toBe(true);
      },
    );
  });

  describe("XML (33/33 must validate against OASIS XSD)", () => {
    it.each(cases.map(([documentType, exampleXml]) => [documentType, exampleXml] as const))(
      "%s — explicit XML validation",
      async (documentType, exampleXml) => {
        const xml = readSchemaFixture(exampleXml);
        const result = await validate(xml, { format: "xml", documentType });
        expectSchemaValidUblResult(result, { documentType, format: "xml" });
        if (OFFICIAL_IND5_FIXTURE_GAPS.has(documentType)) {
          expect(result.errors.some((e) => e.rule === "IND5_EMPTY_ELEMENT")).toBe(true);
        } else {
          expect(result.valid).toBe(true);
        }
      },
      30_000,
    );

    it.each(cases.map(([documentType, exampleXml]) => [documentType, exampleXml] as const))(
      "%s — auto-detect from XML",
      async (documentType, exampleXml) => {
        const xml = readSchemaFixture(exampleXml);
        expect(detectDocumentType(xml)).toEqual({ documentType, format: "xml" });
        const result = await validate(xml);
        expectSchemaValidUblResult(result, { documentType, format: "xml" });
        expect(["oasis-ubl-2.1", "bii-legacy"]).toContain(result.meta?.profileDetected);
        if (!OFFICIAL_IND5_FIXTURE_GAPS.has(documentType)) {
          expect(result.valid).toBe(true);
        }
      },
      30_000,
    );
  });

  describe("JSON model (32/33 validate; OrderResponse gap documented)", () => {
    it.each(
      getOasisJsonValidExamples().map((entry) => [entry.documentType, entry.exampleJson] as const),
    )(
      "%s — JSON model validation",
      async (documentType, exampleJson) => {
        const json = readSchemaFixture(exampleJson);
        const result = await validate(json, { format: "json", documentType });
        expectValidUblResult(result, { documentType, format: "json" });
      },
      30_000,
    );

    it("expects 32 JSON examples to pass and 1 documented gap", () => {
      expect(getOasisJsonValidExamples()).toHaveLength(OASIS_OFFICIAL_EXAMPLE_COUNT - 1);
      expect(getOasisJsonFixtureGaps()).toHaveLength(1);
      expect(getOasisJsonFixtureGaps()[0]?.documentType).toBe("OrderResponse");
    });

    it("OrderResponse JSON — documented OASIS fixture gap (additionalProperties)", async () => {
      const entry = getOasisJsonFixtureGaps()[0];
      const json = readSchemaFixture(entry.exampleJson);
      const result = await validate(json, { format: "json", documentType: entry.documentType });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every((issue) => issue.rule === "additionalProperties")).toBe(true);
    });

    it("OrderResponse XML — still valid despite JSON gap", async () => {
      const entry = getOasisJsonFixtureGaps()[0];
      const xml = readSchemaFixture(entry.exampleXml);
      const result = await validate(xml, { format: "xml", documentType: entry.documentType });
      expectSchemaValidUblResult(result, { documentType: entry.documentType, format: "xml" });
    });
  });
});
