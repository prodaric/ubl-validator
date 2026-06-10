#!/usr/bin/env node
/**
 * Builds schemas/profiles/registry.json from vendor profile artifacts.
 */
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorRoot = path.join(root, "schemas/vendor");
const outPath = path.join(root, "schemas/profiles/registry.json");

function findSchematron(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSchematron(full));
    } else if (entry.name.endsWith(".sch")) {
      results.push(path.relative(path.join(root, "schemas"), full).split(path.sep).join("/"));
    }
  }
  return results;
}

const dianSch = findSchematron(path.join(vendorRoot, "dian-fe-1.9/schematron"));
const peppolSch = findSchematron(path.join(vendorRoot, "peppol-bis-billing-3/schematron"));

const registry = {
  generatedAt: new Date().toISOString(),
  profiles: [
    {
      id: "oasis-ubl-2.1",
      label: "OASIS UBL 2.1 base",
      match: {},
      schematron: [],
      documentTypes: [],
    },
    {
      id: "dian-fe-1.9",
      label: "DIAN Factura Electrónica v1.9 (Colombia)",
      match: {
        xmlNamespaces: ["dian:gov:co:facturaelectronica"],
        profileIdPatterns: ["DIAN"],
        uuidSchemePatterns: ["CUFE-SHA384"],
      },
      schema: existsSync(path.join(vendorRoot, "dian-fe-1.9/xsd/DIAN-Structures-2.1.xsd"))
        ? { extensionXsd: "vendor/dian-fe-1.9/xsd/DIAN-Structures-2.1.xsd" }
        : undefined,
      schematron:
        dianSch.length > 0
          ? dianSch
          : [
              "vendor/dian-fe-1.9/schematron/UBL-Invoice-DIAN.sch",
              "vendor/dian-fe-1.9/schematron/UBL-CreditNote-DIAN.sch",
              "vendor/dian-fe-1.9/schematron/UBL-DebitNote-DIAN.sch",
            ],
      documentTypes: [
        "Invoice",
        "CreditNote",
        "DebitNote",
        "ApplicationResponse",
        "AttachedDocument",
      ],
      crypto: { cufe: true, xades: true },
    },
    {
      id: "peppol-bis-billing-3",
      label: "Peppol BIS Billing 3.0",
      match: {
        customizationIdPatterns: ["peppol\\.eu", "en16931"],
        profileIdPatterns: ["peppol\\.eu", "poacc:billing"],
      },
      schematron:
        peppolSch.length > 0
          ? peppolSch
          : ["vendor/peppol-bis-billing-3/schematron/Peppol-BIS-Billing-3.0.sch"],
      documentTypes: ["Invoice", "CreditNote"],
      crypto: {},
    },
    {
      id: "bii-legacy",
      label: "CEN BII legacy profile",
      match: { profileIdPatterns: ["cenbii", "cenbii\\.eu"] },
      schematron: [],
      documentTypes: [],
    },
  ],
};

writeFileSync(outPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} (${registry.profiles.length} profiles)`);
