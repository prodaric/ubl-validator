import { afterEach, describe, expect, it } from "vitest";
import { runProfileStage } from "../src/pipeline/stages/profile-stage.js";
import { resetProfileRegistryCache, setProfileRegistry } from "../src/profile/registry.js";
import { readSchemaFixture } from "./helpers/fixtures.js";

describe("ProfileStage branches", () => {
  afterEach(() => {
    resetProfileRegistryCache();
  });

  it("warns when profile does not list document type", async () => {
    setProfileRegistry({
      generatedAt: new Date().toISOString(),
      profiles: [
        {
          id: "invoice-only",
          label: "Invoice only",
          match: {},
          schematron: [],
          documentTypes: ["Invoice"],
        },
      ],
    });
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await runProfileStage(xml, "invoice-only", "CreditNote");
    expect(result.warnings[0]?.code).toBe("PROFILE_DOCUMENT_TYPE");
  });

  it("errors when schematron artifacts are missing", async () => {
    setProfileRegistry({
      generatedAt: new Date().toISOString(),
      profiles: [
        {
          id: "missing-sch",
          label: "Missing",
          match: {},
          schematron: ["vendor/does-not-exist/rules.sch"],
          documentTypes: ["Invoice"],
        },
      ],
    });
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await runProfileStage(xml, "missing-sch", "Invoice");
    expect(result.errors[0]?.code).toBe("PROFILE_ARTIFACTS_MISSING");
  });
});
