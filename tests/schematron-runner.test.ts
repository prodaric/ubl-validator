import { describe, expect, it } from "vitest";
import { validateSchematronFiles } from "../src/profile/schematron/runner.js";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>test</cbc:CustomizationID>
  <cbc:ProfileID>test</cbc:ProfileID>
</Invoice>`;

describe("Schematron runner", () => {
  it("evaluates exists() and count() rules from bundled DIAN sch", async () => {
    const result = await validateSchematronFiles(SAMPLE_XML, [
      "vendor/dian-fe-1.9/schematron/UBL-Invoice-DIAN.sch",
    ]);
    expect(result.errors.some((e) => e.message.includes("DianExtensions"))).toBe(true);
  });

  it("evaluates Peppol bundled rules", async () => {
    const peppolXml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cac:AccountingSupplierParty><cac:Party/></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party/></cac:AccountingCustomerParty>
</Invoice>`;
    const result = await validateSchematronFiles(peppolXml, [
      "vendor/peppol-bis-billing-3/schematron/Peppol-BIS-Billing-3.0.sch",
    ]);
    expect(result.errors).toEqual([]);
  });

  it("skips missing sch files silently", async () => {
    const result = await validateSchematronFiles(SAMPLE_XML, ["vendor/missing/rules.sch"]);
    expect(result.errors).toEqual([]);
  });
});
