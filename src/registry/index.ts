import { readFileSync } from "node:fs";
import path from "node:path";
import { schemasRoot } from "../schema-reader/node-reader.js";
import type { RegistryDocument, SchemaRegistry } from "../types.js";

let cachedRegistry: SchemaRegistry | null = null;

export function loadRegistry(): SchemaRegistry {
  if (!cachedRegistry) {
    const registryPath = path.join(schemasRoot, "registry.json");
    cachedRegistry = JSON.parse(readFileSync(registryPath, "utf8")) as SchemaRegistry;
  }
  return cachedRegistry;
}

export function setRegistry(registry: SchemaRegistry): void {
  cachedRegistry = registry;
}

export const registry = new Proxy({} as SchemaRegistry, {
  get(_target, prop) {
    return Reflect.get(loadRegistry(), prop);
  },
});

export function getUblDocumentTypes(): string[] {
  return loadRegistry().documents.map((d) => d.documentType);
}

export const UBL_DOCUMENT_TYPES = getUblDocumentTypes();

const byType = (): Map<string, RegistryDocument> =>
  new Map(loadRegistry().documents.map((doc) => [doc.documentType, doc]));

export function getRegistryDocument(documentType: string): RegistryDocument {
  const doc = byType().get(documentType);
  if (!doc) {
    throw new Error(
      `Unknown UBL document type "${documentType}". Expected one of ${loadRegistry().documentCount} registered types.`,
    );
  }
  return doc;
}

export function isKnownDocumentType(documentType: string): boolean {
  return byType().has(documentType);
}

export function getAllRegistryDocuments(): RegistryDocument[] {
  return loadRegistry().documents;
}
