import { parseXml, parseXsdAsync, validate as validateAgainstXsd } from "xml-xsd-engine";
import type { SchemaModel } from "xml-xsd-engine";
import path from "node:path";
import { getRegistryDocument } from "./registry/index.js";
import { readSchemaText, schemasRoot } from "./schema-reader/index.js";
import type { ValidationIssue } from "./types.js";
import { UBL_VERSION } from "./types.js";
import { mapXsdIssues } from "./errors/map-xsd-issues.js";
import { ErrorCodes } from "./errors/codes.js";

const schemaCache = new Map<string, Promise<SchemaModel>>();

async function createXsdLoader(mainXsdRelative: string) {
  const mainXsdAbsDir = path.dirname(path.join(schemasRoot, mainXsdRelative));

  return async (location: string, _namespace: string): Promise<string | null> => {
    const candidates = [
      path.normalize(path.join(mainXsdAbsDir, location)),
      path.normalize(path.join(mainXsdAbsDir, "..", "common", path.basename(location))),
    ];

    for (const candidate of candidates) {
      const relative = path.relative(schemasRoot, candidate).split(path.sep).join("/");
      try {
        return await readSchemaText(relative);
      } catch {
        // try next candidate
      }
    }
    return null;
  };
}

async function loadXsdSchema(documentType: string): Promise<SchemaModel> {
  const cached = schemaCache.get(documentType);
  if (cached) {
    return cached;
  }

  const entry = getRegistryDocument(documentType);
  const promise = (async () => {
    const xsdSource = await readSchemaText(entry.xsd);
    const loader = await createXsdLoader(entry.xsd);
    return parseXsdAsync(xsdSource, loader);
  })();

  schemaCache.set(documentType, promise);
  return promise;
}

export async function preloadDocumentTypes(documentTypes: string[]): Promise<void> {
  await Promise.all(documentTypes.map((type) => loadXsdSchema(type)));
}

export function clearXsdSchemaCache(): void {
  schemaCache.clear();
}

export async function validateXmlDocument(
  xml: string,
  documentType: string,
): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const schema = await loadXsdSchema(documentType);
  let doc;
  try {
    doc = parseXml(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      errors: [
        {
          rule: ErrorCodes.XML_PARSE,
          code: ErrorCodes.XML_PARSE,
          message,
          severity: "error",
          stage: "schema",
          source: "oasis-ind1",
        },
      ],
      warnings: [],
    };
  }

  const result = validateAgainstXsd(doc, schema);
  const mapped = mapXsdIssues(result.errors, "schema");
  const mappedWarnings = mapXsdIssues(result.warnings, "schema");
  return {
    errors: mapped.errors,
    warnings: mappedWarnings.warnings,
  };
}

/** @deprecated Use validate() pipeline; kept for direct XSD access. */
export async function validateXml(xml: string, documentType: string) {
  const { errors, warnings } = await validateXmlDocument(xml, documentType);
  return {
    valid: errors.length === 0,
    documentType,
    ublVersion: UBL_VERSION,
    format: "xml" as const,
    errors,
    warnings,
  };
}
