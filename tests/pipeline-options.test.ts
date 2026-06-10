import { describe, expect, it } from "vitest";
import { validate } from "../src/index.js";
import { runProfileStage } from "../src/pipeline/stages/profile-stage.js";
import { readSchemaFixture } from "./helpers/fixtures.js";

describe("ProfileStage edge cases", () => {
  it("returns error for unknown profile id", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await runProfileStage(xml, "nonexistent-profile", "Invoice");
    expect(result.errors[0]?.code).toBe("PROFILE_UNKNOWN");
  });

  it("codelist opt-in adds codelist stage", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await validate(xml, { profile: "none", codelist: true });
    expect(result.stages?.codelist).toBeDefined();
  });

  it("failFast stops after schema errors", async () => {
    const xml = "<not-ubl/>";
    const result = await validate(xml, { failFast: true });
    expect(result.stages?.ind).toBeUndefined();
  });

  it("JSON path warns when non-OASIS profile detected", async () => {
    const json = {
      Invoice: {
        CustomizationID: "urn:fdc:peppol.eu:2017:poacc:billing:3.0",
        ProfileID: "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
        ID: "1",
      },
    };
    const result = await validate(json, { format: "json", documentType: "Invoice" });
    expect(result.warnings.some((w) => w.rule === "PROFILE_JSON")).toBe(true);
  });
});
