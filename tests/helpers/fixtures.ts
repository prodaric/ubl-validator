import { readFileSync } from "node:fs";
import path from "node:path";
import { getAllRegistryDocuments } from "../../src/registry/index.js";
import type { RegistryDocument } from "../../src/types.js";
import { schemasRoot } from "../../src/schema-reader/node-reader.js";

export { schemasRoot };

export function readSchemaFixture(relativePath: string): string {
  return readFileSync(path.join(schemasRoot, relativePath), "utf8");
}

export function readJsonFixture<T = unknown>(relativePath: string): T {
  return JSON.parse(readSchemaFixture(relativePath)) as T;
}

export const invoiceXml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Invoice-2.1-Example.xml");
export const creditNoteXml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-CreditNote-2.1-Example.xml");
export const orderXml = readSchemaFixture("vendor/ubl-2.1/xml/UBL-Order-2.1-Example.xml");
export const invoiceJson = readSchemaFixture(
  "vendor/ubl-2.1-json-v2.0/json-model/UBL-Invoice-2.1-Example.json",
);
export const invoiceJsonObject = readJsonFixture<Record<string, unknown>>(
  "vendor/ubl-2.1-json-v2.0/json-model/UBL-Invoice-2.1-Example.json",
);

export function documentsWithOfficialExamples(): RegistryDocument[] {
  return getAllRegistryDocuments().filter((doc) => doc.exampleXml && doc.exampleJson);
}
