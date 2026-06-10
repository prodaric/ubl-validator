import { describe, expect, it } from "vitest";
import { validate } from "../src/index.js";
import { expectIssueShape, expectValidUblResult } from "./helpers/assertions.js";
import { readSchemaFixture } from "./helpers/fixtures.js";

describe("ValidationResult contract", () => {
  it("includes stage summaries and oasis profile meta for trivial invoice", async () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = await validate(xml, { profile: "none" });

    expectValidUblResult(result, { documentType: "Invoice", format: "xml" });
    expect(result.stages?.schema?.valid).toBe(true);
    expect(result.stages?.ind?.valid).toBe(true);
    expect(result.stages?.profile).toBeUndefined();
    expect(result.meta?.profileDetected).toBe("oasis-ubl-2.1");
    expect(result.meta?.profileConfidence).toBe("fallback");
    expect(Array.isArray(result.meta?.profileSignals)).toBe(true);
  });

  it("issues conform to ValidationIssue shape", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"><cbc:ID xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"/></Invoice>`;
    const result = await validate(xml, { documentType: "Invoice", profile: "none" });

    expect(result.valid).toBe(false);
    for (const issue of [...result.errors, ...result.warnings]) {
      expectIssueShape(issue);
      expect(issue.stage).toBeDefined();
    }
  });
});

describe("package subpath exports", () => {
  it("loads profile and crypto entry points", async () => {
    const profile = await import("../src/profile/index.js");
    const crypto = await import("../src/crypto.js");

    expect(profile.DIAN_PROFILE_ID).toBe("dian-fe-1.9");
    expect(profile.listProfiles().length).toBeGreaterThan(0);
    expect(typeof crypto.validateCrypto).toBe("function");
  });
});
