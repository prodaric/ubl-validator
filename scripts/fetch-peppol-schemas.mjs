#!/usr/bin/env node
/**
 * Peppol BIS Billing 3.0 — Schematron rules for profile integration.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "schemas/vendor/peppol-bis-billing-3/schematron");

function main() {
  mkdirSync(outDir, { recursive: true });
  const schPath = path.join(outDir, "Peppol-BIS-Billing-3.0.sch");
  if (!existsSync(schPath)) {
    writeFileSync(
      schPath,
      `<?xml version="1.0" encoding="UTF-8"?>
<schema xmlns="http://purl.oclc.org/dsdl/schematron" queryBinding="xslt2">
  <pattern id="peppol-billing">
    <rule context="/*[local-name()='Invoice' or local-name()='CreditNote']">
      <assert test="exists(//*[local-name()='CustomizationID'])">Peppol: CustomizationID is required.</assert>
      <assert test="exists(//*[local-name()='ProfileID'])">Peppol: ProfileID is required.</assert>
      <assert test="exists(//*[local-name()='AccountingSupplierParty'])">Peppol: AccountingSupplierParty is required.</assert>
      <assert test="exists(//*[local-name()='AccountingCustomerParty'])">Peppol: AccountingCustomerParty is required.</assert>
    </rule>
  </pattern>
</schema>
`,
      "utf8",
    );
  }
  writeFileSync(
    path.join(root, "schemas/vendor/peppol-bis-billing-3/SOURCE.json"),
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        profile: "peppol-bis-billing-3",
        note: "Minimal Schematron for integration tests.",
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log("Peppol profile artifacts ready under schemas/vendor/peppol-bis-billing-3/");
}

main();
