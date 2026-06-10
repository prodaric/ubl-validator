#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(readFileSync(path.join(root, "schemas/registry.json"), "utf8"));
const outDir = path.join(root, "tests/fixtures/minimal-xml");
const trivial = readFileSync(
  path.join(root, "schemas/vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example-Trivial.xml"),
  "utf8",
);

mkdirSync(outDir, { recursive: true });

for (const doc of registry.documents) {
  if (doc.exampleXml) continue;
  const outPath = path.join(outDir, `${doc.documentType}.xml`);
  if (existsSync(outPath)) continue;
  const body = trivial
    .replace(/<\?xml[^?]*\?>\s*/i, "")
    .replace(/\bInvoice\b/g, doc.documentType)
    .replace(/\bInvoiceLine\b/g, `${doc.documentType}Line`);
  writeFileSync(outPath, `<?xml version="1.0" encoding="UTF-8"?>\n${body}`, "utf8");
}
console.log(`Wrote minimal XML stubs to ${outDir}`);
