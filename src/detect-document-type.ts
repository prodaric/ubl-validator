import { isKnownDocumentType, UBL_DOCUMENT_TYPES } from "./registry/index.js";
import type { DetectDocumentTypeResult, UblFormat } from "./types.js";

const XML_ROOT_PATTERN =
  /<\s*(?:[\w.-]+:)?([A-Za-z][\w.-]*)\b[^>]*(?:xmlns(?::\w+)?\s*=\s*["'][^"']*ubl[^"']*["'][^>]*)?/;

export function inferFormat(input: string): "xml" | "json" {
  const trimmed = input.trimStart();
  if (trimmed.startsWith("<")) {
    return "xml";
  }
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }
  throw new Error("Unable to infer format: input must be XML or JSON.");
}

export function resolveFormat(format: UblFormat | undefined, input: string): "xml" | "json" {
  if (format && format !== "auto") {
    return format;
  }
  return inferFormat(input);
}

export function detectDocumentTypeFromXml(xml: string): string {
  const match = xml.match(XML_ROOT_PATTERN);
  if (!match) {
    throw new Error("Unable to detect UBL document type from XML root element.");
  }
  const root = match[1];
  if (!isKnownDocumentType(root)) {
    throw new Error(
      `Unknown UBL root element "${root}". Known types: ${UBL_DOCUMENT_TYPES.join(", ")}`,
    );
  }
  return root;
}

export function detectDocumentTypeFromJson(value: unknown): string {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("UBL JSON document must be a non-null object.");
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith("_")) {
      continue;
    }
    if (isKnownDocumentType(key)) {
      return key;
    }
  }

  throw new Error("Unable to detect UBL document type from JSON root property.");
}

export function detectDocumentType(
  input: string | Record<string, unknown>,
  format?: UblFormat,
): DetectDocumentTypeResult {
  if (typeof input === "string") {
    const resolved = resolveFormat(format, input);
    if (resolved === "xml") {
      return { documentType: detectDocumentTypeFromXml(input), format: "xml" };
    }
    const parsed = JSON.parse(input) as unknown;
    return { documentType: detectDocumentTypeFromJson(parsed), format: "json" };
  }

  return { documentType: detectDocumentTypeFromJson(input), format: "json" };
}

export function normalizeInput(input: string | Record<string, unknown>): {
  text: string;
  object?: Record<string, unknown>;
} {
  if (typeof input === "string") {
    return { text: input };
  }
  return { text: JSON.stringify(input), object: input };
}
