import { beforeAll, describe, expect, it } from "vitest";
import { preloadDocumentTypes, validate } from "../src/index.js";
import { PEPPOL_PROFILE_ID } from "../src/detect-profile.js";
import { expectValidUblResult } from "./helpers/assertions.js";

const PEPPOL_INVOICE = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>T1</cbc:ID>
  <cbc:IssueDate>2024-01-15</cbc:IssueDate>
  <cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>Supplier</cbc:Name></cac:PartyName></cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party><cac:PartyName><cbc:Name>Customer</cbc:Name></cac:PartyName></cac:Party></cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal><cbc:PayableAmount currencyID="EUR">100.00</cbc:PayableAmount></cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:LineExtensionAmount currencyID="EUR">100.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Item</cbc:Description></cac:Item>
  </cac:InvoiceLine>
</Invoice>`;

describe("Peppol BIS profile", () => {
  beforeAll(async () => {
    await preloadDocumentTypes(["Invoice"]);
  });

  it("auto-detects peppol and runs profile stage", async () => {
    const result = await validate(PEPPOL_INVOICE);
    expect(result.meta?.profileDetected).toBe(PEPPOL_PROFILE_ID);
    expect(result.stages?.profile).toBeDefined();
    expectValidUblResult(result, { documentType: "Invoice", format: "xml" });
  });
});
