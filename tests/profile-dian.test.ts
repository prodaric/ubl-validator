import { beforeAll, describe, expect, it } from "vitest";
import { preloadDocumentTypes, validate } from "../src/index.js";
import { DIAN_PROFILE_ID } from "../src/detect-profile.js";
import {
  dianFixturesAvailable,
  DIAN_CORE_FIXTURES,
  readDianXmlFixture,
} from "./helpers/dian-fixtures.js";

const describeDian = dianFixturesAvailable() ? describe : describe.skip;

describeDian("DIAN profile auto-validation", () => {
  beforeAll(async () => {
    await preloadDocumentTypes(["Invoice", "CreditNote", "DebitNote"]);
  });

  it.each(DIAN_CORE_FIXTURES.map((file) => [file] as const))(
    "auto-detects DIAN profile for %s",
    async (file) => {
      const xml = readDianXmlFixture(file);
      const result = await validate(xml, { format: "xml" });
      expect(result.meta?.profileDetected).toBe(DIAN_PROFILE_ID);
      expect(result.stages?.schema?.valid).toBe(true);
      expect(result.stages?.profile).toBeDefined();
    },
    60_000,
  );
});
