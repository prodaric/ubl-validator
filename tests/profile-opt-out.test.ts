import { describe, expect, it } from "vitest";
import { validate } from "../src/index.js";
import { readSchemaFixture } from "./helpers/fixtures.js";
import { expectValidUblResult } from "./helpers/assertions.js";

describe("profile opt-out", () => {
  it("profile:none skips ProfileStage on DIAN-like XML", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const withAuto = await validate(xml, { profile: "auto" });
    const withNone = await validate(xml, { profile: "none" });
    expect(withAuto.meta?.profileDetected).toBe("oasis-ubl-2.1");
    expect(withNone.stages?.profile).toBeUndefined();
    expectValidUblResult(withNone, { documentType: "Invoice", format: "xml" });
  });

  it("crypto opt-out does not add crypto stage", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await validate(xml, { profile: "none" });
    expect(result.stages?.crypto).toBeUndefined();
  });
});
