#!/usr/bin/env node
/**
 * Genera schemas/registry.json indexando los 65 tipos UBL 2.1 desde maindoc/.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const vendorUbl = path.join(root, "schemas", "vendor", "ubl-2.1");
const vendorJson = path.join(root, "schemas", "vendor", "ubl-2.1-json-v2.0");
const registryPath = path.join(root, "schemas", "registry.json");

const XSD_PATTERN = /^UBL-(.+)-2\.1\.xsd$/;
const JSON_PATTERN = /^UBL-(.+)-2\.1\.json$/;

function rel(fromRoot, absolute) {
  return path.relative(fromRoot, absolute).split(path.sep).join("/");
}

async function listDir(dir) {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

function findExample(files, type, ext) {
  const exact = files.find((f) => f === `UBL-${type}-2.1-Example.${ext}`);
  if (exact) return exact;
  return files.find((f) => f.startsWith(`UBL-${type}-2.1`) && f.endsWith(`.${ext}`));
}

async function main() {
  const xsdFiles = await listDir(path.join(vendorUbl, "xsd", "maindoc"));
  const jsonSchemaFiles = await listDir(
    path.join(vendorJson, "json-schema-model", "maindoc"),
  );
  const xmlExamples = await listDir(path.join(vendorUbl, "xml"));
  const jsonExamples = await listDir(path.join(vendorJson, "json-model"));

  const types = new Map();

  for (const file of xsdFiles) {
    const match = file.match(XSD_PATTERN);
    if (!match) continue;
    const documentType = match[1];
    types.set(documentType, { documentType });
  }

  for (const file of jsonSchemaFiles) {
    const match = file.match(JSON_PATTERN);
    if (!match) continue;
    const documentType = match[1];
    if (!types.has(documentType)) {
      types.set(documentType, { documentType });
    }
  }

  const documents = [...types.keys()].sort().map((documentType) => {
    const xsd = `vendor/ubl-2.1/xsd/maindoc/UBL-${documentType}-2.1.xsd`;
    const jsonModel = `vendor/ubl-2.1-json-v2.0/json-schema-model/maindoc/UBL-${documentType}-2.1.json`;

    const xmlExampleFile = findExample(xmlExamples, documentType, "xml");
    const jsonExampleFile = findExample(jsonExamples, documentType, "json");

    const entry = {
      documentType,
      xsd,
      jsonModel,
      xsdCommonDir: "vendor/ubl-2.1/xsd/common",
      jsonCommonDir: "vendor/ubl-2.1-json-v2.0/json-schema-model/common",
    };

    if (xmlExampleFile) {
      entry.exampleXml = `vendor/ubl-2.1/xml/${xmlExampleFile}`;
    }
    if (jsonExampleFile) {
      entry.exampleJson = `vendor/ubl-2.1-json-v2.0/json-model/${jsonExampleFile}`;
    }

    return entry;
  });

  if (documents.length === 0) {
    console.error("No documents found. Run: npm run schemas:fetch");
    process.exit(1);
  }

  const registry = {
    ublVersion: "2.1",
    generatedAt: new Date().toISOString(),
    documentCount: documents.length,
    documents,
  };

  await writeFile(registryPath, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Registry written: ${documents.length} document types → ${registryPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
