#!/usr/bin/env node
/**
 * Verifica que los XML DIAN oficiales estén empaquetados en el repo (sin red).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "tests/fixtures/dian/SOURCE.json");
const xmlRoot = path.join(root, "tests/fixtures/dian/xml");

const CORE = [
  "Consumidor Final.xml",
  "CreditNote.xml",
  "DebitNote.xml",
  "Excluido de IVA.xml",
];

function countXmlFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countXmlFiles(full);
    } else if (entry.name.toLowerCase().endsWith(".xml")) {
      count += 1;
    }
  }
  return count;
}

if (!existsSync(sourcePath) || !existsSync(xmlRoot)) {
  console.error("Faltan fixtures DIAN empaquetados en tests/fixtures/dian/");
  console.error("Ejecuta npm run fixtures:dian:fetch y commitea los archivos generados.");
  process.exit(1);
}

for (const file of CORE) {
  if (!existsSync(path.join(xmlRoot, file))) {
    console.error(`Falta fixture DIAN core: ${file}`);
    process.exit(1);
  }
}

const meta = JSON.parse(readFileSync(sourcePath, "utf8"));
const xmlCount = countXmlFiles(xmlRoot);

if (xmlCount < CORE.length) {
  console.error(`Solo ${xmlCount} XML(s) DIAN; se esperan al menos ${CORE.length}.`);
  process.exit(1);
}

console.log(
  `✓ ${xmlCount} fixtures DIAN empaquetados (SOURCE: ${meta.documentVersion ?? "unknown"})`,
);
