import type { ErrorObject } from "ajv";
import type { ValidationIssue } from "../types.js";

export function mapAjvErrors(
  ajvErrors: ErrorObject[],
  stage: ValidationIssue["stage"] = "schema",
): ValidationIssue[] {
  return ajvErrors.map((error) => ({
    rule: error.keyword,
    code: error.keyword,
    message: error.message ?? "JSON Schema validation error",
    severity: "error" as const,
    path: error.instancePath || "/",
    stage,
    source: "oasis-json",
    schemaPath: error.schemaPath,
    params: error.params as Record<string, unknown> | undefined,
  }));
}
