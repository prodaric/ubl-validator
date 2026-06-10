import { parseXml, parseXsdAsync, validate as validateAgainstXsd } from "xml-xsd-engine";
import type { SchemaModel } from "xml-xsd-engine";
import path from "node:path";
import { getRegistryDocument } from "./registry/index.js";
import { readSchemaText, schemasRoot } from "./schema-reader/index.js";
import type { ValidationIssue, ValidationResult } from "./types.js";
import { UBL_VERSION } from "./types.js";

const schemaCache = new Map<string, Promise<SchemaModel>>();

function mapXsdIssues(
  issues: Array<{ severity: string; message: string; path: string; line?: number; col?: number; code?: string }>,
): ValidationIssue[] {
  return issues.map((issue) => ({
    rule: issue.code ?? "XSD",
    message: issue.message,
    severity: issue.severity === "warning" ? "warning" : "error",
    path: issue.path,
    line: issue.line,
    col: issue.col,
  }));
}

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

export async function validateXml(
  xml: string,
  documentType: string,
): Promise<ValidationResult> {
  const schema = await loadXsdSchema(documentType);
  let doc;
  try {
    doc = parseXml(xml);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      valid: false,
      documentType,
      ublVersion: UBL_VERSION,
      format: "xml",
      errors: [{ rule: "XML_PARSE", message, severity: "error" }],
    };
  }

  const result = validateAgainstXsd(doc, schema);
  const errors = mapXsdIssues([...result.errors, ...result.warnings]);

  return {
    valid: result.valid,
    documentType,
    ublVersion: UBL_VERSION,
    format: "xml",
    errors,
  };
}
