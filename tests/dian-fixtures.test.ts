import { describe, expect, it } from "vitest";
import { detectDocumentType, validate } from "../src/index.js";
import { expectValidUblResult } from "./helpers/assertions.js";
import {
  dianFixturesAvailable,
  DIAN_CORE_FIXTURES,
  listDianXmlFixtures,
  readDianXmlFixture,
} from "./helpers/dian-fixtures.js";

const describeDian = dianFixturesAvailable() ? describe : describe.skip;

describeDian("DIAN official XML exemplifications (UBL 2.1 structural)", () => {
  const fixtures = listDianXmlFixtures();

  it("loaded DIAN fixture set from SOURCE.json", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(DIAN_CORE_FIXTURES.length);
  });

  it.each(DIAN_CORE_FIXTURES.map((file) => [file] as const))(
    "validates core DIAN example %s against OASIS UBL XSD",
    async (file) => {
      const xml = readDianXmlFixture(file);
      const detected = detectDocumentType(xml);
      const result = await validate(xml, { format: "xml", documentType: detected.documentType });
      expectValidUblResult(result, {
        documentType: detected.documentType,
        format: "xml",
      });
    },
    30_000,
  );

  it.each(
    fixtures
      .filter((file) => !DIAN_CORE_FIXTURES.includes(file as (typeof DIAN_CORE_FIXTURES)[number]))
      .slice(0, 10)
      .map((file) => [file] as const),
  )(
    "smoke: DIAN example %s is parseable UBL XML",
    async (file) => {
      const xml = readDianXmlFixture(file);
      const detected = detectDocumentType(xml);
      const result = await validate(xml, {
        format: "xml",
        documentType: detected.documentType,
      });
      expect(["Invoice", "CreditNote", "DebitNote", "ApplicationResponse", "AttachedDocument"]).toContain(
        detected.documentType,
      );
      expect(result.format).toBe("xml");
      expect(result.ublVersion).toBe("2.1");
    },
    30_000,
  );
});

if (!dianFixturesAvailable()) {
  describe("DIAN fixtures (skipped)", () => {
    it("run npm run fixtures:dian to download official XML examples", () => {
      expect(true).toBe(true);
    });
  });
}
