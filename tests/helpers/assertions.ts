import { expect } from "vitest";
import type { ValidationIssue, ValidationResult } from "../../src/types.js";

export function expectValidUblResult(
  result: ValidationResult,
  expected: { documentType: string; format: "xml" | "json" },
): void {
  expect(result.valid).toBe(true);
  expect(result.documentType).toBe(expected.documentType);
  expect(result.format).toBe(expected.format);
  expect(result.ublVersion).toBe("2.1");
  expect(result.errors).toEqual([]);
  expect(result.warnings ?? []).toEqual([]);
}

/** XSD / JSON Schema stage only (IND and profile may add separate issues). */
export function expectSchemaValidUblResult(
  result: ValidationResult,
  expected: { documentType: string; format: "xml" | "json" },
): void {
  expect(result.stages?.schema?.valid).toBe(true);
  expect(result.documentType).toBe(expected.documentType);
  expect(result.format).toBe(expected.format);
  expect(result.ublVersion).toBe("2.1");
  expect(result.errors.filter((e) => e.stage === "schema")).toEqual([]);
}

export function expectInvalidUblResult(result: ValidationResult): void {
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  for (const issue of result.errors) {
    expectIssueShape(issue);
  }
}

export function expectIssueShape(issue: ValidationIssue): void {
  expect(issue.rule).toEqual(expect.any(String));
  expect(issue.message).toEqual(expect.any(String));
  expect(["error", "warning"]).toContain(issue.severity);
}
