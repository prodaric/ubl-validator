import { normalizeInput } from "./detect-document-type.js";
import type { ValidateOptions, ValidationResult } from "./types.js";
import { runPipeline } from "./pipeline/run-pipeline.js";

export async function validate(
  input: string | Record<string, unknown>,
  options: ValidateOptions = {},
): Promise<ValidationResult> {
  const { text, object } = normalizeInput(input);
  return runPipeline({ text, object }, options);
}

export async function preloadDocumentTypes(documentTypes: string[]): Promise<void> {
  const { preloadDocumentTypes: preloadXml } = await import("./validate-xml.js");
  const { preloadJsonValidators } = await import("./validate-json.js");
  await Promise.all([preloadXml(documentTypes), preloadJsonValidators(documentTypes)]);
}
