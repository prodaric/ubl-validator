import { describe, expect, it } from "vitest";
import {
  detectProfileFromSignals,
  DIAN_PROFILE_ID,
  OASIS_PROFILE_ID,
  PEPPOL_PROFILE_ID,
} from "../src/detect-profile.js";
import { readSchemaFixture } from "./helpers/fixtures.js";
import { readDianXmlFixture, dianFixturesAvailable } from "./helpers/dian-fixtures.js";

describe("detectProfile", () => {
  it("detects oasis-ubl-2.1 for OASIS Trivial Invoice", () => {
    const xml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml");
    const result = detectProfileFromSignals({ xml, documentType: "Invoice" });
    expect(result.profileId).toBe(OASIS_PROFILE_ID);
    expect(result.confidence).toBe("fallback");
  });

  it("detects dian-fe-1.9 for DIAN Consumidor Final", () => {
    if (!dianFixturesAvailable()) return;
    const xml = readDianXmlFixture("Consumidor Final.xml");
    const result = detectProfileFromSignals({ xml, documentType: "Invoice" });
    expect(result.profileId).toBe(DIAN_PROFILE_ID);
    expect(result.confidence).toBe("certain");
    expect(result.signals).toContain("sts:DianExtensions");
  });

  it("detects peppol-bis-billing-3 from Peppol URNs", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>1</cbc:ID>
</Invoice>`;
    const result = detectProfileFromSignals({ xml, documentType: "Invoice" });
    expect(result.profileId).toBe(PEPPOL_PROFILE_ID);
  });
});
