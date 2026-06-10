import {
  detectDocumentType,
  normalizeInput,
  resolveFormat,
} from "./detect-document-type.js";
import type { ValidateOptions, ValidationResult } from "./types.js";
import { validateJson } from "./validate-json.js";
import { validateXml } from "./validate-xml.js";

export async function validate(
  input: string | Record<string, unknown>,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const { text, object } = normalizeInput(input);
  const format =
    options.format && options.format !== "auto"
      ? options.format
      : typeof input === "string"
        ? resolveFormat(options.format, text)
        : "json";

  const documentType =
    options.documentType ??
    detectDocumentType(object ?? text, format === "json" && object ? "json" : format).documentType;

  if (format === "xml") {
    return validateXml(text, documentType);
  }

  return validateJson(object ?? text, documentType, {
    jsonVariant: options.jsonVariant,
  });
}

export async function preloadDocumentTypes(documentTypes: string[]): Promise<void> {
  const { preloadDocumentTypes: preloadXml } = await import("./validate-xml.js");
  const { preloadJsonValidators } = await import("./validate-json.js");
  await Promise.all([preloadXml(documentTypes), preloadJsonValidators(documentTypes)]);
}
